window.GOURMET_GLATT_BATCH5 = [
['Spring Water','Drinks','💧'],['Mineral Water','Drinks','💧'],['Seltzer Water','Drinks','💧'],['Flavored Seltzer','Drinks','🥤'],['Cola','Drinks','🥤'],['Diet Cola','Drinks','🥤'],['Lemon Lime Soda','Drinks','🥤'],['Ginger Ale','Drinks','🥤'],['Orange Soda','Drinks','🥤'],['Root Beer','Drinks','🥤'],['Apple Juice','Drinks','🧃'],['Orange Juice','Drinks','🧃'],['Grape Juice','Drinks','🍇'],['Cranberry Juice','Drinks','🧃'],['Fruit Punch','Drinks','🧃'],['Lemonade','Drinks','🍋'],['Iced Tea','Drinks','🧋'],['Coffee','Drinks','☕'],['Instant Coffee','Drinks','☕'],['Ground Coffee','Drinks','☕'],['Tea Bags','Drinks','🫖'],['Herbal Tea','Drinks','🫖'],['Hot Cocoa Mix','Drinks','☕'],['Sports Drink','Drinks','🥤'],['Energy Drink','Drinks','🥤'],['Drink Boxes','Drinks','🧃'],['Coconut Water','Drinks','🥥'],
['Paper Towels','Household','🧻'],['Toilet Paper','Household','🧻'],['Facial Tissues','Household','🤧'],['Napkins','Household','🧻'],['Paper Plates','Household','🍽️'],['Plastic Plates','Household','🍽️'],['Plastic Cups','Household','🥤'],['Hot Cups','Household','☕'],['Plastic Forks','Household','🍴'],['Plastic Knives','Household','🍴'],['Plastic Spoons','Household','🥄'],['Cutlery Set','Household','🍴'],['Aluminum Foil','Household','📦'],['Parchment Paper','Household','📜'],['Plastic Wrap','Household','📦'],['Storage Bags','Household','🛍️'],['Sandwich Bags','Household','🛍️'],['Freezer Bags','Household','🛍️'],['Trash Bags','Household','🗑️'],['Large Trash Bags','Household','🗑️'],['Aluminum Pans','Household','🍽️'],['9x13 Aluminum Pans','Household','🍽️'],['Round Aluminum Pans','Household','🍽️'],['Disposable Tablecloth','Household','🧺'],['Dish Soap','Household','🧼'],['Dishwasher Detergent','Household','🧼'],['Sponges','Household','🧽'],['Scrub Pads','Household','🧽'],['All Purpose Cleaner','Household','🧴'],['Glass Cleaner','Household','🧴'],['Disinfecting Wipes','Household','🧻'],['Bleach','Household','🧴'],['Laundry Detergent','Household','🧺'],['Fabric Softener','Household','🧺'],['Dryer Sheets','Household','🧺'],['Hand Soap','Household','🧼'],['Foil Trays','Household','🍽️'],['Food Containers','Household','🥡']
];

