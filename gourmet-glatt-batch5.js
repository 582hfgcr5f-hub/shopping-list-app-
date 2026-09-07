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
    Object.keys(oldMenu).forEach(section => {
      if (!sectionOrder.includes(section) && section !== 'Drinks') nextMenu[section] = oldMenu[section];
    });
    H[k][meal] = nextMenu;
  }));
  if (typeof save === 'function') save('menusV3', H);

  if (typeof addMenuItem === 'function') addMenuItem = function(k, meal) {
    let section = prompt('Section: Appetizers, Starters, Main, Sides, or Desserts');
    if (!section) return;
    let key = Object.keys(H[k][meal]).find(x => N(x) === N(section));
    if (!key) { alert('Please choose Appetizers, Starters, Main, Sides, or Desserts.'); return; }
    let item = prompt('Item to add');
    if (!item) return;
    H[k][meal][key].push(item.trim());
    persist();
    renderSuppers();
  };

  const hebParts = d => {
    const parts = new Intl.DateTimeFormat('en-u-ca-hebrew', {day:'numeric', month:'long', year:'numeric'}).formatToParts(d);
    const get = t => parts.find(p => p.type === t)?.value || '';
    return {day:Number(get('day')), month:get('month'), year:get('year')};
  };
  const hebLabel = d => new Intl.DateTimeFormat('en-u-ca-hebrew', {day:'numeric', month:'short'}).format(d);

  const majorYomTovFor = d => {
    const h = hebParts(d), m = h.month, n = h.day;
    if (m === 'Tishri' || m === 'Tishrei') {
      if (n === 1 || n === 2) return 'Rosh Hashana';
      if (n === 10) return 'Yom Kippur';
      if (n === 15 || n === 16) return 'Sukkos';
      if (n === 22) return 'Shemini Atzeres';
      if (n === 23) return 'Simchas Torah';
    }
    if (m === 'Nisan') {
      if (n === 15 || n === 16 || n === 21 || n === 22) return 'Pesach';
    }
    if (m === 'Sivan' && (n === 6 || n === 7)) return 'Shavuos';
    return '';
  };

  const jewishEventFor = d => {
    const yt = majorYomTovFor(d);
    if (yt) return {name:yt, type:'yt'};
    const tomorrow = new Date(d);
    tomorrow.setDate(d.getDate() + 1);
    const tomorrowYt = majorYomTovFor(tomorrow);
    if (tomorrowYt) return {name:`Erev ${tomorrowYt}`, type:'erev'};
    if (d.getDay() === 6) return {name:'Shabbos', type:'shabbos'};
    if (d.getDay() === 5) return {name:'Erev Shabbos', type:'erev'};
    return {name:'', type:''};
  };

  renderMonth = function() {
    let y = cal.getFullYear(), m = cal.getMonth();
    $('monthLabel').textContent = cal.toLocaleString(undefined, {month:'long', year:'numeric'});
    let first = new Date(y,m,1), start = first.getDay(), days = new Date(y,m+1,0).getDate(), prev = new Date(y,m,0).getDate(), cells = '';
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => cells += `<div class="dow">${d}</div>`);

    for (let i=0;i<42;i++) {
      let n, dt, mut='';
      if (i < start) { n = prev-start+i+1; dt = new Date(y,m-1,n); mut=' muted'; }
      else if (i >= start+days) { n = i-start-days+1; dt = new Date(y,m+1,n); mut=' muted'; }
      else { n = i-start+1; dt = new Date(y,m,n); }

      const ds = isoLocal(dt), event = jewishEventFor(dt), s = suppers.find(x => x.date === ds);
      const cls = event.type === 'yt' ? ' holiday' : event.type === 'shabbos' ? ' shabbos' : '';
      const eventText = event.name ? `<div class="evt">${event.name}</div>` : '';
      const supperText = s ? `<div class="evt" style="color:#0d7a43">${esc(s.name)}</div>` : '';
      cells += `<button class="date${mut}${cls}" onclick="dateTap('${ds}','${event.name.replaceAll("'","&#39;")}')"><span class="n">${n}</span><div class="evt" style="color:#748077;font-weight:700">${hebLabel(dt)}</div>${eventText}${supperText}</button>`;
    }
    $('cal').innerHTML = cells;
  };

  dateTap = function(ds, ev) {
    if (ev === 'Shabbos') {
      supMode = 'shab';
      nav('suppers');
      document.querySelectorAll('[data-sup]').forEach(b => b.classList.toggle('on', b.dataset.sup === supMode));
      renderSuppers();
      return;
    }
    if (ev && !ev.startsWith('Erev ')) {
      supMode = 'yt';
      nav('suppers');
      document.querySelectorAll('[data-sup]').forEach(b => b.classList.toggle('on', b.dataset.sup === supMode));
      renderSuppers();
      return;
    }
    openSupperPicker(ds);
  };

  renderMonth();
  if (typeof renderSuppers === 'function') renderSuppers();
}, 0);
