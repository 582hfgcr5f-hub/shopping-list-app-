/* Reliability preview 2026-09-08. The approved UI and storage keys are unchanged. */
window.GOURMET_GLATT_BATCH5 = [
['Spring Water','Drinks','💧'],['Mineral Water','Drinks','💧'],['Seltzer Water','Drinks','💧'],['Flavored Seltzer','Drinks','🥤'],['Cola','Drinks','🥤'],['Diet Cola','Drinks','🥤'],['Lemon Lime Soda','Drinks','🥤'],['Ginger Ale','Drinks','🥤'],['Orange Soda','Drinks','🥤'],['Root Beer','Drinks','🥤'],['Apple Juice','Drinks','🧃'],['Orange Juice','Drinks','🧃'],['Grape Juice','Drinks','🍇'],['Cranberry Juice','Drinks','🧃'],['Fruit Punch','Drinks','🧃'],['Lemonade','Drinks','🍋'],['Iced Tea','Drinks','🧋'],['Coffee','Drinks','☕'],['Instant Coffee','Drinks','☕'],['Ground Coffee','Drinks','☕'],['Tea Bags','Drinks','🫖'],['Herbal Tea','Drinks','🫖'],['Hot Cocoa Mix','Drinks','☕'],['Sports Drink','Drinks','🥤'],['Energy Drink','Drinks','🥤'],['Drink Boxes','Drinks','🧃'],['Coconut Water','Drinks','🥥'],
['Paper Towels','Household','🧻'],['Toilet Paper','Household','🧻'],['Facial Tissues','Household','🤧'],['Napkins','Household','🧻'],['Paper Plates','Household','🍽️'],['Plastic Plates','Household','🍽️'],['Plastic Cups','Household','🥤'],['Hot Cups','Household','☕'],['Plastic Forks','Household','🍴'],['Plastic Knives','Household','🍴'],['Plastic Spoons','Household','🥄'],['Cutlery Set','Household','🍴'],['Aluminum Foil','Household','📦'],['Parchment Paper','Household','📜'],['Plastic Wrap','Household','📦'],['Storage Bags','Household','🛍️'],['Sandwich Bags','Household','🛍️'],['Freezer Bags','Household','🛍️'],['Trash Bags','Household','🗑️'],['Large Trash Bags','Household','🗑️'],['Aluminum Pans','Household','🍽️'],['9x13 Aluminum Pans','Household','🍽️'],['Round Aluminum Pans','Household','🍽️'],['Disposable Tablecloth','Household','🧺'],['Dish Soap','Household','🧼'],['Dishwasher Detergent','Household','🧼'],['Sponges','Household','🧽'],['Scrub Pads','Household','🧽'],['All Purpose Cleaner','Household','🧴'],['Glass Cleaner','Household','🧴'],['Disinfecting Wipes','Household','🧻'],['Bleach','Household','🧴'],['Laundry Detergent','Household','🧺'],['Fabric Softener','Household','🧺'],['Dryer Sheets','Household','🧺'],['Hand Soap','Household','🧼'],['Foil Trays','Household','🍽️'],['Food Containers','Household','🥡']
];
(() => {
  'use strict';
  if (window.ShoppingRelease) return;
  const release = window.ShoppingRelease = {
    version: 'reliability-preview-20260908-1',
    baseline: 'af8456db615481503556071cccdc3cc14231a9de',
    state: 'waiting', completed: [], error: null
  };
  const root = new URL('.', document.currentScript.src);
  const assets = [
    {name: 'menus-and-recipes', path: 'vendor/stable-a68edc6.js',
      ready: () => typeof window.__setMealView === 'function' && typeof window.__editRecipeIngredients === 'function' && typeof window.__shopQtyChange === 'function'},
    {name: 'separate-store-lists', path: 'store-tabs.js',
      ready: () => typeof window.__costcoAdd === 'function' && document.querySelectorAll('[data-store-scope]').length === 2},
    {name: 'costco-pictures', path: 'costco-pictures.js', ready: () => true}
  ];
  // Start only after the inline app has initialized its lexical data and functions.
  const domReady = document.readyState === 'loading'
    ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, {once: true}))
    : Promise.resolve();
  function waitUntil(check, name) {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + 4000;
      function poll() {
        try { if (check()) { resolve(); return; } }
        catch (error) { reject(error); return; }
        if (Date.now() >= deadline) { reject(new Error(name + ' did not initialize')); return; }
        setTimeout(poll, 20);
      }
      poll();
    });
  }
  function loadScript(asset) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const url = new URL(asset.path, root);
      url.searchParams.set('release', release.version);
      script.src = url.href;
      script.async = false;
      let settled = false;
      function finish(error) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        script.onload = script.onerror = null;
        if (error) reject(error); else resolve();
      }
      const timer = setTimeout(() => finish(new Error('Timed out loading ' + asset.name)), 15000);
      script.onload = () => finish();
      script.onerror = () => finish(new Error('Could not load ' + asset.name));
      document.head.appendChild(script);
    });
  }
  function showFailure(error) {
    // A visible failure instead of silently displaying an incomplete version.
    // Never clear localStorage, reload automatically, or retry wrapping app functions.
    release.state = 'error';
    release.error = String(error && error.message || error);
    console.error('Shopping release failed:', release.error);
    const notice = document.createElement('div');
    notice.id = 'releaseLoadError';
    notice.setAttribute('role', 'alert');
    notice.style.cssText = 'position:fixed;inset:12px 12px auto;z-index:100;background:#fff7ed;color:#7c2d12;padding:14px;border:1px solid #fed7aa;border-radius:12px;font:14px system-ui;box-shadow:0 3px 15px #0002';
    const message = document.createElement('p');
    message.style.margin = '0 0 10px';
    message.textContent = 'Some app features did not finish loading. Your saved lists have not been cleared. Please reload before editing.';
    const reload = document.createElement('button');
    reload.type = 'button';
    reload.textContent = 'Reload app';
    reload.className = 'btn';
    reload.addEventListener('click', () => location.reload());
    notice.append(message, reload);
    document.body.appendChild(notice);
  }
  window.ShoppingAppReady = domReady.then(async () => {
    release.state = 'loading';
    if (typeof renderCats !== 'function' || typeof renderSuppers !== 'function' || typeof N !== 'function') {
      throw new Error('The base app did not initialize');
    }
    for (const asset of assets) {
      await loadScript(asset);
      await waitUntil(asset.ready, asset.name);
      release.completed.push(asset.name);
    }
    release.state = 'ready';
    document.dispatchEvent(new CustomEvent('shopping:ready', {detail: release.version}));
    return release;
  }).catch(error => { showFailure(error); return release; });
})();
