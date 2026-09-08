(()=>{const pics={
'paper towels':'https://www.instacart.com/assets/domains/product-image/file/large_374ce76a-d13d-4e29-af13-65e510e8ddbd.jpg',
'detergent':'https://www.instacart.com/assets/domains/product-image/file/large_f905384a-fefb-4f68-a56e-c450b54e5e51.jpg',
'garbage bags':'https://www.instacart.com/assets/domains/product-image/file/large_466d9ce2-47ab-4a41-bc37-029d8043fe71.jpg',
'ketchup':'https://www.instacart.com/assets/domains/product-image/file/large_76e74e67-26a6-4eb1-81a9-d1a55b2d8a48.jpg'
};
function apply(){const tab=document.querySelector('[data-store-scope="items"] button[data-store="costco"]');if(!tab||!tab.classList.contains('on'))return;document.querySelectorAll('#itemRows .itemrow').forEach(row=>{const name=row.querySelector('.grow b')?.textContent.trim().toLowerCase();const url=pics[name];if(!url)return;const p=row.querySelector('.pic');if(p&&p.dataset.costcoPic!==url){p.dataset.costcoPic=url;p.innerHTML=`<img src="${url}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:contain;border-radius:10px;background:#fff" onerror="this.style.display='none'">`;}})}
new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(apply,0));setTimeout(apply,250);
})();