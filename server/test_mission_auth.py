import os
import secrets
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient
from mission_auth import COOKIE, add_crew, database, router


class CrewAccessTest(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        path = patch.dict(os.environ, ARES_AUTH_DB=str(Path(folder.name) / "crew.db"))
        path.start()
        self.addCleanup(path.stop)
        app = FastAPI()
        app.include_router(router)
        self.client = TestClient(app, base_url="https://mission.test")
        self.addCleanup(self.client.close)
        self.identity = secrets.token_hex(8)
        self.password = secrets.token_urlsafe(24)
        self.action = {"X-Mission-Action": "1"}

    def login(self, password=None):
        return self.client.post("/api/auth/login", headers=self.action,
                                json={"identity": self.identity, "password": password or self.password})

    def test_crew_session_and_revocation(self):
        self.assertEqual(self.login().status_code, 503)
        add_crew(self.identity, self.password)
        self.assertEqual(self.login("invalid").status_code, 401)
        self.assertEqual(self.login().status_code, 200)
        token = self.client.cookies.get(COOKIE)
        self.assertTrue(self.client.get("/api/auth/session").json()["authenticated"])
        self.assertEqual(self.client.post("/api/auth/logout").status_code, 403)
        self.assertEqual(self.client.post("/api/auth/logout", headers=self.action).status_code, 200)
        self.client.cookies.set(COOKIE, token)
        self.assertFalse(self.client.get("/api/auth/session").json()["authenticated"])

    def test_expired_session_and_rate_limit(self):
        add_crew(self.identity, self.password)
        self.login()
        with database() as db:
            db.execute("UPDATE sessions SET expires=0")
        self.assertFalse(self.client.get("/api/auth/session").json()["authenticated"])
        for _ in range(10):
            self.assertEqual(self.login("invalid").status_code, 401)
        self.assertEqual(self.login().status_code, 429)
