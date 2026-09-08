(()=>{setTimeout(async()=>{
 const URL='https://jaigrtytkwunnhjyyedn.supabase.co',KEY='sb_publishable_Y6MGLD8vjitjT8b-CmLA-w_rLpAYj0I',HOUSE='fonfeder-home';
 const KEYS=['shopV6','costcoShopV2','shoppingFavoritesV1'];let applying=false,timer=null,lastRemote='',busy=false;
 function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
 function snap(){const d={};KEYS.forEach(k=>d[k]=read(k));return d}
 function norm(d){if(!d||typeof d!=='object')return{};const x={...d};if(x.shopV6==null&&x.shopV2!=null)x.shopV6=x.shopV2;delete x.shopV2;return x}
 function merge(a,b){a=norm(a);b=norm(b);const o={shopV6:{...(b.shopV6||{}),...(a.shopV6||{})},costcoShopV2:{...(b.costcoShopV2||{}),...(a.costcoShopV2||{})}};const af=a.shoppingFavoritesV1||{},bf=b.shoppingFavoritesV1||{};o.shoppingFavoritesV1={supermarket:[...new Set([...(bf.supermarket||[]),...(af.supermarket||[])])],costco:[...new Set([...(bf.costco||[]),...(af.costco||[])])]};return o}
 function sig(x){return JSON.stringify(x||{})}
 function status(t){let p=document.querySelector('.syncPill');if(p)p.textContent=t}
 function redraw(){try{renderShop();renderCats();updateCount()}catch{}document.dispatchEvent(new CustomEvent('family-sync-applied'))}
 function apply(d){applying=true;KEYS.forEach(k=>{if(d[k]!==undefined)localStorage.setItem(k,JSON.stringify(d[k]))});applying=false;redraw()}
 const headers={'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Prefer':'return=representation'};
 async function remote(){const r=await fetch(URL+'/rest/v1/shopping_state?household_id=eq.'+encodeURIComponent(HOUSE)+'&select=data,updated_at',{headers,cache:'no-store'});if(!r.ok)throw Error('read');const row=(await r.json())[0];if(row)row.data=norm(row.data);return row}
 async function write(data){status('Syncing…');const r=await fetch(URL+'/rest/v1/shopping_state?household_id=eq.'+encodeURIComponent(HOUSE),{method:'PATCH',headers,body:JSON.stringify({data:data,updated_at:new Date().toISOString()})});if(!r.ok)throw Error('write');const row=(await r.json())[0];lastRemote=sig(norm(row?.data||data));status('Family Sync')}
 async function sync(){if(applying||busy)return;busy=true;try{const r=await remote();const combined=merge(snap(),r?.data||{});if(sig(combined)!==sig(snap()))apply(combined);if(sig(combined)!==sig(r?.data||{}))await write(combined);else{lastRemote=sig(r?.data||{});status('Family Sync')}}catch{status('Sync issue')}finally{busy=false}}
 function queue(){clearTimeout(timer);timer=setTimeout(sync,90)}
 try{await sync();const original=Storage.prototype.setItem;if(!window.__familySyncStorageWrapped){Storage.prototype.setItem=function(k,v){original.call(this,k,v);if(KEYS.includes(k)&&!applying)queue()};window.__familySyncStorageWrapped=true}
 setInterval(async()=>{if(busy)return;try{const r=await remote(),rs=sig(r?.data||{});if(rs!==lastRemote){lastRemote=rs;const combined=merge(snap(),r.data);if(sig(combined)!==sig(snap()))apply(combined);if(sig(combined)!==rs)queue()}}catch{}},500);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});window.addEventListener('focus',sync);window.__familySync={push:sync,getRemote:remote,household:HOUSE};
 }catch(e){status('Sync issue')}
},350)})();