setTimeout(() => {
  if (typeof H === 'undefined') return;
  const sectionOrder = ['Appetizers','Starters','Main','Sides','Desserts'];
  ['shab','yt'].forEach(k => ['night','day'].forEach(meal => {
    const oldMenu = H[k] && H[k][meal] ? H[k][meal] : {};
    const nextMenu = {};
    sectionOrder.forEach(section => nextMenu[section] = Array.isArray(oldMenu[section]) ? oldMenu[section] : []);
    Object.keys(oldMenu).forEach(section => { if (!sectionOrder.includes(section) && section !== 'Drinks') nextMenu[section] = oldMenu[section]; });
    H[k][meal] = nextMenu;
  }));
  if (typeof save === 'function') save('menusV3', H);
  if (typeof addMenuItem === 'function') addMenuItem = function(k, meal) {
    let section = prompt('Section: Appetizers, Starters, Main, Sides, or Desserts'); if (!section) return;
    let key = Object.keys(H[k][meal]).find(x => N(x) === N(section));
    if (!key) { alert('Please choose Appetizers, Starters, Main, Sides, or Desserts.'); return; }
    let item = prompt('Item to add'); if (!item) return; H[k][meal][key].push(item.trim()); persist(); renderSuppers();
  };

  // Jewish calendar: Hebrew date every day, Shabbos every Saturday, and major Yom Tovim.
  const style = document.createElement('style');
  style.textContent = `.date{min-height:88px;text-align:left;position:relative}.date .heb{display:block;font-size:10px;color:#6c786f;margin-top:2px;line-height:1.1}.date.shabbos{background:#eef8f1;border-color:#bcdcc7}.date.holiday{background:#f8f1fb;border-color:#ddc8e7}.date.erev{background:#fff8e9;border-color:#ead9aa}.date .jtag{font-size:9px;font-weight:900;margin-top:4px;line-height:1.05;color:#0d7a43}.date.holiday .jtag{color:#713c82}.date.erev .jtag{color:#8a6418}@media(max-width:430px){.date{min-height:82px}.date .heb{font-size:9px}.date .jtag{font-size:8px}}`;
  document.head.appendChild(style);

  const hebParts = d => {
    const parts = new Intl.DateTimeFormat('en-u-ca-hebrew',{day:'numeric',month:'long',year:'numeric'}).formatToParts(d);
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    return {day:Number(get('day')),month:get('month'),year:get('year')};
  };
  const hebLabel = d => new Intl.DateTimeFormat('en-u-ca-hebrew',{day:'numeric',month:'short'}).format(d);
  const holidayFor = d => {
    const h=hebParts(d), m=h.month, n=h.day;
    if(m==='Tishri' || m==='Tishrei'){
      if(n===1||n===2)return 'Rosh Hashana'; if(n===10)return 'Yom Kippur';
      if(n>=15&&n<=21)return n===15?'Sukkos':'Chol Hamoed Sukkos'; if(n===22)return 'Shemini Atzeres'; if(n===23)return 'Simchas Torah';
    }
    if(m==='Nisan'){
      if(n>=15&&n<=22){if(n===15||n===16||n===21||n===22)return 'Pesach';return 'Chol Hamoed Pesach';}
    }
    if(m==='Sivan'&&(n===6||n===7))return 'Shavuos';
    return '';
  };
  renderMonth = function(){
    let y=cal.getFullYear(),m=cal.getMonth();
    const mid=new Date(y,m,15), hp=hebParts(mid);
    $('monthLabel').innerHTML=`${cal.toLocaleString(undefined,{month:'long',year:'numeric'})}<div style="font-size:12px;color:#748077;font-weight:750;margin-top:2px">${hp.month} ${hp.year}</div>`;
    let first=new Date(y,m,1),start=first.getDay(),days=new Date(y,m+1,0).getDate(),prev=new Date(y,m,0).getDate(),cells='';
    ['Sun','Mon','Tue','Wed','Thu','Fri','Shabbos'].forEach(d=>cells+=`<div class="dow">${d}</div>`);
    for(let i=0;i<42;i++){
      let n,dt,mut=''; if(i<start){n=prev-start+i+1;dt=new Date(y,m-1,n);mut=' muted'}else if(i>=start+days){n=i-start-days+1;dt=new Date(y,m+1,n);mut=' muted'}else{n=i-start+1;dt=new Date(y,m,n)}
      let ds=isoLocal(dt), holiday=holidayFor(dt), dow=dt.getDay(), ev=holiday || (dow===6?'Shabbos':dow===5?'Erev Shabbos':''), cls=holiday?' holiday':dow===6?' shabbos':dow===5?' erev':'',s=suppers.find(x=>x.date===ds);
      const tag=holiday?holiday:(dow===6?'🕯️ Shabbos':dow===5?'🕯️ Erev Shabbos':'');
      cells+=`<button class="date${mut}${cls}" onclick="dateTap('${ds}','${ev.replaceAll("'","&#39;")}')"><span class="n">${n}</span><span class="heb">${hebLabel(dt)}</span>${tag?`<div class="jtag">${tag}</div>`:''}${s?`<div class="evt" style="color:#0d7a43">${esc(s.name)}</div>`:''}</button>`;
    }
    $('cal').innerHTML=cells;
  };
  dateTap = function(ds,ev){
    if(ev && (ev==='Shabbos'||ev.includes('Rosh Hashana')||ev.includes('Yom Kippur')||ev.includes('Sukkos')||ev.includes('Atzeres')||ev.includes('Torah')||ev.includes('Pesach')||ev.includes('Shavuos'))){
      supMode=ev==='Shabbos'?'shab':'yt'; nav('suppers'); document.querySelectorAll('[data-sup]').forEach(b=>b.classList.toggle('on',b.dataset.sup===supMode)); renderSuppers();
    } else openSupperPicker(ds);
  };
  renderMonth();
  if (typeof renderSuppers === 'function') renderSuppers();
}, 0);