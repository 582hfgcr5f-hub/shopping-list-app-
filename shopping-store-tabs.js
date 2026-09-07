setTimeout(()=>{
  if(typeof renderShop!=='function'||typeof addShop!=='function')return;

  let activeStore=localStorage.getItem('activeShoppingStoreV1')||'supermarket';
  let costcoShop={};
  let bingoShop={};
  try{costcoShop=JSON.parse(localStorage.getItem('costcoShopV1')||'{}')||{}}catch{costcoShop={}}
  try{bingoShop=JSON.parse(localStorage.getItem('bingoShopV1')||'{}')||{}}catch{bingoShop={}}
  let shopMode='buy';

  const originalPersist=persist;
  const originalAddRecipeIngredients=typeof addRecipeIngredients==='function'?addRecipeIngredients:null;

  function saveStoreCarts(){
    localStorage.setItem('costcoShopV1',JSON.stringify(costcoShop));
    localStorage.setItem('bingoShopV1',JSON.stringify(bingoShop));
    localStorage.setItem('activeShoppingStoreV1',activeStore);
  }
  function cartFor(store=activeStore){
    if(store==='costco')return costcoShop;
    if(store==='bingo')return bingoShop;
    return shop;
  }
  function storeName(store=activeStore){return store==='costco'?'Costco':store==='bingo'?'Bingo':'Supermarket'}

  persist=function(){originalPersist();saveStoreCarts()};

  const style=document.createElement('style');
  style.textContent=`
    .storeTabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;background:#edf1ee;border-radius:14px;padding:4px;margin:12px 0 8px}
    .storeTabs button{border:0;background:transparent;border-radius:10px;padding:10px 5px;font-weight:850;color:#5f6d65;font-size:13px}
    .storeTabs button.on{background:#fff;color:#0d7a43;box-shadow:0 1px 5px #0001}
    .storeTitle{font-size:12px;color:#748077;font-weight:800;margin:2px 2px 7px}
    @media(max-width:430px){.storeTabs button{font-size:12px;padding:9px 3px}}
  `;
  document.head.appendChild(style);

  const shoppingCard=document.querySelector('#shopping .card');
  if(shoppingCard&&!document.getElementById('storeTabs')){
    const tabs=document.createElement('div');
    tabs.id='storeTabs';
    tabs.className='storeTabs';
    tabs.innerHTML=`<button data-store="supermarket">Supermarket</button><button data-store="costco">Costco</button><button data-store="bingo">Bingo</button>`;
    const seg=shoppingCard.querySelector('.seg');
    shoppingCard.insertBefore(tabs,seg);
    tabs.querySelectorAll('[data-store]').forEach(btn=>btn.onclick=()=>{
      activeStore=btn.dataset.store;
      localStorage.setItem('activeShoppingStoreV1',activeStore);
      renderShop(shopMode);
    });
  }

  function paintStoreTabs(){
    document.querySelectorAll('#storeTabs [data-store]').forEach(btn=>btn.classList.toggle('on',btn.dataset.store===activeStore));
  }

  updateCount=function(){
    const all=[shop,costcoShop,bingoShop];
    const total=all.reduce((n,c)=>n+Object.values(c).filter(x=>!x.selected).length,0);
    $('count').textContent=`${total} item${total===1?'':'s'}`;
  };

  addShop=function(name,qty=1){
    const i=items.find(x=>N(x[0])===N(name))||[name,'Pantry','🛒'];
    const cart=cartFor();
    const key=N(name),existing=cart[key];
    cart[key]={name:i[0],cat:i[1],photo:i[2],customPhoto:i[3]||'',qty:(existing?.qty||0)+qty,selected:false};
    persist();updateCount();renderShop('buy');
  };

  window.__shopQtyChange=function(name,delta){
    const cart=cartFor(),x=cart[N(name)];if(!x)return;
    x.qty=Math.max(1,(x.qty||1)+delta);persist();renderShop(x.selected?'sel':'buy');
  };

  toggleShop=function(name){
    const cart=cartFor(),x=cart[N(name)];if(!x)return;
    x.selected=!x.selected;persist();renderShop(x.selected?'buy':'sel');
  };

  delShop=function(name){
    const cart=cartFor();delete cart[N(name)];persist();renderShop(shopMode);
  };

  renderShop=function(mode='buy'){
    shopMode=mode;
    paintStoreTabs();
    $('buyTab').classList.toggle('on',mode==='buy');
    $('selTab').classList.toggle('on',mode==='sel');
    const cart=cartFor();
    const arr=Object.values(cart).filter(x=>!!x.selected===(mode==='sel'));
    $('shopRows').innerHTML=`<div class="storeTitle">${storeName()} Cart</div>`+(arr.map(x=>`<div class="shoprow"><button class="check ${x.selected?'on':''}" onclick="toggleShop('${js(x.name)}')">${x.selected?'✓':''}</button><div class="pic">${x.customPhoto?`<img src="${x.customPhoto}">`:x.photo}</div><div class="grow"><b>${esc(x.name)}</b><span class="sub">Quantity ${x.qty||1}</span></div><div class="shopQty"><button onclick="__shopQtyChange('${js(x.name)}',-1)">−</button><span>${x.qty||1}</span><button onclick="__shopQtyChange('${js(x.name)}',1)">+</button></div><button class="btn" onclick="delShop('${js(x.name)}')">×</button></div>`).join('')||`<div class="sub" style="padding:14px">Nothing in your ${storeName()} cart yet</div>`);
    updateCount();
  };

  if(originalAddRecipeIngredients){
    addRecipeIngredients=function(name){
      if(activeStore==='supermarket'){originalAddRecipeIngredients(name);saveStoreCarts();return}
      const supermarketShop=shop;
      const target=cartFor();
      shop=target;
      try{originalAddRecipeIngredients(name)}finally{
        shop=supermarketShop;
        originalPersist();
        saveStoreCarts();
        updateCount();
        renderShop('buy');
      }
    };
  }

  renderShop('buy');
  updateCount();
},80);
