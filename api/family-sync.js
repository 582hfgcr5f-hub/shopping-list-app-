const HOUSEHOLD='fonfeder-home';
export default async function handler(req,res){
 const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!base||!key)return res.status(500).json({error:'Sync environment is not configured'});
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
 try{
  if(req.method==='GET'){
   const r=await fetch(`${base}/rest/v1/shopping_state?household_id=eq.${HOUSEHOLD}&select=household_id,data,updated_at&limit=1`,{headers});
   const text=await r.text();if(!r.ok)return res.status(r.status).json({error:text||'Read failed'});
   const rows=text?JSON.parse(text):[];return res.status(200).json(rows[0]||null);
  }
  if(req.method==='POST'){
   const state=req.body?.data;if(!state||typeof state!=='object')return res.status(400).json({error:'Missing data'});
   const updated_at=state.updated_at||new Date().toISOString();
   const r=await fetch(`${base}/rest/v1/shopping_state?on_conflict=household_id`,{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({household_id:HOUSEHOLD,data:state,updated_at})});
   const text=await r.text();if(!r.ok)return res.status(r.status).json({error:text||'Write failed'});
   return res.status(200).json({ok:true,updated_at});
  }
  res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});
 }catch(e){return res.status(500).json({error:e?.message||String(e)})}
}