import {test,expect} from '@playwright/test';

test('landing animates real local vectors immediately and has an interactive visit story',async({page})=>{
  const external=[];page.on('request',r=>{if(/lottiefiles|lottie\.host/.test(r.url()))external.push(r.url());});
  await page.goto('/');
  const loop=page.locator('.connection-badge .motion-glyph');
  await expect(loop).toHaveAttribute('data-lottie-ready','true');
  await expect(loop).toHaveAttribute('data-lottie-state','playing');
  const vector=loop.locator('.motion-vector svg');const before=await vector.innerHTML();
  await expect.poll(()=>vector.innerHTML()).not.toBe(before);
  await expect(page.locator('.logo-orbit')).toHaveCount(0);
  await page.getByRole('button',{name:/03 Bring it together/}).click();
  await expect(page.locator('.visit-preview')).toContainText('Admin perspective');
  await expect(page.locator('.connected-visit')).toHaveAttribute('data-active-step','2');
  await page.waitForTimeout(4700); // Automatic rotation yields permanently after a deliberate selection.
  await expect(page.locator('.connected-visit')).toHaveAttribute('data-active-step','2');
  expect(external).toEqual([]);
  await page.getByRole('button',{name:'Choose your experience',exact:true}).click();
  await expect(page.locator('.experience-selection')).toBeVisible();
  await expect(page.locator('.demo-introduction')).toHaveCount(0);
});

test('pause is persistent and replay remains available through keyboard focus',async({page})=>{
  await page.goto('/');
  const arrow=page.locator('.demo-start .motion-glyph');
  await expect(arrow).toHaveAttribute('data-lottie-state','complete');
  await page.getByRole('button',{name:'Choose your experience',exact:true}).focus();
  await expect(arrow).toHaveAttribute('data-lottie-state','playing');
  await page.getByRole('button',{name:'Pause motion',exact:true}).click();
  await expect(page.locator('.entry-mobile-first')).toHaveAttribute('data-motion','off');
  await expect(page.locator('.motion-vector svg')).toHaveCount(0);
  await page.reload();await expect(page.getByRole('button',{name:'Play motion',exact:true})).toBeVisible();
  await expect(page.locator('.logo-orbit')).toHaveCount(0);
  await page.getByRole('button',{name:'Play motion',exact:true}).click();
  await expect(page.locator('.connection-badge .motion-glyph')).toHaveAttribute('data-lottie-state','playing');
});

test('offscreen and hidden-page playback pauses; visible page can resume',async({page})=>{
  await page.goto('/');const loop=page.locator('.connection-badge .motion-glyph');
  await expect(loop).toHaveAttribute('data-lottie-state','playing');
  await page.locator('.spaces-footer').scrollIntoViewIfNeeded();await expect(loop).toHaveAttribute('data-lottie-state','paused');
  await page.evaluate(()=>window.scrollTo(0,0));await expect(loop).toHaveAttribute('data-lottie-state','playing');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(loop).toHaveAttribute('data-lottie-state','paused');
  await expect(page.locator('.entry-mobile-first')).toHaveAttribute('data-page-hidden','true');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(loop).toHaveAttribute('data-lottie-state','playing');
});

test('reduced motion at 360px loads no player and keeps controls and entry usable',async({page})=>{
  await page.setViewportSize({width:360,height:800});await page.emulateMedia({reducedMotion:'reduce'});
  const runtime=[];page.on('request',r=>{if(/lottie_light/.test(r.url()))runtime.push(r.url());});
  await page.goto('/');await expect(page.getByRole('button',{name:'Reduced motion enabled'})).toBeDisabled();
  await expect(page.locator('.motion-vector svg')).toHaveCount(0);
  await expect(page.locator('.logo-orbit')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:/02 Run the business/}).click();await expect(page.locator('.visit-preview')).toContainText('Merchant perspective');
  await page.getByRole('button',{name:'Choose your experience',exact:true}).click();await expect(page).toHaveURL(/screen=experiences/);
  expect(runtime).toEqual([]);
});

test('unavailable animation runtime keeps static content and navigation usable',async({page})=>{
  await page.route(/lottie-web.*lottie_light|lottie_light.*\.js/,route=>route.abort());
  await page.goto('/');await expect(page.locator('.demo-start .motion-fallback')).toBeVisible();
  await page.getByRole('button',{name:'Choose your experience',exact:true}).click();await expect(page.locator('.experience-selection')).toBeVisible();
  const r=await page.request.get('/motion/LICENSE.txt');expect(r.ok()).toBe(true);expect(await r.text()).toContain('Lottie Simple License');
  const credits=await page.request.get('/motion/CREDITS.txt');expect(credits.ok()).toBe(true);expect(await credits.text()).toContain('Pedro Aquino');
});
