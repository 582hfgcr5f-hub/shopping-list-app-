"""Modern theme checks. Disposable test data only; never target production."""
import json
import os
from pathlib import Path
import unittest
import test_release

class ModernTests(unittest.TestCase):
    setUpClass = classmethod(test_release.ReleaseTests.setUpClass.__func__)
    tearDownClass = classmethod(test_release.ReleaseTests.tearDownClass.__func__)
    setUp = test_release.ReleaseTests.setUp
    tearDown = test_release.ReleaseTests.tearDown
    serve_local = test_release.ReleaseTests.serve_local
    open_app = test_release.ReleaseTests.open_app
    seed = test_release.ReleaseTests.seed
    stored = test_release.ReleaseTests.stored
    costco_items = test_release.ReleaseTests.costco_items
    costco_cart = test_release.ReleaseTests.costco_cart

    def capture(self, name, selector=None):
        folder = test_release.ROOT/'screenshots'
        folder.mkdir(exist_ok=True)
        target = folder/(name+'.png')
        if selector:
            self.page.locator(selector).screenshot(path=str(target))
        else:
            self.page.screenshot(path=str(target), full_page=True)

    def test_modern_01_home_uses_real_counts_and_shortcuts(self):
        self.seed({'shopV6':json.dumps({'milk':{'name':'Milk','cat':'Dairy','photo':'🥛','qty':3,'selected':False}}),'costcoShopV2':json.dumps({'water':{'name':'Water','photo':'💧','qty':4,'selected':False},'soap':{'name':'Soap','photo':'🧼','qty':1,'selected':True}})})
        self.open_app()
        self.assertTrue(self.page.evaluate('ModernInterface.ready'))
        self.assertEqual(self.page.locator('#home-supermarket-count').inner_text(),'1 item to buy')
        self.assertEqual(self.page.locator('#home-costco-count').inner_text(),'1 item to buy')
        self.assertEqual(self.page.locator('.modernListRow').count(),2)
        self.capture('home')
        self.page.click('[data-home-store="costco"]')
        self.assertTrue(self.page.locator('#shopping').is_visible())
        self.assertIn('on',self.page.locator('[data-store-scope="shopping"] [data-store="costco"]').get_attribute('class'))
        self.assertEqual(self.page.locator('#shopRows .grow b').all_text_contents(),['Water'])
        self.assertEqual(self.stored('shopV6')['milk']['qty'],3)
        self.page.locator('#shopRows .check').click()
        self.page.click('[data-nav="home"]')
        self.page.wait_for_function("document.getElementById('home-costco-count').textContent==='0 items to buy'")
        self.assertEqual(self.page.locator('#home-supermarket-count').inner_text(),'1 item to buy')

    def test_modern_02_recipe_tiles_open_existing_editable_recipes(self):
        self.open_app()
        before = self.page.evaluate('JSON.stringify(RECIPES)')
        for name in self.page.locator('.modernRecipeTile b').all_text_contents():
            self.assertTrue(self.page.evaluate('name => Object.hasOwn(RECIPES,name)',name))
        self.page.locator('.modernRecipeTile').first.click()
        self.assertIn('Chicken Lo Mein',self.page.locator('#detailBody .recipeHero').inner_text())
        self.assertTrue(self.page.locator('.recipeEditTop').is_visible())
        self.assertEqual(self.page.evaluate('JSON.stringify(RECIPES)'),before)
        self.capture('recipe','#detail .sheet')

    def test_modern_03_all_phone_columns_and_rows_fit(self):
        self.open_app()
        for width in [320,375,390,430,768,1280]:
            self.page.set_viewport_size({'width':width,'height':900})
            self.page.click('[data-nav="home"]')
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
            bounds = self.page.locator('#homeCalendar').bounding_box()
            cells = self.page.locator('#cal .date').evaluate_all('(nodes)=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right}})')
            for cell in cells:
                self.assertGreaterEqual(cell['left'],bounds['x'])
                self.assertLessEqual(cell['right'],bounds['x']+bounds['width'])
            self.costco_items()
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
            self.assertEqual(self.page.locator('#itemRows .grow b').all_text_contents(),test_release.COSTCO)
        self.page.set_viewport_size({'width':390,'height':844})
        self.capture('costco-items')

    def test_modern_04_calendar_navigation_and_labels_preserved(self):
        self.open_app()
        self.page.evaluate('cal=new Date(2026,9,1);renderMonth()')
        self.page.wait_for_function("document.querySelectorAll('#cal [data-date]').length===42")
        self.assertEqual(self.page.locator('#cal .date > div:not(.evt)').count(),0)
        self.assertEqual(self.page.locator('[data-nav]').count(),4)
        self.capture('calendar','#homeCalendar')
        for label in ['Shabbos Night','Shabbos Day']:
            self.page.click('[data-nav="home"]')
            self.page.locator('#cal .date').filter(has_text=label).first.click()
            self.assertEqual(self.page.locator('#supContent .menuCard').count(),1)
        self.capture('shabbos','#suppers')
        self.page.click('[data-nav="home"]')
        self.page.locator('#homeCalendar .modernTextButton').click()
        self.assertTrue(self.page.locator('#cal .is-today').count()>=1)

    def test_modern_05_theme_does_not_write_or_migrate_data(self):
        text=(test_release.ROOT/'modern-interface.js').read_text()
        for forbidden in ['localStorage.setItem','localStorage.clear','localStorage.removeItem','items.push','costcoItems.push','save(', 'persist(']:
            self.assertNotIn(forbidden,text)
        self.open_app()
        before=self.page.evaluate('JSON.stringify({items,shop,suppers,H})')
        self.page.click('[data-nav="items"]')
        self.page.click('[data-nav="home"]')
        self.page.locator('#homeCalendar .modernTextButton').click()
        after=self.page.evaluate('JSON.stringify({items,shop,suppers,H})')
        self.assertEqual(before,after)
        self.assertEqual(self.page.locator('#startShopBtn,.favStar').count(),0)

    def test_modern_06_readable_store_labels_when_logo_unavailable(self):
        self.open_app()
        self.costco_items()
        self.assertEqual(self.page.locator('[data-store-scope="items"] [data-store="costco"]').get_attribute('aria-label'),'Costco')
        self.assertEqual(self.page.locator('[data-store-scope="items"] [data-store="supermarket"]').get_attribute('aria-label'),'Supermarket')
        self.page.locator('#itemRows .itemrow').first.locator('.pill').click()
        self.assertEqual(self.stored('costcoShopV2')['paper towels']['qty'],1)

    def test_modern_07_bundled_recipe_thumbnails_load(self):
        self.open_app()
        self.page.wait_for_function("document.querySelectorAll('.modernRecipeArt img').length===3",timeout=5000)
        self.assertTrue(self.page.locator('.modernRecipeArt img').evaluate_all('(nodes)=>nodes.every(n=>n.naturalWidth>0)'))
        self.capture('home-empty')

if __name__ == '__main__':
    unittest.main()
