import { test, expect } from '@playwright/test';

const state = page => page.evaluate(() => JSON.parse(localStorage.getItem('kawing-demo-v1')));
const customer = async page => {await page.getByRole('button',{name:'Customer hub',exact:true}).click();await page.getByLabel('Entry context',{exact:true}).selectOption('table:05');await page.getByRole('button',{name:'Order now',exact:true}).click();};
const kitchen = page => page.getByRole('button', { name: 'Staff kitchen', exact: true }).click();

async function placeOrder(page, { offline = false } = {}) {
  await customer(page);
  await page.getByRole('button', { name: 'Add Matcha Latte', exact: true }).click();
  const bag = page.locator('.cx-mobile-bag');   // on phones the order opens as a bottom sheet
  if (await bag.isVisible()) await bag.click();
  await page.getByRole('button', { name: 'Increase Matcha Latte in order' }).click();
  await expect(page.locator('.cx-total')).toContainText('460');
  await page.getByRole('button', { name: 'Remove Matcha Latte from order' }).click();
  await expect(page.locator('.cx-total')).toContainText('230');
  await page.getByRole('button', { name: 'Review your order' }).click();
  await expect(page.getByText('No payment details or real charges.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: offline ? 'Save order offline' : 'Place demo order', exact: true }).click();
  await expect(page.locator('.cx-success')).toBeVisible();
  if(!offline)await page.getByRole('button',{name:'I’ve sent the demo payment'}).click();
  return (await state(page)).orders.find(o => !o.seed);
}

test.beforeEach(async ({ page }) => { await page.goto('/?workspace=merchant#Start%20here'); });

test('one customer order connects receipt, kitchen, owner totals, and reload', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const order = await placeOrder(page);
  expect(order.total).toBe(230);
  expect(order.items[0].qty).toBe(1);
  await expect(page.locator('.cx-success')).toContainText('no money was charged');
  await kitchen(page);
  const card = page.locator('.kitchen-card').filter({ hasText: order.id });
  await expect(card).toContainText('Matcha Latte');
  await expect(card.getByRole('button',{name:'Start preparing'})).toBeDisabled();
  await card.getByRole('button',{name:'Review payment',exact:true}).click();
  await card.getByRole('button',{name:'Confirm payment',exact:true}).click();
  await card.getByRole('button', { name: 'Start preparing' }).click();
  await card.getByRole('button', { name: 'Mark ready' }).click();
  await card.getByRole('button', { name: 'Mark served' }).click();
  await expect(card).toBeVisible();
  expect((await state(page)).orders.find(o => o.id === order.id).status).toBe('served');
  await customer(page);
  await expect(page.locator('.cx-success')).toContainText('Your order has been served');
  await page.getByRole('button', { name: 'Owner workspace', exact: true }).click();
  await expect(page.locator('.stat-card').first()).toContainText('16,070');
  await page.reload();
  expect((await state(page)).orders.filter(o => o.id === order.id)).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('offline queue survives reload and reconnects exactly once', async ({ page }) => {
  await page.getByRole('button', { name: 'All systems connected', exact: true }).click();
  const order = await placeOrder(page, { offline: true });
  expect(order.status).toBe('queued');
  await expect(page.locator('.cx-success')).toContainText('saved on this device');
  await kitchen(page);
  await expect(page.locator('.kitchen-card').filter({ hasText: order.id })).toContainText('awaiting reconnect');
  await page.reload();
  expect((await state(page)).orders.find(o => o.id === order.id).status).toBe('queued');
  await page.getByRole('button', { name: 'Reconnect', exact: true }).click();
  expect((await state(page)).orders.find(o => o.id === order.id).status).toBe('new');
  await page.getByRole('button', { name: 'All systems connected', exact: true }).click();
  await page.getByRole('button', { name: 'Reconnect', exact: true }).click();
  expect((await state(page)).orders.filter(o => o.id === order.id)).toHaveLength(1);
});

test('owner branding and menu availability update customer experience and persist', async ({ page }) => {
  await page.getByRole('button', { name: 'Customization', exact: true }).click();
  await page.getByLabel('Restaurant name', { exact: true }).fill('Luntian');
  await page.getByRole('button', { name: 'Use brand color #8b4f36' }).click();
  await page.getByRole('button',{name:'Save design',exact:true}).first().click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle availability for Matcha Latte' }).click();
  await customer(page);
  expect((await state(page)).brand.name).toBe('Luntian');
  await expect(page.getByRole('button', { name: 'Add Matcha Latte', exact: true })).toBeDisabled();
  await page.reload();
  const saved = await state(page);
  expect(saved.brand.name).toBe('Luntian');
  expect(saved.brand.accent).toBe('#8b4f36');
  expect(saved.menu[0].available).toBe(false);
});

test('analytics period, search, and confirmed reset behave coherently', async ({ page }) => {
  await page.getByRole('button', { name: 'Analytics', exact: true }).click();
  await page.getByLabel('Analytics period').selectOption('This week');
  await expect(page.locator('.analytics-stats').first()).toContainText('110,880');
  await expect(page.getByRole('img', { name: 'Illustrative sales chart for This week' })).toBeVisible();
  await customer(page);
  await page.getByRole('textbox', { name: 'Search the menu' }).fill('no-such-dish');
  await expect(page.getByText('Nothing found. Try another mood.')).toBeVisible();
  await page.getByRole('button', { name: 'Owner workspace', exact: true }).click();
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Reset demo' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo', exact: true }).click();
  expect((await state(page)).orders).toHaveLength(3);
});

test('mobile ordering and navigation fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(await fits()).toBe(true);
  await placeOrder(page);
  expect(await fits()).toBe(true);
  await kitchen(page);
  expect(await fits()).toBe(true);
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('button', { name: 'Customization', exact: true }).click();
  await expect(page.getByLabel('Restaurant name', { exact: true })).toBeVisible();
  expect(await fits()).toBe(true);
});

test('tour supports keyboard, export contains orders, and customer images load locally', async ({ page }) => {
  await page.getByRole('button', { name: 'Take a tour', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Guided demo' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(dialog).toContainText('A warm welcome, on any phone.');
  const close = dialog.getByRole('button', { name: 'Close dialog' });
  await close.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Next', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Analytics', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export demo orders' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('kawing-demo-orders.csv');
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv).toContain('Order,Table,Total PHP,Payment,Status');
  expect(csv).toContain('KW-1048,03,860,GCash,new');
  expect(csv.trim().split('\n')).toHaveLength(4);
  await customer(page);
  const images = page.locator('.cx-food img');
  await expect(images).toHaveCount(9);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await image.getAttribute('src')).toMatch(/^\/images\//);
  }
});
