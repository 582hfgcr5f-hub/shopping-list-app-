const HOUSEHOLD='fonfeder-home';
export default async function handler(req,res){
 const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;if(!base||!key)return res.status(500).json({error:'Sync environment is not configured'});
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},allowed=new Set(['supermarket','costco']);
 try{
  const channel=String(req.query?.channel||req.body?.channel||'');if(!allowed.has(channel))return res.status(400).json({error:'Invalid channel'});
  const r0=await fetch(`${base}/rest/v1/shopping_state?household_id=eq.${HOUSEHOLD}&select=household_id,data,updated_at&limit=1`,{headers});const t0=await r0.text();if(!r0.ok)return res.status(r0.status).json({error:t0||'Read failed'});const rows=t0?JSON.parse(t0):[],row=rows[0]||null,root=(row?.data&&typeof row.data==='object')?row.data:{};
  if(req.method==='GET')return res.status(200).json(root.channels?.[channel]||null);
  if(req.method==='POST'){
   const state=req.body?.data;if(!state||typeof state!=='object')return res.status(400).json({error:'Missing data'});const now=new Date().toISOString();const next={...root,version:10,channels:{...(root.channels||{}),[channel]:{...state,updated_at:state.updated_at||now}}};
   const r=await fetch(`${base}/rest/v1/shopping_state?on_conflict=household_id`,{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({household_id:HOUSEHOLD,data:next,updated_at:now})});const text=await r.text();if(!r.ok)return res.status(r.status).json({error:text||'Write failed'});return res.status(200).json({ok:true,updated_at:now});
  }
  res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});
 }catch(e){return res.status(500).json({error:e?.message||String(e)})}
}