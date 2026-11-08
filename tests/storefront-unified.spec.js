import {test,expect} from '@playwright/test';
import {MENU_ITEMS} from '../src/blackball.js';
import {photoPath} from '../src/merchant.js';
for(const width of [390,1440])for(const merchant of ['salo','usual','blackball'])test(`${merchant} shared neutral storefront at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto(`/?surface=guest&merchant=${merchant}&entry=table&table=05`);
 const hero=page.locator('.sf-brand-hero');await expect(hero).toHaveCSS('background-color','rgb(245, 242, 236)');
 await expect.poll(()=>page.locator('.sf-cover').evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
 const bounds=await page.locator('.sf-cover').evaluate(e=>{const p=e.closest('.sf-hero-media');return {width:e.clientWidth,height:e.clientHeight,parent:p.clientHeight}});
 expect(bounds.width).toBeGreaterThan(100);expect(bounds.height).toBe(bounds.parent);expect(bounds.height).toBeGreaterThan(150);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.getByRole('button',{name:'Order now',exact:true}).click();await expect(page.locator('.cx-grid')).toBeVisible();
 await expect(page.locator('.cx-hero')).toHaveCSS('background-color','rgb(245, 242, 236)');
});
test('Blackball reference photos resolve in list and modifier paths',async({request})=>{
 const paths=[...new Set(MENU_ITEMS.flatMap(i=>[i.image,photoPath(i,i.images.base),photoPath(i,i.images.base,true)]))];
 for(const path of paths){const r=await request.get(path);expect(r.status(),path).toBe(200);expect(r.headers()['content-type'],path).toMatch(/^image\//);}
 expect(MENU_ITEMS.some(i=>i.photoExt==='svg')).toBe(false);
});
test('old placeholder photos migrate without losing merchant records',async({page})=>{
 await page.goto('/?surface=guest&merchant=blackball');await page.waitForFunction(()=>localStorage.getItem('kawing-merchant-v2:blackball'));
 const result=await page.evaluate(()=>{const key='kawing-merchant-v2:blackball';const d=JSON.parse(localStorage.getItem(key));const item=d.menu.find(x=>x.illustrative);item.image='/images/blackball/category-coffee.svg';item.price=777;item.available=false;d.brand.tagline='Owner custom copy';localStorage.setItem(key,JSON.stringify(d));return {id:item.id,orders:d.orders};});
 await page.reload();await expect.poll(()=>page.evaluate(id=>{const d=JSON.parse(localStorage.getItem('kawing-merchant-v2:blackball'));return d.menu.find(x=>x.id===id).image},result.id)).toContain('/reference/');
 const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('kawing-merchant-v2:blackball')));const item=record.menu.find(x=>x.id===result.id);
 expect(item.price).toBe(777);expect(item.available).toBe(false);expect(record.brand.tagline).toBe('Owner custom copy');expect(record.orders).toEqual(result.orders);
 await page.getByRole('button',{name:'Order now',exact:true}).click();await expect(page.locator('.merchant-photo-stamp').first()).toHaveText('blackball cafe');
});
