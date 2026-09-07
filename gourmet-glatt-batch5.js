window.GOURMET_GLATT_BATCH5 = [
['Spring Water','Drinks','💧'],['Mineral Water','Drinks','💧'],['Seltzer Water','Drinks','💧'],['Flavored Seltzer','Drinks','🥤'],['Cola','Drinks','🥤'],['Diet Cola','Drinks','🥤'],['Lemon Lime Soda','Drinks','🥤'],['Ginger Ale','Drinks','🥤'],['Orange Soda','Drinks','🥤'],['Root Beer','Drinks','🥤'],['Apple Juice','Drinks','🧃'],['Orange Juice','Drinks','🧃'],['Grape Juice','Drinks','🍇'],['Cranberry Juice','Drinks','🧃'],['Fruit Punch','Drinks','🧃'],['Lemonade','Drinks','🍋'],['Iced Tea','Drinks','🧋'],['Coffee','Drinks','☕'],['Instant Coffee','Drinks','☕'],['Ground Coffee','Drinks','☕'],['Tea Bags','Drinks','🫖'],['Herbal Tea','Drinks','🫖'],['Hot Cocoa Mix','Drinks','☕'],['Sports Drink','Drinks','🥤'],['Energy Drink','Drinks','🥤'],['Drink Boxes','Drinks','🧃'],['Coconut Water','Drinks','🥥'],
['Paper Towels','Household','🧻'],['Toilet Paper','Household','🧻'],['Facial Tissues','Household','🤧'],['Napkins','Household','🧻'],['Paper Plates','Household','🍽️'],['Plastic Plates','Household','🍽️'],['Plastic Cups','Household','🥤'],['Hot Cups','Household','☕'],['Plastic Forks','Household','🍴'],['Plastic Knives','Household','🍴'],['Plastic Spoons','Household','🥄'],['Cutlery Set','Household','🍴'],['Aluminum Foil','Household','📦'],['Parchment Paper','Household','📜'],['Plastic Wrap','Household','📦'],['Storage Bags','Household','🛍️'],['Sandwich Bags','Household','🛍️'],['Freezer Bags','Household','🛍️'],['Trash Bags','Household','🗑️'],['Large Trash Bags','Household','🗑️'],['Aluminum Pans','Household','🍽️'],['9x13 Aluminum Pans','Household','🍽️'],['Round Aluminum Pans','Household','🍽️'],['Disposable Tablecloth','Household','🧺'],['Dish Soap','Household','🧼'],['Dishwasher Detergent','Household','🧼'],['Sponges','Household','🧽'],['Scrub Pads','Household','🧽'],['All Purpose Cleaner','Household','🧴'],['Glass Cleaner','Household','🧴'],['Disinfecting Wipes','Household','🧻'],['Bleach','Household','🧴'],['Laundry Detergent','Household','🧺'],['Fabric Softener','Household','🧺'],['Dryer Sheets','Household','🧺'],['Hand Soap','Household','🧼'],['Foil Trays','Household','🍽️'],['Food Containers','Household','🥡']
];

// Keep saved Shabbos/Yom Tov menus in sync with the current section layout.
setTimeout(() => {
  if (typeof H === 'undefined') return;
  const sectionOrder = ['Appetizers','Starters','Main','Sides','Drinks','Desserts'];
  ['shab','yt'].forEach(k => ['night','day'].forEach(meal => {
    const oldMenu = H[k] && H[k][meal] ? H[k][meal] : {};
    const nextMenu = {};
    sectionOrder.forEach(section => {
      nextMenu[section] = Array.isArray(oldMenu[section]) ? oldMenu[section] : [];
    });
    Object.keys(oldMenu).forEach(section => {
      if (!sectionOrder.includes(section)) nextMenu[section] = oldMenu[section];
    });
    H[k][meal] = nextMenu;
  }));
  if (typeof save === 'function') save('menusV3', H);

  if (typeof addMenuItem === 'function') {
    addMenuItem = function(k, meal) {
      let section = prompt('Section: Appetizers, Starters, Main, Sides, Drinks, or Desserts');
      if (!section) return;
      let key = Object.keys(H[k][meal]).find(x => N(x) === N(section));
      if (!key) {
        alert('Please choose Appetizers, Starters, Main, Sides, Drinks, or Desserts.');
        return;
      }
      let item = prompt('Item to add');
      if (!item) return;
      H[k][meal][key].push(item.trim());
      persist();
      renderSuppers();
    };
  }

  if (typeof renderSuppers === 'function') renderSuppers();
}, 0);