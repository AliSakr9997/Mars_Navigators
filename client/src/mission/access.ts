export type Session = {authenticated:boolean; expires?:number};

export async function access(action:'session'|'login'|'logout', body?:{identity:string;password:string}):Promise<Session> {
  const controller=new AbortController();
  const timer=window.setTimeout(()=>controller.abort(),8000);
  try {
    const response=await fetch('/api/auth/'+action,{
      method:action==='session'?'GET':'POST', credentials:'same-origin',cache:'no-store',
      signal:controller.signal,
      headers:action==='session'?{}:{'Content-Type':'application/json','X-Mission-Action':'1'},
      body:body?JSON.stringify(body):undefined,
    });
    const data=await response.json().catch(()=>null);
    if(!response.ok || typeof data?.authenticated!=='boolean') {
      throw new Error(typeof data?.detail==='string'?data.detail:'Mission access is unavailable. Try again shortly.');
    }
    return data;
  } catch(error) {
    if(error instanceof TypeError || (error instanceof Error && error.name==='AbortError')) {
      throw new Error('Mission access could not be reached. Check your connection and try again.');
    }
    throw error;
  } finally {clearTimeout(timer);}
}
