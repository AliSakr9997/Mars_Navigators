import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Fingerprint } from 'lucide-react';
import {access, type Session} from './access';

export function AccessPanel({onAccess,initializing}: {onAccess:(s:Session)=>void;initializing:boolean}) {
  const [show,setShow]=useState(false);
  const [working,setWorking]=useState(false);
  const [error,setError]=useState('');
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{heading.current?.focus({preventScroll:true});},[]);
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(working || initializing) return;
    const form=e.currentTarget;
    const fields=new FormData(form);
    const identity=String(fields.get('identity')??'').trim();
    if(!identity){setError('Enter your username or email.');return;}
    setWorking(true);setError('');
    try {
      const result=await access('login',{identity,password:String(fields.get('password')??'')});
      if(!result.authenticated) throw new Error('Sign-in could not be verified.');
      // Confirm the browser accepted the secure cookie before opening the planner.
      const confirmed=await access('session');
      if(!confirmed.authenticated) throw new Error('Your browser could not save this session. Use HTTPS or localhost and allow cookies.');
      form.reset();onAccess(confirmed);
    } catch(problem) {setError((problem as Error).message);}
    finally {setWorking(false);}
  }
  return <section className={'access-card'+(initializing?' exiting':'')} aria-labelledby="access-title">
    <div className="access-mark" aria-hidden="true"><Fingerprint size={30} strokeWidth={1.25}/></div>
    <h1 tabIndex={-1} ref={heading} id="access-title">MISSION ACCESS</h1>
    <p>Authenticate to begin your Mars exploration mission.</p>
    <form onSubmit={submit} aria-busy={working || initializing}>
      <label htmlFor="crew-identity">Username or Email</label>
      <input id="crew-identity" name="identity" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254} disabled={initializing}/>
      <label htmlFor="crew-secret">Password</label>
      <div className="secret-field"><input id="crew-secret" name="password" type={show?'text':'password'} autoComplete="current-password" required maxLength={256} disabled={initializing}/>
        <button type="button" aria-label={show?'Hide password':'Show password'} aria-pressed={show} onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
      {error&&<div role="alert" className="access-error">{error}</div>}
      <button type="submit" className="access-submit" disabled={working||initializing}>{working?'Authenticating…':'Log in'}<ArrowRight size={17}/></button>
    </form>
  </section>;
}
