import {test, expect} from '@playwright/test';

test('supplied brand SVGs are served and the compact wordmark loads as artwork', async ({page}) => {
  for(const asset of ['stacked','symbol','wordmark-flat','wordmark-depth','wordmark-reversed']) {
    const r=await page.request.get('/branding/kawing-'+asset+'.svg');
    expect(r.ok()).toBe(true);
    expect(await r.text()).toContain('<svg');
  }
  await page.goto('/');
  const logo=page.locator('.spaces-brand a');
  await expect(logo.getByRole('img',{name:'Kawing & Co.'})).toBeVisible();
  const art=logo.locator('img.art-flat');
  await expect.poll(()=>art.evaluate(e=>e.complete && e.naturalWidth>0)).toBe(true);
  expect(await page.locator('link[rel=icon]').getAttribute('href')).toBe('/branding/kawing-symbol.svg');
  await expect(page.locator('.brand-stacked')).toBeVisible();
  await expect(page.locator('.company-mark-reversed img')).toHaveAttribute('src','/branding/kawing-wordmark-reversed.svg');
});

test('logo hover reveals the supplied depth variant and keyboard navigation still works', async ({page}) => {
  await page.goto('/');
  const logo=page.locator('.spaces-brand a');
  await logo.hover();
  await expect.poll(()=>logo.locator('.art-depth').evaluate(e=>Number(getComputedStyle(e).opacity))).toBe(1);
  await page.mouse.move(0,0);
  await expect.poll(()=>logo.locator('.art-depth').evaluate(e=>Number(getComputedStyle(e).opacity))).toBe(0);
  await page.goto('/?scenario=standard');
  await page.locator('.spaces-brand a').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.demo-introduction')).toBeVisible();
});

test('button press gives immediate feedback and keeps the experience action functional', async ({page}) => {
  await page.goto('/');
  const button=page.getByRole('button',{name:'Choose your experience',exact:true});
  const box=await button.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await expect(button).toHaveClass(/k-pressed/);
  await page.mouse.up();
  await expect(button).not.toHaveClass(/k-pressed/);
  await expect(page.locator('#experience-choices')).toBeFocused();
  await page.getByRole('button',{name:/Explore a business/}).click();
  await expect(page.getByRole('heading',{name:'Choose your view.'})).toBeVisible();
});

test('reduced motion disables logo movement and confirmations while actions remain usable', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const logo=page.locator('.spaces-brand a');
  await logo.hover();
  expect(await logo.locator('.company-wordmark').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
  expect(await logo.locator('.brand-symbol').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
  await page.getByRole('button',{name:'Choose your experience',exact:true}).click();
  await expect(page.locator('#experience-choices')).toBeFocused();
  expect(await page.getByRole('button',{name:'Choose your experience',exact:true}).evaluate(e=>getComputedStyle(e).transform)).toBe('none');
});
