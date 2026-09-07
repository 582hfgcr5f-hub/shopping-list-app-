setTimeout(()=>{
 if(typeof items==='undefined'||!document.getElementById('shopping'))return;
 const CART_KEY='costcoCartV1',SAVED_KEY='costcoSavedV1';
 let costcoCart=load(CART_KEY,{}),costcoSaved=load(SAVED_KEY,[]),activeStore='supermarket',costcoCat='All';
 const card=document.querySelector('#shopping .card'),hdr=card?.querySelector('.hdr'),seg=document.querySelector('#shopping .seg'),rows=$('shopRows'),customBtn=$('customBtn');
 if(!card||!hdr||!seg||!rows)return;
 const style=document.createElement('style');style.textContent=`
 .storeTabs{display:flex;background:#edf1ee;border-radius:14px;padding:4px;gap:4px;margin:12px 0}.storeTabs button{flex:1;border:0;background:transparent;padding:11px 8px;border-radius:11px;font-weight:900;color:#26352c}.storeTabs button.on{background:#0d7a43;color:#fff;box-shadow:0 1px 5px #0001}.costcoPanel{display:none}.costcoPanel.on{display:block}.costcoAdd{display:flex;gap:8px;align-items:center;margin:10px 0}.costcoAdd input{margin:0;min-width:0}.costcoAdd button{flex:0 0 auto}.costcoCats{display:flex;gap:7px;overflow-x:auto;padding:2px 0 8px}.costcoCats button{border:0;background:#edf1ee;border-radius:18px;padding:8px 11px;font-weight:800;white-space:nowrap;color:#405047}.costcoCats button.on{background:#0d7a43;color:#fff}.costcoRow{display:flex;align-items:center;gap:9px;padding:11px 3px;border-bottom:1px solid #edf0ed}.costcoRow.checked .costcoName{text-decoration:line-through;color:#8a958e}.costcoName{font-weight:800}.costcoQty{display:flex;align-items:center;gap:5px}.costcoQty button{width:28px;height:28px;border:0;border-radius:50%;background:#e8f4eb;color:#0d7a43;font-weight:900;font-size:16px}.costcoQty span{min-width:20px;text-align:center;font-size:13px;font-weight:850}.clearCostco{width:100%;margin-top:12px;background:#e8f5eb;color:#0d7a43;border:0;border-radius:13px;padding:11px;font-weight:900}.savedCostco{border:1px solid #e2e8e3;border-radius:14px;padding:12px;margin-top:12px}.savedCostco h4{margin:0 0 4px}.savedCostco .sub{display:block;margin-bottom:10px}.savedChips{display:flex;gap:7px;flex-wrap:wrap}.savedChips button{border:0;border-radius:18px;background:#edf1ee;padding:8px 10px;font-weight:800;color:#314139}.storeSubtitle{font-size:12px;color:#748077;margin-top:2px}@media(max-width:430px){.storeTabs button{padding:10px 5px;font-size:13px}.costcoAdd{gap:6px}.costcoQty button{width:26px;height:26px}}
 `;document.head.appendChild(style);
 const tabs=document.createElement('div');tabs.className='storeTabs';tabs.innerHTML='<button class="on" data-store="supermarket">🛒 Supermarket</button><button data-store="costco">🏬 Costco</button>';hdr.insertAdjacentElement('afterend',tabs);
 const subtitle=document.createElement('div');subtitle.className='storeSubtitle';subtitle.textContent='Keep your lists organized and ready.';hdr.appendChild(subtitle);
 const panel=document.createElement('div');panel.className='costcoPanel';panel.innerHTML=`<div class="costcoAdd"><input id="costcoInput" list="costcoChoices" placeholder="Add an item to your Costco list..."><datalist id="costcoChoices"></datalist><button class="btn green" id="costcoAddBtn">Add</button></div><div class="costcoCats" id="costcoCats"></div><div id="costcoRows"></div><button class="clearCostco" id="clearCostco">🗑 Clear Checked Items</button><div class="savedCostco"><h4>↻ Saved Costco Items</h4><span class="sub">Quickly add items you buy often.</span><div class="savedChips" id="savedCostco"></div></div>`;rows.insertAdjacentElement('afterend',panel);
 function persistCostco(){save(CART_KEY,costcoCart);save(SAVED_KEY,costcoSaved)}
 function itemMeta(name){return items.find(x=>N(x[0])===N(name))||[name,'Other','🛒']}
 function rebuildChoices(){const dl=$('costcoChoices');if(dl)dl.innerHTML=items.map(i=>`<option value="${attr(i[0])}">${attr(i[1])}</option>`).join('')}
 function categories(){return ['All',...new Set(Object.values(costcoCart).map(x=>x.cat).filter(Boolean))]}
 function renderCostco(){
   rebuildChoices();
   $('costcoCats').innerHTML=categories().map(c=>`<button class="${c===costcoCat?'on':''}" onclick="window.__setCostcoCat('${js(c)}')">${esc(c)}</button>`).join('');
   const arr=Object.values(costcoCart).filter(x=>costcoCat==='All'||x.cat===costcoCat);
   $('costcoRows').innerHTML=arr.map(x=>`<div class="costcoRow ${x.selected?'checked':''}"><button class="check ${x.selected?'on':''}" onclick="window.__toggleCostco('${js(x.name)}')">${x.selected?'✓':''}</button><div class="pic">${x.customPhoto?`<img src="${x.customPhoto}">`:x.photo||'🛒'}</div><div class="grow"><div class="costcoName">${esc(x.name)}</div><span class="sub">${esc(x.cat||'Other')}</span></div><div class="costcoQty"><button onclick="window.__costcoQty('${js(x.name)}',-1)">−</button><span>${x.qty||1}</span><button onclick="window.__costcoQty('${js(x.name)}',1)">+</button></div><button class="btn" onclick="window.__deleteCostco('${js(x.name)}')">×</button></div>`).join('')||'<div class="sub" style="padding:14px 2px">Your Costco list is empty.</div>';
   const saved=costcoSaved.filter(n=>!costcoCart[N(n)]);
   $('savedCostco').innerHTML=saved.map(n=>`<button onclick="window.__addSavedCostco('${js(n)}')">+ ${esc(n)}</button>`).join('')||'<span class="sub">Items you add to Costco will be saved here for next time.</span>';
   updateCount();
 }
 function addCostco(name,qty=1){name=(name||'').trim();if(!name)return;const m=itemMeta(name),key=N(name),cur=costcoCart[key];costcoCart[key]={name:m[0],cat:m[1],photo:m[2],customPhoto:m[3]||'',qty:(cur?.qty||0)+qty,selected:false};if(!costcoSaved.some(x=>N(x)===key))costcoSaved.push(m[0]);persistCostco();renderCostco();const input=$('costcoInput');if(input)input.value=''}
 window.__setCostcoCat=c=>{costcoCat=c;renderCostco()};
 window.__toggleCostco=name=>{const x=costcoCart[N(name)];if(!x)return;x.selected=!x.selected;persistCostco();renderCostco()};
 window.__costcoQty=(name,d)=>{const x=costcoCart[N(name)];if(!x)return;x.qty=Math.max(1,(x.qty||1)+d);persistCostco();renderCostco()};
 window.__deleteCostco=name=>{delete costcoCart[N(name)];persistCostco();renderCostco()};
 window.__addSavedCostco=name=>addCostco(name,1);
 function switchStore(store){activeStore=store;const isCostco=store==='costco';tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.store===store));seg.style.display=isCostco?'none':'flex';rows.style.display=isCostco?'none':'block';panel.classList.toggle('on',isCostco);customBtn.style.display=isCostco?'none':'';if(isCostco)renderCostco();else{customBtn.onclick=openItemModal;renderShop('buy');updateCount()}}
 tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>switchStore(b.dataset.store));
 $('costcoAddBtn').onclick=()=>addCostco($('costcoInput').value,1);$('costcoInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addCostco(e.currentTarget.value,1)}});$('clearCostco').onclick=()=>{Object.keys(costcoCart).forEach(k=>{if(costcoCart[k].selected)delete costcoCart[k]});persistCostco();renderCostco()};
 updateCount=function(){const supermarket=Object.values(shop).filter(x=>!x.selected).length,costco=Object.values(costcoCart).filter(x=>!x.selected).length;$('count').textContent=`${supermarket+costco} items`};
 document.querySelector('[data-nav="shopping"]')?.addEventListener('click',()=>setTimeout(()=>switchStore(activeStore),0));
 switchStore('supermarket');updateCount();
},0);