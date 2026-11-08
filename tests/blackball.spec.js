import{test,expect}from'@playwright/test';
import{MENU_ITEMS}from'../src/blackball';
import{normalizeMarket}from'../src/operations';
import{seedMarket}from'../src/market-layout';
test('Blackball source prices and catalog are independent',()=>{
 expect(MENU_ITEMS).toHaveLength(104);
 expect(MENU_ITEMS.find(x=>x.name==='Caffe Americano').price).toBe(130);
 expect(MENU_ITEMS.find(x=>x.name==='Blackball Clubhouse Sandwich').price).toBe(275);
 expect(new Set(MENU_ITEMS.map(x=>x.id)).size).toBe(104);
 const d=seedMarket();delete d.catalogRevision;d.profiles=d.profiles.filter(p=>p.id!=='blackball');d.booths=d.booths.map(b=>b.merchant==='blackball'?{...b,merchant:null}:b);
 d.booths.find(b=>b.id==='B05').blocked=true;const next=normalizeMarket(d);
 expect(next.booths.find(b=>b.id==='B05').blocked).toBe(true);expect(next.booths.find(b=>b.merchant==='blackball')).toBeTruthy();
 expect(normalizeMarket(next)).toEqual(next);
});
test('merchant entry starts at Start here; Customize still opens Studio',async({page})=>{
 await page.goto('/?scenario=standard&business=blackball');
 await page.getByRole('button',{name:/Enter Merchant View/}).click();
 await expect(page.getByRole('heading',{name:/A whole business, connected/})).toBeVisible();
 await page.getByRole('button',{name:'Customize',exact:true}).click();
 await expect(page.getByRole('heading',{name:/Kawing Studio/})).toBeVisible();
});
test('Blackball customer ordering uses its menu, separate identity and own record',async({page})=>{
 await page.goto('/?surface=guest&merchant=blackball&entry=counter');
 await expect(page.locator('.blackball-wordmark img')).toHaveAttribute('src','/images/blackball/wordmark.png');
 await page.getByRole('button',{name:'Order now',exact:true}).click();
 await page.getByRole('button',{name:'Customize Caffe Americano',exact:true}).click();
 await page.getByRole('button',{name:/Add to order/i}).click();
 const bag=page.locator('.cx-mobile-bag');if(await bag.isVisible())await bag.click();
 await page.getByRole('button',{name:'Review your order',exact:true}).click();
 await page.getByRole('button',{name:'Place demo order',exact:true}).click();
 await expect(page.locator('.cx-success')).toBeVisible();
 const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('kawing-merchant-v2:blackball')));expect(record.orders.find(o=>!o.seed).total).toBe(130);
 expect(await page.evaluate(()=>localStorage.getItem('kawing-merchant-v2:usual'))).toBeNull();
});
test('Blackball is reachable from the market and selected cards have no top accent arc',async({page})=>{
 await page.goto('/?scenario=market&workspace=customer');await page.getByRole('button',{name:'B05 Occupied',exact:true}).click();
 const card=page.getByLabel('Booth details',{exact:true});await expect(card).toContainText('Blackball Cafe');
 expect(await card.evaluate(e=>getComputedStyle(e).borderTopWidth)).toBe('1px');
 await page.getByRole('button',{name:/Open Business Profile/}).click();await expect(page.frameLocator('iframe').locator('.blackball-wordmark')).toBeVisible();
});
