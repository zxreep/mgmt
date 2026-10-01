export async function api(path, options={}) {
  const response=await fetch(`/api${path}`,{credentials:'include',headers:{'Content-Type':'application/json',...options.headers},...options,body:options.body&&typeof options.body!=='string'?JSON.stringify(options.body):options.body});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const error=new Error(data.message||'Request failed');error.status=response.status;throw error;}return data;
}
export function cx(...classes){return classes.filter(Boolean).join(' ')}
export function fmtDate(value,withTime=true){if(!value)return '—';return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',...(withTime?{hour:'2-digit',minute:'2-digit'}:{year:'numeric'})}).format(new Date(value));}
export function phoneForWhatsApp(value){let n=String(value||'').replace(/\D/g,'');if(n.length===10)n=`91${n}`;return n;}
export function interpolate(text,lead){return String(text||'').replace(/\{(name|school|district|application)\}/gi,(_,key)=>({name:lead.contactPerson||'there',school:lead.schoolName,district:lead.district,application:lead.applicationNo}[key.toLowerCase()]||''));}
