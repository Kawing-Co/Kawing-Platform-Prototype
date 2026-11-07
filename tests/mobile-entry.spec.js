import {test, expect} from '@playwright/test';

test('phone introduction explains the demo and leads to a compact addressable view picker', async ({page}) => {
  await page.setViewportSize({width:360,height:800});
  await page.goto('/');
  await expect(page.locator('.company-wordmark').first()).toHaveText('Kawing&Co.');
  await expect(page.locator('.demo-purpose-card')).toContainText('Everyone connected.');
  await expect(page.locator('.demo-introduction')).toContainText('No real payments');
  await page.getByRole('button',{name:'Choose your experience'}).click();
  await expect(page).toHaveURL(/screen=experiences/);
  await expect(page.locator('.demo-introduction')).toHaveCount(0);
  await expect(page.locator('#experience-choices')).toBeFocused();
  await page.getByRole('button',{name:/Explore a business/}).click();
  await expect(page.getByRole('heading',{name:'Choose your view.'})).toBeVisible();
  await expect(page.locator('.demo-introduction,.spaces-collage,.spaces-intro')).toHaveCount(0);
  await expect(page.locator('.space-role-cards>button')).toHaveCount(3);
  await page.getByRole('radio',{name:/the usual\./}).click();
  await expect(page).toHaveURL(/business=usual/);
  await page.getByRole('button',{name:/Enter Customer View/}).click();
  await expect(page.getByRole('button',{name:'Preview options',exact:true})).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading',{name:'Choose your view.'})).toBeVisible();
  await expect(page.getByRole('radio',{name:/the usual\./})).toHaveAttribute('aria-checked','true');
  await page.getByRole('button',{name:'Back to scenarios',exact:true}).click();
  await expect(page.locator('.experience-selection')).toBeVisible();
  await page.getByRole('button',{name:'Back to introduction',exact:true}).click();
  await expect(page.locator('.demo-introduction')).toBeVisible();
  await expect(page.locator('.experience-selection')).toHaveCount(0);
});

test('command search and its keyboard shortcut are gone throughout the experience', async ({page}) => {
  for(const url of ['/', '/?scenario=standard', '/?scenario=standard&workspace=merchant', '/?scenario=market&workspace=admin']) {
    await page.goto(url);
    await expect(page.locator('.company-wordmark').first()).toBeVisible();
    await expect(page.getByRole('button',{name:'Open quick actions'})).toHaveCount(0);
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog',{name:'Quick actions',exact:true})).toHaveCount(0);
    await expect(page.getByRole('combobox',{name:'Search actions'})).toHaveCount(0);
  }
});

for (const width of [360, 768]) test(`all six views work at ${width}px without overflow or console errors`, async ({page}) => {
  test.setTimeout(60000);
  await page.setViewportSize({width,height:800});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const scenario of ['standard','market']) {
    await page.goto('/?scenario='+scenario);
    for(const role of ['Merchant View','Customer View','Admin View']) {
      await page.getByRole('button',{name:new RegExp('Enter '+role)}).click();
      await expect(page.getByRole('button',{name:'Switch View',exact:true})).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.getByRole('button',{name:'More',exact:true}).click();
      await page.getByRole('button',{name:'Change Scenario',exact:true}).click();
      await page.getByRole('button',{name:scenario==='standard'?/Explore a business/:/Explore a market/}).click();
      await expect(page.locator('.demo-introduction,.spaces-collage')).toHaveCount(0);
    }
  }
  expect(errors).toEqual([]);
});
