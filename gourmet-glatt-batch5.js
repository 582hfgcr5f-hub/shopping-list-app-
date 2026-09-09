/* Stable extension loader */
(()=>{
 const scripts=[
  ['core','https://cdn.jsdelivr.net/gh/582hfgcr5f-hub/shopping-list-app-@a68edc6622963242a3092dba865ae0c079a90d1f/gourmet-glatt-batch5.js?v=20260907-3'],
  ['stores','store-tabs.js?v=stable-1'],
  ['costco-pictures','costco-pictures.js?v=stable-1'],
  ['home-stores','home-store-shortcuts.js?v=stable-1'],
  ['dated-menus','menu-date-storage.js?v=stable-1'],
  ['home-shopping','home-shopping-summary.js?v=stable-1'],
  ['recipes','recipes-tab.js?v=stable-1'],
  ['family-sync','family-sync.js?v=preview-2']
 ];
 function calendarWrap(){if(document.getElementById('calendarWrapFix'))return;const st=document.createElement('style');st.id='calendarWrapFix';st.textContent='#cal .date .evt{white-space:normal!important;word-break:keep-all!important;overflow-wrap:normal!important;line-height:1.05!important;text-align:center!important;max-width:100%!important}';document.head.appendChild(st)}
 function load(i){if(i>=scripts.length){calendarWrap();document.documentElement.dataset.shoppingAppReady='true';window.dispatchEvent(new CustomEvent('shopping-app-ready'));return}const[id,src]=scripts[i];if(document.querySelector(`script[data-app-module="${id}"]`)){load(i+1);return}const s=document.createElement('script');s.src=src;s.async=false;s.dataset.appModule=id;s.onload=()=>load(i+1);s.onerror=()=>{console.error('Shopping app module failed:',id,src);document.documentElement.dataset.shoppingAppError=id};document.head.appendChild(s)}load(0)
})();