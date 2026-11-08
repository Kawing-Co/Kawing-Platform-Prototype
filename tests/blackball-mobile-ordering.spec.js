import {test,expect} from '@playwright/test';
import {MENU_ITEMS} from '../src/blackball.js';
import {withBlackballOptions} from '../src/blackballOptions.js';
import {defaultSel,pickImage,unitPrice} from '../src/merchant.js';
test('demo options preserve source pricing and are idempotent',()=>{
 const latte=MENU_ITEMS.find(i=>i.id===2);let sel=defaultSel(latte);expect(unitPrice(latte,sel)).toBe(155);
 const original=pickImage(latte,sel);sel={...sel,size:'large',top:['cream']};expect(unitPrice(latte,sel)).toBe(210);expect(pickImage(latte,sel)).not.toBe(original);
 expect(withBlackballOptions(latte)).toEqual(latte);
 const custom={id:2,price:99,options:[{id:'size',type:'single',choices:[{id:'own',label:'Owner size'}]}]};expect(withBlackballOptions(custom)).toEqual(custom);
});
test('mobile gallery, customization and same-order completion',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?surface=guest&merchant=blackball&entry=counter');
 await page.getByRole('button',{name:'Show Caffe Latte',exact:true}).click();
 await expect(page.getByRole('button',{name:'Customize featured Caffe Latte',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Customize featured Caffe Latte',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Customize Caffe Latte',exact:true});await expect(dialog).toBeVisible();await expect(dialog).toContainText('fictional demo options');
 await dialog.getByRole('radio',{name:/Large/}).click();await dialog.getByRole('checkbox',{name:/Cream cap/}).click();
 await expect.poll(()=>dialog.locator('.k-sheet-photo img').last().getAttribute('src')).toContain('seasalt-latte');
 await expect.poll(()=>dialog.locator('.k-sheet-price').textContent()).toBe('₱210');
 await dialog.getByRole('button',{name:/Add to order/}).click();
 const bag=page.locator('.cx-mobile-bag');if(await bag.isVisible())await bag.click();
 await page.getByRole('button',{name:'Review your order',exact:true}).click();await page.getByRole('button',{name:'Cash at counter',exact:true}).click();await page.getByRole('button',{name:'Place demo order',exact:true}).click();
 await expect(page.locator('.cx-success')).toBeVisible();await page.locator('.bb-simulator summary').click();
 await page.getByRole('button',{name:'Cashier: review demo payment',exact:true}).click();
 await expect(page.locator('.cx-payment-state')).toContainText(/review/i);
 await page.getByRole('button',{name:'Cashier: confirm demo payment',exact:true}).click();
 await page.getByRole('button',{name:'Kitchen: start preparing',exact:true}).click();
 await page.getByRole('button',{name:'Kitchen: mark ready',exact:true}).click();
 await page.getByRole('button',{name:'Team: mark served',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Thank you. See you again!',exact:true})).toBeVisible();
 const order=await page.evaluate(()=>JSON.parse(localStorage.getItem('kawing-merchant-v2:blackball')).orders.filter(o=>!o.seed));expect(order).toHaveLength(1);expect(order[0].total).toBe(210);expect(order[0].status).toBe('served');expect(order[0].paymentStatus).toBe('confirmed');expect(order[0].items[0].sel.top).toEqual(['cream']);
 await page.reload();await page.getByRole('button',{name:/Your current order · Served/}).click();await expect(page.getByRole('heading',{name:'Thank you. See you again!',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
test('gallery supports touch swipe, keyboard and reduced motion',async({page})=>{
 await page.setViewportSize({width:360,height:800});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?surface=guest&merchant=blackball&entry=counter');
 const track=page.getByLabel('Swipe featured products',{exact:true});await track.scrollIntoViewIfNeeded();
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});const r=await track.boundingBox();const y=r.y+r.height*.5;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width*.85,y}]});
 for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+r.width*(.85-i*.085),y}]});await page.waitForTimeout(20);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(page.getByRole('button',{name:'Customize featured Matcha Oat Latte',exact:true})).toBeVisible();
 await track.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('button',{name:'Customize featured Caffe Latte',exact:true})).toBeVisible();
 expect(await track.locator('img').first().evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
test('wallet claim stays distinct from cashier verification',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?surface=guest&merchant=blackball&entry=counter');await page.getByRole('button',{name:'Order now',exact:true}).click();
 await page.getByRole('button',{name:'Add Caffe Americano',exact:true}).click();await page.locator('.cx-mobile-bag').click();await page.getByRole('button',{name:'Review your order',exact:true}).click();await page.getByRole('button',{name:'Place demo order',exact:true}).click();
 await page.locator('.bb-simulator summary').click();await expect(page.locator('.bb-simulator')).toContainText('simulate sending payment first');await expect(page.getByRole('button',{name:'Kitchen: start preparing',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'I’ve sent the demo payment',exact:true}).click();
 await expect(page.getByRole('button',{name:'Cashier: review demo payment',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Kitchen: start preparing',exact:true})).toHaveCount(0);
 const order=await page.evaluate(()=>JSON.parse(localStorage.getItem('kawing-merchant-v2:blackball')).orders.find(o=>!o.seed));expect(order.paymentStatus).toBe('claimed');expect(order.status).toBe('new');
});
