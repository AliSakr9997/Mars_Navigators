"""Same-origin mission sessions and interactive crew provisioning."""
import argparse
import getpass
import hashlib
import hmac
import os
from pathlib import Path
import secrets
import sqlite3
import time
from contextlib import contextmanager, closing

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, SecretStr

COOKIE = "ares_mission"
LIFETIME = 12 * 3600
router = APIRouter(prefix="/api/auth")


@contextmanager
def database():
    path = Path(os.environ.get("ARES_AUTH_DB", Path.home() / ".ares-gale" / "crew.sqlite3"))
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    with closing(sqlite3.connect(path, timeout=10)) as db, db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS crew (
                identity TEXT PRIMARY KEY, salt BLOB NOT NULL, verifier BLOB NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                digest BLOB PRIMARY KEY, identity TEXT NOT NULL, expires INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS attempts (
                identity TEXT PRIMARY KEY, since INTEGER NOT NULL, count INTEGER NOT NULL
            );
        """)
        yield db


def derive(password, salt):
    return hashlib.scrypt(password.encode(), salt=salt, n=2**15, r=8, p=1, maxmem=64*1024**2)


def add_crew(identity, password):
    identity = identity.strip().casefold()
    if not 1 <= len(identity) <= 254 or not 12 <= len(password) <= 256:
        raise ValueError("Use an identifier of 1–254 characters and a password of 12–256 characters.")
    salt = secrets.token_bytes(16)
    with database() as db:
        db.execute("INSERT INTO crew VALUES (?, ?, ?)", (identity, salt, derive(password, salt)))


class Credentials(BaseModel):
    identity: str = Field(min_length=1, max_length=254)
    password: SecretStr = Field(min_length=1, max_length=256)


def browser_action(request: Request):
    if request.headers.get("x-mission-action") != "1" or request.headers.get("sec-fetch-site") == "cross-site":
        raise HTTPException(403, "Use the mission access page.")


def digest(token):
    return hashlib.sha256(token.encode()).digest()


@router.get("/session")
def session(request: Request, response: Response):
    response.headers["Cache-Control"] = "no-store"
    token = request.cookies.get(COOKIE)
    if token:
        with database() as db:
            row = db.execute("SELECT expires FROM sessions WHERE digest=? AND expires>?",
                             (digest(token), time.time())).fetchone()
            if row:
                return {"authenticated": True, "expires": row[0]}
    return {"authenticated": False}


@router.post("/login", dependencies=[Depends(browser_action)])
def login(body: Credentials, request: Request, response: Response):
    now = int(time.time())
    identity = body.identity.strip().casefold()
    with database() as db:
        db.execute("DELETE FROM attempts WHERE since<=?", (now - 600,))
        db.execute("DELETE FROM sessions WHERE expires<=?", (now,))
        if not db.execute("SELECT 1 FROM crew LIMIT 1").fetchone():
            raise HTTPException(503, "Crew access has not been configured yet.")
        db.execute("""INSERT INTO attempts VALUES (?, ?, 1)
                      ON CONFLICT(identity) DO UPDATE SET count=count+1""", (identity, now))
        count = db.execute("SELECT count FROM attempts WHERE identity=?", (identity,)).fetchone()[0]
        row = db.execute("SELECT salt, verifier FROM crew WHERE identity=?", (identity,)).fetchone()
    if count > 10:
        raise HTTPException(429, "Too many attempts. Try again in ten minutes.")
    supplied = derive(body.password.get_secret_value(), row[0] if row else bytes(16))
    if not row or not hmac.compare_digest(supplied, row[1]):
        raise HTTPException(401, "The username or password is incorrect.")
    token = secrets.token_urlsafe(32)
    expires = now + LIFETIME
    with database() as db:
        db.execute("DELETE FROM attempts WHERE identity=?", (identity,))
        db.execute("DELETE FROM sessions WHERE digest=?", (digest(request.cookies.get(COOKIE, "")),))
        db.execute("INSERT INTO sessions VALUES (?, ?, ?)", (digest(token), identity, expires))
    response.headers["Cache-Control"] = "no-store"
    response.set_cookie(COOKIE, token, max_age=LIFETIME, httponly=True, secure=True,
                        samesite="strict", path="/api/auth")
    return {"authenticated": True, "expires": expires}


@router.post("/logout", dependencies=[Depends(browser_action)])
def logout(request: Request, response: Response):
    with database() as db:
        db.execute("DELETE FROM sessions WHERE digest=?", (digest(request.cookies.get(COOKIE, "")),))
    response.delete_cookie(COOKIE, path="/api/auth", httponly=True, secure=True, samesite="strict")
    response.headers["Cache-Control"] = "no-store"
    return {"authenticated": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add a crew login to this mission installation.")
    parser.add_argument("identity", help="Username or email address")
    identity = parser.parse_args().identity
    password = getpass.getpass("New password (at least 12 characters): ")
    if password != getpass.getpass("Confirm password: "):
        parser.exit(1, "Passwords do not match.\n")
    try:
        add_crew(identity, password)
    except (ValueError, sqlite3.IntegrityError) as error:
        parser.exit(1, f"Could not create login: {error}\n")
    print("Crew login created.")
