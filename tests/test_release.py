"""Read-only release checks against the real app on a disposable local origin.
Run: pip install -r tests/requirements.txt && playwright install chromium
     python -m unittest discover -s tests -v
Never point these tests at production: test data is disposable.
"""
import hashlib
import json
import mimetypes
from urllib.parse import urlparse, unquote
import os
from pathlib import Path
import time
import unittest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
COSTCO = ['Paper Towels','Water','Detergent','Soap','Shampoo','Water Bottles','Sugar','Oil','Avocado Oil','Towels','Tissues','Soda','Pastrami','Potato Knishes','Avocado','Toothbrush','Toothpaste','Wipes','Pampers','Garbage Bags','Hot Cups','Gloves','Apple Sauce','Ketchup','Peanut Butter']
BASELINE_FILES = {
    'index.html': '17f4a481570558f2feb768a1cce80398332dbbc0',
    'store-tabs.js': '3d940e49a6247dec72d58d26d60638bfd457fa3a',
    'costco-pictures.js': 'aef3411014d94ee878a9d30186b2466d8f5406a3',
    'gourmet-glatt-batch1.js': '68b07b5eeb3436b0fd884239fd5533bab7ff2b1f',
    'gourmet-glatt-batch2.js': 'edb568b0b8908142f31ee10bc8bfe6c4d7f2186b',
    'gourmet-glatt-batch3.js': 'f736215e3c09cf7a373e8c9678d28232e3aa3c55',
    'gourmet-glatt-batch4.js': '13bdb01d56af0ef47b877ee980fed909e69705fe',
    'vendor/stable-a68edc6.js': '736da81e143603b400aaf07ded7bf705128a5d40',
}

class ReleaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Every request is fulfilled from the checked-out files; no network needed.
        cls.url = 'https://shopping.test'
        cls.pw = sync_playwright().start()
        engine = getattr(cls.pw, os.environ.get('BROWSER_ENGINE', 'chromium'))
        kwargs = {'headless': True}
        if os.environ.get('BROWSER_EXECUTABLE'):
            kwargs['executable_path'] = os.environ['BROWSER_EXECUTABLE']
        cls.browser = engine.launch(**kwargs)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width':390,'height':844}, timezone_id='America/New_York', accept_downloads=True)
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        # The test proves startup needs no third-party script. Product photographs
        # remain external and their source mapping is checked separately by hash.
        self.context.route('**/*', self.serve_local)

    def serve_local(self, route):
        url = urlparse(route.request.url)
        if url.scheme != 'https' or url.netloc != 'shopping.test':
            route.abort()
            return
        path = (ROOT / (unquote(url.path).lstrip('/') or 'index.html')).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            route.fulfill(status=404,body='Not found')
            return
        route.fulfill(body=path.read_bytes(),content_type=mimetypes.guess_type(path.name)[0] or 'application/octet-stream')

    def tearDown(self):
        self.context.close()

    def seed(self, values):
        self.context.add_init_script("if(!sessionStorage.getItem('__testSeeded')) { const seed=" + json.dumps(values) + "; for(const [k,v] of Object.entries(seed))localStorage.setItem(k,v); sessionStorage.setItem('__testSeeded','1'); }")

    def open_app(self):
        self.page.goto(self.url + '/')
        self.page.wait_for_function("window.ShoppingRelease && ShoppingRelease.state === 'ready'", timeout=25000)
        self.assertEqual(self.errors, [])

    def stored(self, key):
        return self.page.evaluate('key => JSON.parse(localStorage.getItem(key))', key)

    def costco_items(self):
        self.page.click('[data-nav="items"]')
        self.page.click('[data-store-scope="items"] [data-store="costco"]')

    def costco_cart(self):
        self.page.click('[data-nav="shopping"]')
        self.page.click('[data-store-scope="shopping"] [data-store="costco"]')

    def test_01_existing_ui_catalogs_and_vendor_are_byte_identical(self):
        for filename, expected in BASELINE_FILES.items():
            raw = (ROOT / filename).read_bytes()
            actual = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
            self.assertEqual(actual, expected, filename)

    def test_02_startup_store_tabs_and_rejected_modes_stay_out(self):
        self.open_app()
        self.assertEqual(self.page.locator('[data-store-scope]').count(), 2)
        self.assertEqual(self.page.locator('[data-nav]').count(), 4)
        self.assertEqual(self.page.locator('#startShopBtn,#smartPanel,.favStar').count(), 0)
        self.assertFalse(self.page.locator('#customBtn').is_visible())
        scripts = self.page.locator('script[src]').evaluate_all('(nodes) => nodes.map(n=>n.src)')
        self.assertTrue(all(s.startswith(self.url) for s in scripts), scripts)

    def test_03_early_catalog_data_matches_the_approved_runtime(self):
        self.open_app()
        # Both the loader and the unchanged vendor declare this exact array.
        text = (ROOT / 'gourmet-glatt-batch5.js').read_text()
        vendor = (ROOT / 'vendor/stable-a68edc6.js').read_text()
        initial = text[text.index('window.GOURMET_GLATT_BATCH5'):text.index('];')+2]
        approved = vendor[vendor.index('window.GOURMET_GLATT_BATCH5'):vendor.index('];')+2]
        self.assertEqual(initial, approved)
        self.assertEqual(self.page.evaluate('GOURMET_GLATT_BATCH5.length'), 65)

    def test_04_costco_keeps_exact_requested_catalog(self):
        self.open_app()
        self.costco_items()
        self.assertEqual(self.page.locator('#itemRows .grow b').all_text_contents(), COSTCO)
        self.assertEqual(self.page.locator('#itemRows [data-cq]').count(), len(COSTCO))
        self.assertTrue(self.page.locator('#addItemBtn').is_visible())

    def test_05_costco_quantities_checkoff_reload_and_store_isolation(self):
        self.open_app()
        self.costco_items()
        row = self.page.locator('#itemRows .itemrow').filter(has_text='Paper Towels')
        row.locator('.itemQty button').last.click()
        row.locator('.pill').click()
        self.assertEqual(self.stored('costcoShopV2')['paper towels']['qty'], 2)
        self.assertNotIn('paper towels', self.stored('shopV6') or {})
        self.costco_cart()
        self.page.locator('#shopRows .shopQty button').last.click()
        self.assertEqual(self.stored('costcoShopV2')['paper towels']['qty'], 3)
        self.page.locator('#shopRows .check').click()
        self.assertTrue(self.stored('costcoShopV2')['paper towels']['selected'])
        self.assertEqual(self.page.locator('#shopRows .shoprow').count(), 0)
        self.page.reload()
        self.page.wait_for_function("window.ShoppingRelease && ShoppingRelease.state === 'ready'")
        self.assertEqual(self.stored('costcoShopV2')['paper towels']['qty'], 3)

    def test_06_supermarket_quantities_do_not_touch_costco(self):
        self.open_app()
        self.page.click('[data-nav="items"]')
        self.page.fill('#search', 'Milk')
        row = self.page.locator('#itemRows .itemrow').filter(has=self.page.locator('b',has_text='Milk')).first
        name = row.locator('.grow b').inner_text()
        row.locator('.itemQty button').last.click()
        row.locator('.pill').click()
        self.assertEqual(self.stored('shopV6')[name.lower()]['qty'], 2)
        self.assertEqual(self.stored('costcoShopV2'), {})

    def test_07_saved_custom_items_carts_and_recipe_edits_survive(self):
        custom = ['Our custom supermarket item','Pantry','🛒','data:image/png;base64,AA==']
        costco = ['Our custom Costco item','Costco','🏬','data:image/png;base64,AA==']
        override = {'Chicken Lo Mein':[['Our special sauce','Pantry','🫙']]}
        self.seed({'customV2':json.dumps([custom]),'costcoItemsV1':json.dumps([costco]),'recipeIngredientOverridesV1':json.dumps(override),'shopV6':json.dumps({'our item':{'name':'Our item','qty':4,'selected':False}}),'costcoShopV2':json.dumps({'our other item':{'name':'Our other item','qty':7,'selected':True}})})
        self.open_app()
        self.assertIn(custom, self.page.evaluate('items'))
        self.assertIn(costco, self.stored('costcoItemsV1'))
        self.assertEqual(self.stored('shopV6')['our item']['qty'], 4)
        self.assertEqual(self.stored('costcoShopV2')['our other item']['qty'], 7)
        self.assertEqual(self.stored('recipeIngredientOverridesV1'), override)
        self.page.evaluate("openRecipe('Chicken Lo Mein')")
        self.assertTrue(self.page.locator('.recipeEditTop').is_visible())
        self.assertIn('Our special sauce',self.page.locator('#detailBody').inner_text())

    def test_08_calendar_labels_and_single_meal_views(self):
        self.open_app()
        self.page.evaluate('cal=new Date(2026,9,1);renderMonth()')
        self.assertEqual(self.page.locator('#cal .date > div:not(.evt)').count(), 0)
        for label in ['Shabbos Night','Shabbos Day']:
            self.page.click('[data-nav="home"]')
            self.page.locator('#cal .date').filter(has_text=label).first.click()
            self.assertEqual(self.page.locator('#supContent .menuCard').count(), 1)
            expected = 'Friday Night' if label.endswith('Night') else 'Shabbos Day'
            self.assertEqual(self.page.locator('#supContent .menuHdr h3').inner_text(), expected)
        self.page.evaluate("dateTap('2026-09-12','Rosh Hashana')")
        self.assertEqual(self.page.locator('#supContent .menuCard').count(), 1)
        self.page.evaluate("__setMealView('night')")
        self.assertEqual(self.page.locator('#supContent .menuCard').count(), 1)
        self.assertEqual(self.page.locator('#supContent .menuHdr h3').inner_text(),'Yom Tov Night')

    def test_09_recipe_edit_still_saves_and_reopens(self):
        self.open_app()
        self.page.evaluate("openRecipe('Chicken Lo Mein')")
        self.page.once('dialog', lambda dialog: dialog.accept('Chicken cubes, Garlic, Soy sauce'))
        self.page.click('.recipeEditTop')
        self.assertEqual([i[0] for i in self.stored('recipeIngredientOverridesV1')['Chicken Lo Mein']],['Chicken cubes','Garlic','Soy sauce'])
        self.page.reload()
        self.page.wait_for_function("window.ShoppingRelease && ShoppingRelease.state === 'ready'")
        self.page.evaluate("openRecipe('Chicken Lo Mein')")
        self.assertEqual(self.page.locator('.ingredientItem').count(),3)

    def test_10_loader_waits_for_slow_parser(self):
        original = (ROOT/'index.html').read_text()
        delayed = original.replace('<script>\nconst $=', '<script src="parser-delay.js"></script>\n<script>\nconst $=', 1)
        def serve_delay(route):
            time.sleep(0.5)
            route.fulfill(body='window.parserDelayComplete=true;',content_type='application/javascript')
        self.page.route(self.url+'/', lambda route:route.fulfill(body=delayed,content_type='text/html'))
        self.page.route('**/parser-delay.js',serve_delay)
        self.open_app()
        self.assertTrue(self.page.evaluate('parserDelayComplete'))

    def test_11_failed_asset_shows_error_without_erasing_saved_data(self):
        self.seed({'shopV6':'{"milk":{"name":"Milk","qty":2,"selected":false}}','costcoItemsV1':'[["Our item","Costco","🏬"]]'})
        self.page.route('**/vendor/stable-a68edc6.js*', lambda route:route.abort())
        self.page.goto(self.url+'/')
        self.page.wait_for_selector('#releaseLoadError')
        self.assertEqual(self.page.evaluate('ShoppingRelease.state'),'error')
        self.assertEqual(self.stored('shopV6')['milk']['qty'],2)
        self.assertEqual(self.stored('costcoItemsV1')[0][0],'Our item')

    def test_12_backup_export_is_exact_and_does_not_change_storage(self):
        data = {'shopV6':'{"milk":{"name":"Milk","qty":3}}','costcoItemsV1':'[["Pampers","Costco","👶"]]','recipeIngredientOverridesV1':'{"Recipe":[["Our ingredient","Pantry","🫙"]]}','itemStoreV2':'costco','unrelated-auth-token':'do-not-export'}
        self.seed(data)
        self.page.goto(self.url+'/backups.html')
        with self.page.expect_download() as event:
            self.page.click('#download')
        payload = json.loads(Path(event.value.path()).read_text())
        self.assertEqual(payload['format'],'shopping-list-backup')
        expected = {k:v for k,v in data.items() if k != 'unrelated-auth-token'}
        self.assertEqual(payload['storage'], expected)
        self.assertEqual(self.page.evaluate('Object.fromEntries(Object.entries(localStorage))'), data)
        self.assertEqual(self.errors,[])

    def test_13_empty_preview_does_not_claim_to_back_up_live_data(self):
        self.page.goto(self.url+'/backups.html')
        self.assertTrue(self.page.locator('#download').is_disabled())
        self.assertIn('No saved app data',self.page.locator('#summary').inner_text())
        self.assertEqual(self.page.evaluate('localStorage.length'),0)

if __name__ == '__main__':
    unittest.main()
