(()=>{
 setTimeout(()=>{
  if(typeof $!=='function'||typeof N!=='function')return;
  let itemStore=localStorage.getItem('itemStoreV2')||'supermarket',shoppingStore=localStorage.getItem('shoppingStoreV1')||'supermarket',shoppingMode='buy';
  let costcoItems=(()=>{try{return JSON.parse(localStorage.getItem('costcoItemsV1')||'[]')}catch{return[]}})();
  let costcoShop=(()=>{try{return JSON.parse(localStorage.getItem('costcoShopV2')||'{}')}catch{return{}}})();
  const saveCostco=()=>{localStorage.setItem('costcoItemsV1',JSON.stringify(costcoItems));localStorage.setItem('costcoShopV2',JSON.stringify(costcoShop))};
  const style=document.createElement('style');style.textContent=`.storeTabs{display:flex;background:#edf1ee;border-radius:14px;padding:4px;gap:4px;margin:10px 0 12px}.storeTabs button{flex:1;border:0;background:transparent;border-radius:10px;padding:11px 7px;font-weight:900;color:#233129;font-size:14px}.storeTabs button.on{background:#0d7a43;color:#fff;box-shadow:0 1px 5px #0001}.storeHint{font-size:12px;color:#748077;margin:-3px 2px 8px}`;document.head.appendChild(style);
  const tabs=(scope,active)=>`<div class="storeTabs" data-store-scope="${scope}"><button data-store="supermarket" class="${active==='supermarket'?'on':''}">🛒 Supermarket</button><button data-store="costco" class="${active==='costco'?'on':''}">🏬 Costco</button></div>`;
  const ic=$('items')?.querySelector('.card'),sc=$('shopping')?.querySelector('.card');
  if(ic&&!ic.querySelector('[data-store-scope="items"]')){const h=ic.querySelector('.hdr');h.insertAdjacentHTML('afterend',tabs('items',itemStore));h.nextElementSibling.insertAdjacentHTML('afterend','<div class="storeHint" id="itemStoreHint"></div>')}
  if(sc&&!sc.querySelector('[data-store-scope="shopping"]'))sc.querySelector('.hdr').insertAdjacentHTML('afterend',tabs('shopping',shoppingStore));
  if($('customBtn'))$('customBtn').style.display='none';
  const baseRenderCats=renderCats,baseRenderShop=renderShop,baseToggle=toggleShop,baseDel=delShop,baseQty=window.__shopQtyChange,baseUpdate=updateCount,baseOpenItem=openItemModal;
  const storeQty={};
  function costcoRows(){
   $('backCats').classList.remove('show');$('itemTitle').textContent='Costco Items';$('cats').style.display='none';$('itemRows').style.display='block';
   $('itemRows').innerHTML=costcoItems.map(i=>{const k=N(i[0]),q=storeQty[k]||1;return `<div class="itemrow"><div class="pic">${i[3]?`<img src="${i[3]}">`:i[2]||'🏬'}</div><div class="grow"><b>${esc(i[0])}</b><span class="sub">${esc(i[1]||'Costco')}</span></div><div class="itemAddWrap"><div class="itemQty"><button onclick="__costcoQty('${js(i[0])}',-1)">−</button><span data-cq="${attr(k)}">${q}</span><button onclick="__costcoQty('${js(i[0])}',1)">+</button></div><button class="pill" onclick="__costcoAdd('${js(i[0])}')">Add</button></div></div>`}).join('')||'<div class="sub" style="padding:20px 4px">No Costco items yet. Tap + Add Item to build your Costco item list.</div>';
   const hint=$('itemStoreHint');if(hint)hint.textContent='Costco has its own separate item list.';
  }
  window.__costcoQty=(n,d)=>{const k=N(n);storeQty[k]=Math.max(1,(storeQty[k]||1)+d);const e=document.querySelector(`[data-cq="${CSS.escape(k)}"]`);if(e)e.textContent=storeQty[k]};
  window.__costcoAdd=n=>{const k=N(n),i=costcoItems.find(x=>N(x[0])===k),q=storeQty[k]||1,old=costcoShop[k];if(!i)return;costcoShop[k]={name:i[0],cat:i[1]||'Costco',photo:i[2]||'🏬',customPhoto:i[3]||'',qty:(old?.qty||0)+q,selected:false};storeQty[k]=1;saveCostco();updateCount()};
  renderCats=function(){if(itemStore==='costco'){costcoRows();return}baseRenderCats();const hint=$('itemStoreHint');if(hint)hint.textContent='Your existing supermarket items stay here.'};
  renderShop=function(mode='buy'){shoppingMode=mode;$('buyTab').classList.toggle('on',mode==='buy');$('selTab').classList.toggle('on',mode==='sel');if(shoppingStore==='supermarket')return baseRenderShop(mode);const a=Object.values(costcoShop).filter(x=>!!x.selected===(mode==='sel'));$('shopRows').innerHTML=a.map(x=>`<div class="shoprow"><button class="check ${x.selected?'on':''}" onclick="toggleShop('${js(x.name)}')">${x.selected?'✓':''}</button><div class="pic">${x.customPhoto?`<img src="${x.customPhoto}">`:x.photo}</div><div class="grow"><b>${esc(x.name)}</b><span class="sub">Quantity ${x.qty||1}</span></div><div class="shopQty"><button onclick="__shopQtyChange('${js(x.name)}',-1)">−</button><span>${x.qty||1}</span><button onclick="__shopQtyChange('${js(x.name)}',1)">+</button></div><button class="btn" onclick="delShop('${js(x.name)}')">×</button></div>`).join('')||'<div class="sub" style="padding:18px 4px">Your Costco shopping list is empty.</div>';updateCount()};
  toggleShop=function(n){if(shoppingStore==='supermarket')return baseToggle(n);let x=costcoShop[N(n)];if(x){x.selected=!x.selected;saveCostco();renderShop(shoppingMode)}};
  delShop=function(n){if(shoppingStore==='supermarket')return baseDel(n);delete costcoShop[N(n)];saveCostco();renderShop(shoppingMode);updateCount()};
  window.__shopQtyChange=function(n,d){if(shoppingStore==='supermarket')return baseQty&&baseQty(n,d);let x=costcoShop[N(n)];if(x){x.qty=Math.max(1,(x.qty||1)+d);saveCostco();renderShop(shoppingMode)}};
  updateCount=function(){const a=Object.values(shop).filter(x=>!x.selected).length,b=Object.values(costcoShop).filter(x=>!x.selected).length;$('count').textContent=`${a+b} items`};
  document.querySelectorAll('[data-store-scope="items"] button').forEach(b=>b.onclick=()=>{itemStore=b.dataset.store;localStorage.setItem('itemStoreV2',itemStore);document.querySelectorAll('[data-store-scope="items"] button').forEach(x=>x.classList.toggle('on',x.dataset.store===itemStore));$('search').value='';selectedCat=null;renderCats()});
  document.querySelectorAll('[data-store-scope="shopping"] button').forEach(b=>b.onclick=()=>{shoppingStore=b.dataset.store;localStorage.setItem('shoppingStoreV1',shoppingStore);document.querySelectorAll('[data-store-scope="shopping"] button').forEach(x=>x.classList.toggle('on',x.dataset.store===shoppingStore));renderShop(shoppingMode)});
  $('buyTab').onclick=()=>renderShop('buy');$('selTab').onclick=()=>renderShop('sel');
  $('addItemBtn').onclick=()=>{openItemModal();if(itemStore==='costco'){$('newCat').innerHTML='<option>Costco</option>'}};
  $('saveItem').onclick=()=>{const n=$('newName').value.trim();if(!n)return;if(itemStore==='costco'){let i=costcoItems.find(x=>N(x[0])===N(n));if(!i){i=[n,'Costco','🏬',photoData];costcoItems.push(i)}else if(photoData)i[3]=photoData;saveCostco();closeModal('itemModal');renderCats();return}let i=items.find(x=>N(x[0])===N(n)),c=$('newCat').value;if(!i){i=[n,c,'🛒',photoData];items.push(i);custom.push(i);save('customV2',custom)}else if(photoData)i[3]=photoData;addShop(n,q);closeModal('itemModal');nav('items');selectedCat=c;renderCats()};
  renderCats();renderShop('buy');updateCount();
 },0);
})();