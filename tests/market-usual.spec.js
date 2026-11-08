import{test,expect}from'@playwright/test';
import{normalizeMarket}from'../src/operations.js';
import{seedMarket}from'../src/market-layout.js';
test('catalog migration preserves assignments and runs only once',()=>{
 const old=seedMarket();delete old.catalogRevision;old.profiles=old.profiles.filter(p=>p.id!=='usual');old.booths=old.booths.map(b=>b.merchant==='usual'?{...b,merchant:null}:b);
 old.booths.find(b=>b.id==='B04').merchant='luna';const d=normalizeMarket(old);
 expect(d.booths.find(b=>b.id==='B04').merchant).toBe('luna');expect(d.booths.filter(b=>b.merchant==='usual')).toHaveLength(1);
 d.booths=d.booths.map(b=>b.merchant==='usual'?{...b,merchant:null}:b);expect(normalizeMarket(d).booths.some(b=>b.merchant==='usual')).toBe(false);
});
test('the usual booth opens its own full business menu',async({page})=>{
 await page.goto('/?scenario=market&workspace=customer');await page.getByRole('button',{name:'B04 Occupied',exact:true}).click();
 await expect(page.getByLabel('Booth details',{exact:true})).toContainText('the usual.');
 await page.getByRole('button',{name:/Open Business Profile/}).click();
 await expect(page.locator('iframe')).toHaveCount(1);
 const guest=page.frameLocator('iframe');
 await expect(guest.locator('body')).toContainText('the usual');
 await guest.getByRole('button',{name:'Order now',exact:true}).click();
 await guest.getByRole('button',{name:'Customize the usual',exact:true}).click();
 await guest.getByRole('button',{name:/Add to order/i}).click();
 const bag=guest.locator('.cx-mobile-bag');if(await bag.isVisible())await bag.click();
 await guest.getByRole('button',{name:'Review your order',exact:true}).click();
 await guest.getByRole('button',{name:'Place demo order',exact:true}).click();
 await expect(guest.locator('.cx-success')).toBeVisible();
 const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('kawing-merchant-v2:usual')));
 expect(record.orders.some(o=>!o.seed)).toBe(true);

});
