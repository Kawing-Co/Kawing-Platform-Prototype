import {test,expect} from '@playwright/test';
import {MENU_ITEMS} from '../src/blackball.js';
import {photoCropStyle} from '../src/merchant.js';
const collages=/\/(breakfast|sandwiches|rice-bowls|salads|pizza|pasta|fries|matcha-tray)\.png$/;
test('product photography uses individually sourced breakfasts and explicit single-dish frames',()=>{
 const breakfast=MENU_ITEMS.filter(i=>i.category==='All-Day Breakfast');expect(breakfast).toHaveLength(8);
 for(const item of breakfast){expect(item.image).toContain('/reference/');expect(item.illustrative).toBe(true);}
 for(const item of MENU_ITEMS.filter(i=>collages.test(i.image))){expect(item.photoCrop,item.name).toHaveLength(4);expect(photoCropStyle(item),item.name).toBeTruthy();expect(item.photoRevision).toBe(2);}
 expect(photoCropStyle({photoCrop:[0,0,0,1]})).toBeUndefined();
});
test('mobile breakfast images load and photo refresh preserves orders, pricing and custom images',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?surface=guest&merchant=blackball&entry=counter');await page.waitForFunction(()=>localStorage.getItem('kawing-merchant-v2:blackball'));
 const orders=await page.evaluate(()=>{const k='kawing-merchant-v2:blackball';const d=JSON.parse(localStorage.getItem(k));const i=d.menu.find(x=>x.id===68);i.image='/images/blackball/breakfast.png';i.images={base:'breakfast',rules:[]};i.photoExt='png';delete i.photoRevision;i.price=398;d.menu.find(x=>x.id===69).image='/images/usual/the-usual-iced.jpg';delete d.menu.find(x=>x.id===69).photoRevision;localStorage.setItem(k,JSON.stringify(d));return d.orders;});
 await page.reload();await page.getByRole('button',{name:'Order now',exact:true}).click();await page.getByRole('button',{name:'All-Day Breakfast',exact:true}).click();
 await expect(page.locator('.cx-food')).toHaveCount(8);
 const first=page.locator('.cx-food').first();await first.scrollIntoViewIfNeeded();await expect.poll(()=>first.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
 expect(await first.locator('img').getAttribute('src')).toContain('corned-beef.jpg');await expect(page.getByRole('link',{name:'Photo credits & licenses'})).toBeVisible();
 const d=await page.evaluate(()=>JSON.parse(localStorage.getItem('kawing-merchant-v2:blackball')));expect(d.orders).toEqual(orders);expect(d.menu.find(i=>i.id===68).price).toBe(398);expect(d.menu.find(i=>i.id===69).image).toBe('/images/usual/the-usual-iced.jpg');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
