import{test,expect}from'@playwright/test';
import{boundMapView}from'../src/BoothMap.jsx';
import{validateLayout,seedMarket}from'../src/market-layout.js';

test('map bounds and both pedestrian walkways are protected',()=>{
  expect(boundMapView({zoom:99,x:999,y:-5})).toEqual({zoom:3,x:100-100/3,y:0});
  expect(boundMapView({zoom:NaN,x:NaN,y:Infinity})).toEqual({zoom:1,x:0,y:0});
  expect(validateLayout(seedMarket().booths)).toBe('');
  expect(validateLayout([{id:'X',x:56,y:5,w:7,h:10}])).toContain('cross-access');
  expect(validateLayout([{id:'X',x:5,y:30,w:7,h:10}])).toContain('central walkway');
});

test('entry pages are separate and browser history restores each stage',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.demo-introduction')).toBeVisible();
  await expect(page.locator('.experience-selection')).toHaveCount(0);
  await page.getByRole('button',{name:'Choose your experience',exact:true}).click();
  await expect(page).toHaveURL(/screen=experiences$/);
  await expect(page.locator('.demo-introduction')).toHaveCount(0);
  await expect(page.locator('.scenario-card')).toHaveCount(2);
  await page.getByRole('button',{name:/Explore a market/}).click();
  await expect(page).toHaveURL(/scenario=market$/);
  await expect(page.locator('.experience-selection,.demo-introduction')).toHaveCount(0);
  await page.goBack();await expect(page.locator('.scenario-card')).toHaveCount(2);
  await page.goBack();await expect(page.locator('.demo-introduction')).toBeVisible();
  await page.goForward();await expect(page.locator('#experience-choices')).toBeVisible();
});

test('map keeps spatial context under filtering and shares selection with business details',async({page})=>{
  await page.goto('/?scenario=market&workspace=customer');
  await page.getByLabel('Search booths',{exact:true}).fill('Luna');
  await expect(page.locator('.map-spot')).toHaveCount(10);
  await expect(page.locator('.map-dimmed')).toHaveCount(9);
  await expect(page.getByRole('button',{name:'B02 Occupied',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'B07 Occupied',exact:true}).click();
  await expect(page.getByLabel('Booth details',{exact:true})).toContainText('Luna Made');
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  await expect(page.locator('.map-dimmed')).toHaveCount(0);
  await page.getByRole('button',{name:'B02 Occupied',exact:true}).click();
  await page.getByRole('button',{name:'Open Business Profile',exact:false}).click();
  await expect(page.getByRole('button',{name:'Preview options',exact:true})).toBeVisible();
});

test('drag is bounded and never accidentally selects a booth; keyboard and fit work',async({page})=>{
  await page.goto('/?scenario=market&workspace=customer');
  const map=page.getByRole('group',{name:'Booth layout',exact:true});
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect(page.locator('.explorer-zoom [aria-label="Map zoom"]')).toHaveText('125%');
  await map.scrollIntoViewIfNeeded();const r=await map.boundingBox();
  await page.mouse.move(r.x+r.width*.5,r.y+r.height*.5);await page.mouse.down();
  await page.mouse.move(r.x+r.width*.2,r.y+r.height*.4,{steps:8});await page.mouse.up();
  const values=(await map.getAttribute('viewBox')).split(' ').map(Number);
  expect(values[0]).toBeGreaterThanOrEqual(0);expect(values[0]+values[2]).toBeLessThanOrEqual(100.001);
  await expect(page.locator('.booth-detail[data-selected=true]')).toHaveCount(0);
  await map.focus();await page.keyboard.press('+');await expect(page.locator('.explorer-zoom [aria-label="Map zoom"]')).toHaveText('150%');
  await page.keyboard.press('Home');await expect(map).toHaveAttribute('viewBox','0 0 100 70');
});

test.describe('phone map',()=>{
  test.use({viewport:{width:360,height:800},isMobile:true,hasTouch:true});
  test('selection opens a reachable sheet, Escape returns to the booth, and gestures reset',async({page})=>{
    await page.goto('/?scenario=market&workspace=customer');
    const map=page.getByRole('group',{name:'Booth layout',exact:true});
    expect(await map.evaluate(e=>getComputedStyle(e).touchAction)).toBe('pan-y');
    await page.getByRole('button',{name:'B02 Occupied',exact:true}).click();
    const detail=page.getByLabel('Booth details',{exact:true});await expect(detail).toBeFocused();
    const r=await detail.boundingBox();expect(r.y+r.height).toBeLessThanOrEqual(801);
    await page.keyboard.press('Escape');await expect(page.locator('#map-B02')).toBeFocused();
    await expect(detail).toHaveAttribute('data-selected','false');
    await page.getByRole('button',{name:'Enable map gestures',exact:true}).click();
    expect(await map.evaluate(e=>getComputedStyle(e).touchAction)).toBe('none');
    await map.scrollIntoViewIfNeeded();const box=await map.boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-25,y:cy,id:1},{x:cx+25,y:cy,id:2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-45,y:cy,id:1},{x:cx+45,y:cy,id:2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect.poll(async()=>Number((await page.locator('.explorer-zoom [aria-label="Map zoom"]').innerText()).replace('%',''))).toBeGreaterThan(100);
    await page.getByRole('button',{name:'Fit map',exact:true}).click();
    await expect(map).toHaveAttribute('viewBox','0 0 100 70');
    expect(await map.evaluate(e=>getComputedStyle(e).touchAction)).toBe('pan-y');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
});
