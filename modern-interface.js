/* Approved clean/modern design. This layer does not write, migrate or replace app data. */
(() => {
  'use strict';
  if (window.ModernInterface) return;
  const root = new URL('.', document.currentScript.src);
  const home = document.getElementById('home');
  if (!home || typeof nav !== 'function' || typeof openRecipe !== 'function') throw new Error('Modern interface requires the existing app');
  const byId = id => document.getElementById(id);
  const icons = {
    home:'<path d="m3 10 9-7 9 7v10H15v-7H9v7H3Z"/>',
    cart:'<path d="M2 3h3l3 12h11l3-9H6M9 20h.01M18 20h.01"/>',
    list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v5M17 3v5M3 11h18M7 15h.01M12 15h.01M17 15h.01M7 18h.01M12 18h.01"/>',
    meals:'<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M18 3c-3 3-4 7 0 9v9M18 3v9"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>'
  };
  const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.list}</svg>`;
  const storefront = '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="10" y="24" width="44" height="32" rx="4" fill="#dcecff" stroke="#6f9fd6" stroke-width="2"/><path d="M12 11h40l7 16H5Z" fill="#0867ff"/><path d="m20 11-4 16h11l1-16m8 0 1 16h11l-4-16" fill="#fff"/><path d="M5 27h11v4a5.5 5.5 0 0 1-11 0m11-4h11v4a5.5 5.5 0 0 1-11 0m11-4h10v4a5 5 0 0 1-10 0m10-4h11v4a5.5 5.5 0 0 1-11 0m11-4h11v4a5.5 5.5 0 0 1-11 0" fill="#62a3ff"/><rect x="17" y="39" width="12" height="10" rx="1.5" fill="#85c6ff" stroke="#4f8ac8"/><path d="M23 39v10M17 44h12" stroke="#fff"/><rect x="36" y="37" width="12" height="19" rx="1.5" fill="#d3a46b" stroke="#987951"/><circle cx="44" cy="46" r="1" fill="#624d33"/><path d="M8 57h48" stroke="#6f9fd6" stroke-width="3" stroke-linecap="round"/></svg>';
  // Genuine Costco wordmark, not a text imitation. Failure never affects the app.
  const logoSource = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Costco_Wholesale_logo_2010-10-26.svg/330px-Costco_Wholesale_logo_2010-10-26.svg.png';
  function logo(){
    const img = document.createElement('img');
    img.className='modernCostcoLogo'; img.alt='Costco Wholesale'; img.src=logoSource; img.width=104; img.height=38;
    img.addEventListener('error',()=>{const text=document.createElement('span');text.className='modernLogoFallback';text.textContent='Costco';img.replaceWith(text)},{once:true});
    return img;
  }
  function element(tag, cls, text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node}
  function button(cls,text,action){const node=element('button',cls,text);node.type='button';node.addEventListener('click',action);return node}
  function goStore(scope,store){
    nav(scope);
    document.querySelector(`[data-store-scope="${scope}"] [data-store="${store}"]`)?.click();
    window.scrollTo({top:0,behavior:'auto'});
  }
  function heading(title,subtitle,icon){
    const node=element('div','modernHeading');const art=element('span','modernHeadingIcon');art.innerHTML=svg(icon);
    const text=element('div','modernHeadingText');text.append(element('h2','',title));if(subtitle)text.append(element('p','',subtitle));node.append(art,text);return node;
  }
  function card(id,title,subtitle,icon,actionText,action){
    const node=element('div','card');node.id=id;
    const top=element('div','modernSectionTop');top.append(heading(title,subtitle,icon));if(actionText)top.append(button('modernTextButton',actionText,action));node.append(top);return node;
  }
  const subtitle=element('p','modernSubtitle');document.querySelector('.top').after(subtitle);
  const subtitleFor={home:'Meals • Shopping • Family • Simplified',items:'Everything you need, in its place.',shopping:'Two stores. Your lists. Beautifully organized.',suppers:'Your family’s meals, just the way you like them.'};
  function refreshSubtitle(){const screen=document.querySelector('.screen.on');subtitle.textContent=subtitleFor[screen?.id]||subtitleFor.home}
  home.classList.add('modernHome');
  const stores=element('div','modernStoreCards');stores.setAttribute('aria-label','Your shopping lists');
  for(const [store,label] of [['supermarket','Supermarket'],['costco','Costco']]){
    const tile=button('modernStoreCard',undefined,()=>goStore('shopping',store));tile.dataset.homeStore=store;tile.setAttribute('aria-label',`Open ${label} shopping list`);
    const art=element('div','modernStoreArtwork');if(store==='costco')art.append(logo());else art.innerHTML=storefront;
    const count=element('small','', '0 items to buy');count.id=`home-${store}-count`;
    const arrow=element('span','modernStoreArrow');arrow.innerHTML=svg('chevron');tile.append(art,element('b','',label),count,arrow);stores.append(tile);
  }
  home.prepend(stores);
  document.querySelectorAll('[data-store-scope] button').forEach(tab=>{
    const store=tab.dataset.store;tab.type='button';tab.setAttribute('aria-label',store==='costco'?'Costco':'Supermarket');
    tab.replaceChildren();
    if(store==='costco')tab.append(logo());else{const art=element('span','modernTabStore');art.innerHTML=storefront;tab.append(art,document.createTextNode('Supermarket'))}
  });
  const weekCard=byId('week').closest('.card');weekCard.id='homeWeekCard';
  const weekTitle=weekCard.querySelector('.hdr h2');weekTitle.replaceWith(heading('This Week','Plan your meals and stay organized','calendar'));
  const calendar=byId('cal').closest('.card');calendar.id='homeCalendar';
  const calTop=element('div','modernSectionTop');calTop.append(heading('Your Calendar','Shabbos, holidays & family meals','calendar'),button('modernTextButton','Today',()=>{cal=new Date();renderMonth()}));calendar.prepend(calTop);
  const legend=element('div','modernCalendarLegend');legend.innerHTML='<span><i class="modernDot"></i>Shabbos</span><span><i class="modernDot holiday"></i>Yom Tov</span>';calendar.append(legend);
  const quick=card('homeQuickMeals','Quick Meal Plan','Your recipes. Your way.','meals','All suppers',()=>nav('suppers'));
  const recipeGrid=element('div','modernRecipeGrid');quick.append(recipeGrid);
  const recipeKeys=['Chicken Lo Mein','Grilled Chicken','Tacos'].filter(name=>Object.prototype.hasOwnProperty.call(RECIPES,name));
  recipeKeys.forEach((name,index)=>{
    const tile=button('modernRecipeTile',undefined,()=>openRecipe(name));tile.dataset.recipe=name;
    const art=element('div','modernRecipeArt', ['🍜','🍗','🌮'][index]);art.setAttribute('aria-hidden','true');
    tile.append(art,element('b','',name),element('small','', 'View recipe'));recipeGrid.append(tile);
  });
  // Illustrative dish thumbnails from Sam's approved visual, never new catalogue entries.
  fetch(new URL('modern-meal-art.json',root)).then(response=>response.ok?response.json():{}).then(images=>{
    recipeGrid.querySelectorAll('[data-recipe]').forEach(tile=>{const src=images[tile.dataset.recipe];if(typeof src!=='string'||!src.startsWith('data:image/jpeg;base64,'))return;const img=element('img');img.alt='';img.src=src;img.width=110;img.height=80;img.addEventListener('load',()=>tile.querySelector('.modernRecipeArt').replaceChildren(img),{once:true});});
  }).catch(()=>{});
  const lists=card('homeListPreview','On Your Lists','Ready for your next shop','list','View lists',()=>nav('shopping'));const listRows=element('div');lists.append(listRows);
  weekCard.after(quick,lists);
  const upcoming=card('homeUpcoming','Upcoming This Month',null,'calendar','Calendar',()=>calendar.scrollIntoView({behavior:'auto',block:'start'}));const eventRows=element('div');upcoming.append(eventRows);calendar.after(upcoming);
  function costcoCart(){try{const parsed=JSON.parse(localStorage.getItem('costcoShopV2')||'{}');return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{}}catch{return{}}}
  function cartRows(value){return Object.values(value||{}).filter(x=>x&&typeof x.name==='string'&&!x.selected)}
  function photo(record){
    const node=element('div','pic');node.textContent=record.photo||'🛒';
    const src=record.customPhoto;
    if(typeof src==='string'&&/^(https?:\/\/|data:image\/)/i.test(src)){const img=element('img');img.src=src;img.alt='';img.addEventListener('error',()=>{node.textContent=record.photo||'🛒'},{once:true});node.replaceChildren(img)}
    return node;
  }
  function refreshLists(){
    const supermarket=cartRows(shop),costco=cartRows(costcoCart());
    for(const [store,rows] of [['supermarket',supermarket],['costco',costco]])byId(`home-${store}-count`).textContent=`${rows.length} item${rows.length===1?'':'s'} to buy`;
    const entries=[...supermarket.slice(0,2).map(x=>[x,'supermarket']),...costco.slice(0,2).map(x=>[x,'costco'])];
    listRows.replaceChildren();
    entries.forEach(([record,store])=>{const row=button('modernListRow',undefined,()=>goStore('shopping',store));const text=element('span','grow');text.append(element('b','',record.name),element('small','',store==='costco'?'Costco':'Supermarket'));row.append(photo(record),text,element('span','modernQtyLabel',`Qty ${record.qty||1}`));listRows.append(row)});
    if(!entries.length){listRows.append(element('div','modernEmpty','Your lists are ready for your next shop. Choose your items and they’ll appear here.'),button('modernTextButton','Browse items →',()=>goStore('items','supermarket')))}
  }
  function decorateWeek(){
    const start=new Date();start.setHours(12,0,0,0);start.setDate(start.getDate()-start.getDay());
    byId('week').querySelectorAll('.day').forEach((day,index)=>{const dt=new Date(start);dt.setDate(start.getDate()+index);if(!day.querySelector('.modernWeekDate'))day.querySelector('b')?.after(element('span','modernWeekDate',String(dt.getDate())));day.classList.toggle('is-today',isoLocal(dt)===isoLocal(new Date()));day.setAttribute('aria-label',`${dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}: ${suppers.find(x=>x.date===isoLocal(dt))?.name||'Choose supper'}`)});
  }
  function decorateCalendar(){
    const today=isoLocal(new Date());const events=[];
    byId('cal').querySelectorAll('.date').forEach(cell=>{
      const ds=(cell.getAttribute('onclick')||'').match(/dateTap\('([0-9-]+)'/i)?.[1];if(!ds)return;
      const label=cell.querySelector('.evt')?.textContent||'';
      cell.dataset.date=ds;cell.classList.toggle('is-today',ds===today);
      cell.setAttribute('aria-label',`${new Date(ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}${label?', '+label:''}`);
      if(ds===today)cell.setAttribute('aria-current','date');else cell.removeAttribute('aria-current');
      if(!cell.classList.contains('muted')&&ds>=today&&(cell.classList.contains('shabbos')||cell.classList.contains('holiday')))events.push({ds,label,cell,holiday:cell.classList.contains('holiday')});
    });
    eventRows.replaceChildren();
    events.slice(0,3).forEach(event=>{const row=button('modernEvent',undefined,()=>event.cell.click());const dot=element('i',`modernDot${event.holiday?' holiday':''}`);const date=element('strong','',new Date(event.ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}));const label=element('span','',event.label);const arrow=element('span');arrow.innerHTML=svg('chevron');row.append(dot,date,label,arrow);eventRows.append(row)});
    if(!events.length)eventRows.append(element('div','modernEmpty','No upcoming Shabbos or holiday dates in this month. Use the arrows to view another month.'));
  }
  document.querySelectorAll('.bottom [data-nav]').forEach(tab=>{const node=tab.querySelector('.ico');if(node)node.innerHTML=svg({home:'home',items:'cart',shopping:'list',suppers:'meals'}[tab.dataset.nav]);});
  // Observe only existing update points, never the entire document or data storage.
  new MutationObserver(refreshLists).observe(byId('count'),{childList:true,subtree:true,characterData:true});
  new MutationObserver(decorateCalendar).observe(byId('cal'),{childList:true});
  new MutationObserver(decorateWeek).observe(byId('week'),{childList:true});
  const screenObserver=new MutationObserver(()=>{refreshSubtitle();refreshLists()});
  document.querySelectorAll('.screen').forEach(screen=>screenObserver.observe(screen,{attributes:true,attributeFilter:['class']}));
  refreshSubtitle();refreshLists();decorateWeek();decorateCalendar();
  document.body.classList.add('modernApp');
  window.ModernInterface={ready:true,version:'clean-modern-preview-1'};
})();
