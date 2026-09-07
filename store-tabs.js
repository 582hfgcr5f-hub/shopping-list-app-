(()=>{
  setTimeout(()=>{
    if(typeof $!=='function'||typeof N!=='function'||typeof renderShop!=='function'||typeof renderItemRows!=='function') return;

    let itemStore=localStorage.getItem('itemStoreV1')||'supermarket';
    let shoppingStore=localStorage.getItem('shoppingStoreV1')||'supermarket';
    let shoppingMode='buy';
    let costcoShop=(()=>{try{return JSON.parse(localStorage.getItem('costcoShopV1')||'{}')}catch{return{}}})();

    const saveCostco=()=>localStorage.setItem('costcoShopV1',JSON.stringify(costcoShop));
    const style=document.createElement('style');
    style.textContent=`
      .storeTabs{display:flex;background:#edf1ee;border-radius:14px;padding:4px;gap:4px;margin:10px 0 12px}
      .storeTabs button{flex:1;border:0;background:transparent;border-radius:10px;padding:11px 7px;font-weight:900;color:#233129;font-size:14px}
      .storeTabs button.on{background:#0d7a43;color:#fff;box-shadow:0 1px 5px #0001}
      .storeHint{font-size:12px;color:#748077;margin:-3px 2px 8px}
    `;
    document.head.appendChild(style);

    function tabsHtml(scope,active){
      return `<div class="storeTabs" data-store-scope="${scope}">
        <button data-store="supermarket" class="${active==='supermarket'?'on':''}">🛒 Supermarket</button>
        <button data-store="costco" class="${active==='costco'?'on':''}">🏬 Costco</button>
      </div>`;
    }

    const itemsScreen=$('items');
    const itemsCard=itemsScreen&&itemsScreen.querySelector('.card');
    if(itemsCard&&!itemsCard.querySelector('[data-store-scope="items"]')){
      const header=itemsCard.querySelector('.hdr');
      header.insertAdjacentHTML('afterend',tabsHtml('items',itemStore));
      header.nextElementSibling.insertAdjacentHTML('afterend','<div class="storeHint" id="itemStoreHint"></div>');
    }

    const shoppingScreen=$('shopping');
    const shoppingCard=shoppingScreen&&shoppingScreen.querySelector('.card');
    if(shoppingCard&&!shoppingCard.querySelector('[data-store-scope="shopping"]')){
      const header=shoppingCard.querySelector('.hdr');
      header.insertAdjacentHTML('afterend',tabsHtml('shopping',shoppingStore));
    }

    if($('customBtn')) $('customBtn').style.display='none';

    const baseRenderCats=renderCats;
    const baseRenderItemRows=renderItemRows;
    const baseAddShop=addShop;
    const baseRenderShop=renderShop;
    const baseToggleShop=toggleShop;
    const baseDelShop=delShop;
    const baseUpdateCount=updateCount;
    const baseQtyChange=window.__shopQtyChange;

    function updateItemHint(){
      const h=$('itemStoreHint');
      if(h) h.textContent=itemStore==='costco'?'Items you add here will go to your Costco list.':'Items you add here will go to your Supermarket list.';
    }

    function addToCostco(name,qty=1){
      const i=items.find(x=>N(x[0])===N(name))||[name,'Pantry','🛒'];
      const key=N(name),old=costcoShop[key];
      costcoShop[key]={name:i[0],cat:i[1],photo:i[2],customPhoto:i[3]||'',qty:(old?.qty||0)+qty,selected:false};
      saveCostco();updateCount();
      if(shoppingStore==='costco') renderShop('buy');
    }

    addShop=function(name,qty=1){
      if(itemStore==='costco'&&document.querySelector('#items.screen.on')) return addToCostco(name,qty);
      return baseAddShop(name,qty);
    };

    renderItemRows=function(arr){
      $('itemRows').innerHTML=arr.map(i=>{
        const key=N(i[0]);
        const qty=(typeof itemQty!=='undefined'&&itemQty[key])||1;
        return `<div class="itemrow"><div class="pic">${i[3]?`<img src="${i[3]}">`:i[2]}</div><div class="grow"><b>${esc(i[0])}</b><span class="sub">${i[1]}</span></div><div class="itemAddWrap"><div class="itemQty"><button onclick="event.stopPropagation();__storeItemQty('${js(i[0])}',-1)">−</button><span data-store-item-qty="${attr(key)}">${qty}</span><button onclick="event.stopPropagation();__storeItemQty('${js(i[0])}',1)">+</button></div><button class="pill" onclick="__storeAddItem('${js(i[0])}')">Add</button></div></div>`;
      }).join('')||'<div class="sub" style="padding:14px">No items found</div>';
    };

    const storeItemQty={};
    window.__storeItemQty=function(name,delta){
      const key=N(name);storeItemQty[key]=Math.max(1,(storeItemQty[key]||1)+delta);
      const el=document.querySelector(`[data-store-item-qty="${CSS.escape(key)}"]`);if(el)el.textContent=storeItemQty[key];
    };
    window.__storeAddItem=function(name){
      const key=N(name),qty=storeItemQty[key]||1;
      if(itemStore==='costco') addToCostco(name,qty); else baseAddShop(name,qty);
      storeItemQty[key]=1;
      const el=document.querySelector(`[data-store-item-qty="${CSS.escape(key)}"]`);if(el)el.textContent='1';
    };

    renderCats=function(){baseRenderCats();updateItemHint()};

    renderShop=function(mode='buy'){
      shoppingMode=mode;
      $('buyTab').classList.toggle('on',mode==='buy');$('selTab').classList.toggle('on',mode==='sel');
      if(shoppingStore==='supermarket'){
        baseRenderShop(mode);return;
      }
      const arr=Object.values(costcoShop).filter(x=>!!x.selected===(mode==='sel'));
      $('shopRows').innerHTML=arr.map(x=>`<div class="shoprow"><button class="check ${x.selected?'on':''}" onclick="toggleShop('${js(x.name)}')">${x.selected?'✓':''}</button><div class="pic">${x.customPhoto?`<img src="${x.customPhoto}">`:x.photo}</div><div class="grow"><b>${esc(x.name)}</b><span class="sub">Quantity ${x.qty||1}</span></div><div class="shopQty"><button onclick="__shopQtyChange('${js(x.name)}',-1)">−</button><span>${x.qty||1}</span><button onclick="__shopQtyChange('${js(x.name)}',1)">+</button></div><button class="btn" onclick="delShop('${js(x.name)}')">×</button></div>`).join('')||'<div class="sub" style="padding:18px 4px">Your Costco list is empty. Add items from the Items tab.</div>';
      updateCount();
    };

    toggleShop=function(name){
      if(shoppingStore==='supermarket') return baseToggleShop(name);
      const x=costcoShop[N(name)];if(!x)return;x.selected=!x.selected;saveCostco();renderShop(shoppingMode);
    };
    delShop=function(name){
      if(shoppingStore==='supermarket') return baseDelShop(name);
      delete costcoShop[N(name)];saveCostco();renderShop(shoppingMode);updateCount();
    };
    window.__shopQtyChange=function(name,delta){
      if(shoppingStore==='supermarket'&&baseQtyChange) return baseQtyChange(name,delta);
      if(shoppingStore==='supermarket') return;
      const x=costcoShop[N(name)];if(!x)return;x.qty=Math.max(1,(x.qty||1)+delta);saveCostco();renderShop(shoppingMode);
    };
    updateCount=function(){
      const supermarketCount=Object.values(shop).filter(x=>!x.selected).length;
      const costcoCount=Object.values(costcoShop).filter(x=>!x.selected).length;
      $('count').textContent=`${supermarketCount+costcoCount} items`;
    };

    document.querySelectorAll('[data-store-scope="items"] button').forEach(b=>b.onclick=()=>{
      itemStore=b.dataset.store;localStorage.setItem('itemStoreV1',itemStore);
      document.querySelectorAll('[data-store-scope="items"] button').forEach(x=>x.classList.toggle('on',x.dataset.store===itemStore));
      renderCats();
    });
    document.querySelectorAll('[data-store-scope="shopping"] button').forEach(b=>b.onclick=()=>{
      shoppingStore=b.dataset.store;localStorage.setItem('shoppingStoreV1',shoppingStore);
      document.querySelectorAll('[data-store-scope="shopping"] button').forEach(x=>x.classList.toggle('on',x.dataset.store===shoppingStore));
      renderShop(shoppingMode);
    });

    $('buyTab').onclick=()=>renderShop('buy');$('selTab').onclick=()=>renderShop('sel');

    const oldSaveItem=$('saveItem').onclick;
    $('saveItem').onclick=()=>{
      const n=$('newName').value.trim(),c=$('newCat').value;if(!n)return;
      let i=items.find(x=>N(x[0])===N(n));
      if(!i){i=[n,c,'🛒',photoData];items.push(i);custom.push(i);save('customV2',custom)}else if(photoData){i[3]=photoData}
      if(itemStore==='costco') addToCostco(n,q); else baseAddShop(n,q);
      closeModal('itemModal');nav('items');selectedCat=c;renderCats();
    };

    updateItemHint();renderCats();renderShop('buy');updateCount();
  },0);
})();