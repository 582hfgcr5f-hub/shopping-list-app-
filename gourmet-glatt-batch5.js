window.GOURMET_GLATT_BATCH5 = [
['Spring Water','Drinks','💧'],['Mineral Water','Drinks','💧'],['Seltzer Water','Drinks','💧'],['Flavored Seltzer','Drinks','🥤'],['Cola','Drinks','🥤'],['Diet Cola','Drinks','🥤'],['Lemon Lime Soda','Drinks','🥤'],['Ginger Ale','Drinks','🥤'],['Orange Soda','Drinks','🥤'],['Root Beer','Drinks','🥤'],['Apple Juice','Drinks','🧃'],['Orange Juice','Drinks','🧃'],['Grape Juice','Drinks','🍇'],['Cranberry Juice','Drinks','🧃'],['Fruit Punch','Drinks','🧃'],['Lemonade','Drinks','🍋'],['Iced Tea','Drinks','🧋'],['Coffee','Drinks','☕'],['Instant Coffee','Drinks','☕'],['Ground Coffee','Drinks','☕'],['Tea Bags','Drinks','🫖'],['Herbal Tea','Drinks','🫖'],['Hot Cocoa Mix','Drinks','☕'],['Sports Drink','Drinks','🥤'],['Energy Drink','Drinks','🥤'],['Drink Boxes','Drinks','🧃'],['Coconut Water','Drinks','🥥'],
['Paper Towels','Household','🧻'],['Toilet Paper','Household','🧻'],['Facial Tissues','Household','🤧'],['Napkins','Household','🧻'],['Paper Plates','Household','🍽️'],['Plastic Plates','Household','🍽️'],['Plastic Cups','Household','🥤'],['Hot Cups','Household','☕'],['Plastic Forks','Household','🍴'],['Plastic Knives','Household','🍴'],['Plastic Spoons','Household','🥄'],['Cutlery Set','Household','🍴'],['Aluminum Foil','Household','📦'],['Parchment Paper','Household','📜'],['Plastic Wrap','Household','📦'],['Storage Bags','Household','🛍️'],['Sandwich Bags','Household','🛍️'],['Freezer Bags','Household','🛍️'],['Trash Bags','Household','🗑️'],['Large Trash Bags','Household','🗑️'],['Aluminum Pans','Household','🍽️'],['9x13 Aluminum Pans','Household','🍽️'],['Round Aluminum Pans','Household','🍽️'],['Disposable Tablecloth','Household','🧺'],['Dish Soap','Household','🧼'],['Dishwasher Detergent','Household','🧼'],['Sponges','Household','🧽'],['Scrub Pads','Household','🧽'],['All Purpose Cleaner','Household','🧴'],['Glass Cleaner','Household','🧴'],['Disinfecting Wipes','Household','🧻'],['Bleach','Household','🧴'],['Laundry Detergent','Household','🧺'],['Fabric Softener','Household','🧺'],['Dryer Sheets','Household','🧺'],['Hand Soap','Household','🧼'],['Foil Trays','Household','🍽️'],['Food Containers','Household','🥡']
];
setTimeout(()=>{
 if(typeof H==='undefined')return;
 const sectionOrder=['Appetizers','Starters','Main','Sides','Desserts'];
 ['shab','yt'].forEach(k=>['night','day'].forEach(meal=>{const old=H[k]&&H[k][meal]?H[k][meal]:{},next={};sectionOrder.forEach(s=>next[s]=Array.isArray(old[s])?old[s]:[]);Object.keys(old).forEach(s=>{if(!sectionOrder.includes(s)&&s!=='Drinks')next[s]=old[s]});H[k][meal]=next}));
 if(typeof save==='function')save('menusV3',H);
 if(typeof addMenuItem==='function')addMenuItem=function(k,meal){let section=prompt('Section: Appetizers, Starters, Main, Sides, or Desserts');if(!section)return;let key=Object.keys(H[k][meal]).find(x=>N(x)===N(section));if(!key){alert('Please choose Appetizers, Starters, Main, Sides, or Desserts.');return}let item=prompt('Item to add');if(!item)return;H[k][meal][key].push(item.trim());persist();renderSuppers()};
 const style=document.createElement('style');style.textContent=`
 #home .card:has(#cal){overflow:hidden}.cal{width:100%;min-width:0;grid-template-columns:repeat(7,minmax(0,1fr))!important}.cal>*{min-width:0;max-width:100%;box-sizing:border-box}.date{width:100%;min-width:0;max-width:100%;overflow:hidden;text-align:center}.date .evt{max-width:100%;overflow-wrap:break-word;word-break:normal;hyphens:auto}
 .mealTabs{display:flex;gap:6px;background:#edf1ee;border-radius:13px;padding:4px;margin:12px 0}.mealTabs button{flex:1;border:0;background:transparent;padding:9px;border-radius:10px;font-weight:850;color:#0d7a43}.mealTabs button.on{background:#fff;box-shadow:0 1px 4px #0001}
 @media(max-width:430px){#home .card:has(#cal){padding-left:8px;padding-right:8px}.cal{gap:3px!important}.dow{font-size:10px}.date{padding:4px 1px!important;min-height:68px}.date .n{font-size:12px}.date .evt{font-size:7px!important;line-height:1.05;margin-top:3px}}`;document.head.appendChild(style);
 const hebParts=d=>{const p=new Intl.DateTimeFormat('en-u-ca-hebrew',{day:'numeric',month:'long'}).formatToParts(d),g=t=>p.find(x=>x.type===t)?.value||'';return{day:Number(g('day')),month:g('month')}};
 const yomTovFor=d=>{const h=hebParts(d),m=h.month,n=h.day;if(m==='Tishri'||m==='Tishrei'){if(n===1||n===2)return'Rosh Hashana';if(n===10)return'Yom Kippur';if(n===15||n===16)return'Sukkos';if(n===22)return'Shemini Atzeres';if(n===23)return'Simchas Torah'}if(m==='Nisan'&&(n===15||n===16||n===21||n===22))return'Pesach';if(m==='Sivan'&&(n===6||n===7))return'Shavuos';return''};
 const eventFor=d=>{const yt=yomTovFor(d);if(yt)return{name:yt,type:'yt'};if(d.getDay()===5)return{name:'Shabbos Night',type:'shabbos'};if(d.getDay()===6)return{name:'Shabbos Day',type:'shabbos'};return{name:'',type:''}};
 let mealView='night';
 const baseRenderSuppers=renderSuppers;
 function mealTabsHtml(){return `<div class="mealTabs"><button class="${mealView==='night'?'on':''}" onclick="window.__setMealView('night')">Night</button><button class="${mealView==='day'?'on':''}" onclick="window.__setMealView('day')">Day</button></div>`}
 window.__setMealView=function(meal){mealView=meal;renderSuppers()};
 renderSuppers=function(){
   document.querySelectorAll('[data-sup]').forEach(b=>b.classList.toggle('on',b.dataset.sup===supMode));
   if(supMode==='mine'){baseRenderSuppers();return}
   if(supMode==='shab'||supMode==='yt'){
     const isShab=supMode==='shab';
     const type=isShab?'Shabbos':'Yom Tov';
     const label=mealView==='night'?(isShab?'Friday Night':'Yom Tov Night'):(isShab?'Shabbos Day':'Yom Tov Day');
     $('supContent').innerHTML=`<div style="margin:16px 3px 6px;font-weight:850;color:#748077">${type} Menu</div>${mealTabsHtml()}${menuCard(supMode,mealView,label)}`;
     return;
   }
   baseRenderSuppers();
 };
 document.querySelectorAll('[data-sup]').forEach(b=>b.onclick=()=>{supMode=b.dataset.sup;if(supMode==='shab'||supMode==='yt')mealView='night';renderSuppers()});
 renderMonth=function(){let y=cal.getFullYear(),m=cal.getMonth();$('monthLabel').textContent=cal.toLocaleString(undefined,{month:'long',year:'numeric'});let first=new Date(y,m,1),start=first.getDay(),days=new Date(y,m+1,0).getDate(),prev=new Date(y,m,0).getDate(),cells='';['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>cells+=`<div class="dow">${d}</div>`);for(let i=0;i<42;i++){let n,dt,mut='';if(i<start){n=prev-start+i+1;dt=new Date(y,m-1,n);mut=' muted'}else if(i>=start+days){n=i-start-days+1;dt=new Date(y,m+1,n);mut=' muted'}else{n=i-start+1;dt=new Date(y,m,n)}const ds=isoLocal(dt),event=eventFor(dt),s=suppers.find(x=>x.date===ds),cls=event.type==='yt'?' holiday':event.type==='shabbos'?' shabbos':'';cells+=`<button class="date${mut}${cls}" onclick="dateTap('${ds}','${event.name.replaceAll("'","&#39;")}')"><span class="n">${n}</span>${event.name?`<div class="evt">${event.name}</div>`:''}${s?`<div class="evt" style="color:#0d7a43">${esc(s.name)}</div>`:''}</button>`}$('cal').innerHTML=cells};
 dateTap=function(ds,ev){
   if(ev==='Shabbos Night'||ev==='Shabbos Day'){
     supMode='shab';mealView=ev==='Shabbos Night'?'night':'day';
     document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('on',x.id==='suppers'));
     document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('on',x.dataset.nav==='suppers'));
     $('title').textContent='Suppers';renderSuppers();return;
   }
   if(ev){
     supMode='yt';mealView='day';
     document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('on',x.id==='suppers'));
     document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('on',x.dataset.nav==='suppers'));
     $('title').textContent='Suppers';renderSuppers();return;
   }
   openSupperPicker(ds)
 };
 renderMonth();renderSuppers();
},0);
