import {test, expect} from '@playwright/test';

test('merchant color changes do not recolor the company workspace', async ({page}) => {
  await page.goto('/?scenario=standard&workspace=merchant#Customization');
  const company=()=>page.locator('.app').evaluate(e=>getComputedStyle(e).getPropertyValue('--brand').trim());
  expect(await company()).toBe('#14284b');
  await page.getByRole('button',{name:'Use brand color #8b4f36',exact:true}).click();
  await page.getByRole('button',{name:'Save design',exact:true}).first().click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('kawing-demo-v1')).brand.accent)).toBe('#8b4f36');
  expect(await company()).toBe('#14284b');
  expect(await page.locator('.studio-heading .primary').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(20, 40, 75)');
});

test('Studio chrome uses blue neutral surfaces while merchant storefront keeps its primary', async ({page}) => {
  await page.goto('/?scenario=standard&workspace=merchant#Customization');
  const toolbar=page.locator('.studio-toolbar [role=tablist]');
  expect(await toolbar.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(237, 241, 247)');
  await page.goto('/?surface=guest&entry=counter#Customer');
  const primary=await page.locator('.sf-shell').evaluate(e=>getComputedStyle(e).getPropertyValue('--sf-primary').trim());
  expect(primary).not.toBe('#14284b');
  expect(primary).toMatch(/^#/);
});
