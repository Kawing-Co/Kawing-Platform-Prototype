import { test, expect } from "@playwright/test";
import { MENU_ITEMS, defaultSel, orderLine, pickImage, unitPrice } from "../src/merchant.js";

const state = (p) => p.evaluate(() => JSON.parse(localStorage.getItem("kawing-demo-v1")));
const latte = MENU_ITEMS[0];

test.describe("Matcha Mood order model (pure)", () => {
  test("price is recomputed from the menu; unknown choices fall back to defaults", () => {
    expect(unitPrice(latte, defaultSel(latte))).toBe(680);
    expect(unitPrice(latte, { ...defaultSel(latte), size: "l", milk: "oat" })).toBe(840);
    // a forged selection and a forged price cannot change the unit price
    const forged = orderLine({ ...latte, price: 1 }, { size: "xl", milk: "diamond", top: ["nope"] }, 1);
    expect(forged.sel).toEqual(defaultSel(latte));
    expect(forged.price).toBe(unitPrice({ ...latte, price: 1 }, defaultSel(latte)));
    expect(unitPrice(latte, forged.sel)).toBe(680);
  });
  test("the photograph follows the selection to the closest photographed variant", () => {
    expect(pickImage(latte, defaultSel(latte))).toBe("latte-iced");
    expect(pickImage(latte, { ...defaultSel(latte), temp: "hot" })).toBe("latte-hot");
    expect(pickImage(latte, { ...defaultSel(latte), top: ["azuki"] })).toBe("latte-topped");
  });
});

test.describe("Matcha Mood ordering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?surface=guest&entry=table&table=05#Customer");
    await page.getByRole("button", { name: "Order now", exact: true }).click();
  });

  test("customizer shows a live price and photograph, and the kitchen receives the options", async ({ page }) => {
    await page.getByRole("button", { name: "Customize Matcha Latte", exact: true }).click();
    const sheet = page.locator("dialog.k-sheet");
    await expect(sheet).toBeVisible();
    await expect(sheet.locator(".k-sheet-price")).toContainText("680");
    await sheet.getByRole("radio", { name: /^Hot/ }).click();
    await expect(sheet.locator(".k-layer").last()).toHaveAttribute("src", /latte-hot/);
    await sheet.getByRole("radio", { name: /^Large/ }).click();
    await sheet.getByRole("radio", { name: /^Oat/ }).click();
    await expect(sheet.locator(".k-sheet-price")).toContainText("840");
    await expect(sheet.locator(".k-sheet-chips")).toContainText("Hot");
    await sheet.getByRole("button", { name: /Add to order/ }).click();
    await expect(sheet).toBeHidden();
    const bag = page.locator(".cx-mobile-bag");
    if (await bag.isVisible()) await bag.click();
    await expect(page.locator(".cx-total")).toContainText("840");
    await expect(page.locator(".cx-cart-sum")).toContainText("Hot · Large · Oat");
    await page.getByRole("button", { name: "Review your order", exact: true }).click();
    await page.getByRole("button", { name: "Place demo order", exact: true }).click();
    await expect(page.locator(".cx-success")).toBeVisible();
    const order = (await state(page)).orders.find((o) => !o.seed);
    expect(order.total).toBe(840);
    expect(order.items[0]).toMatchObject({ id: 1, qty: 1, price: 840 });
    expect(order.items[0].sel).toMatchObject({ temp: "hot", size: "l", milk: "oat" });
    await expect(page.locator(".cx-receipt-items")).toContainText("Hot · Large · Oat");
  });

  test("a forged saved cart is cleaned, never trusted", async ({ page }) => {
    await page.evaluate(() =>
      localStorage.setItem(
        "kawing-cart-v2:salo:table:05",
        JSON.stringify({ cart: { x: { id: 1, sel: { size: "xl", milk: "diamond" }, qty: 2, price: 1 }, y: { id: 999, sel: {}, qty: 5 } }, note: "" }),
      ),
    );
    await page.reload();
    await page.getByRole("button", { name: "Order now", exact: true }).click();
    const bag = page.locator(".cx-mobile-bag");
    if (await bag.isVisible()) await bag.click();
    await expect(page.locator(".cx-total")).toContainText("1,360"); // 2 × ₱680, the unknown item dropped
  });

  test("the customizer closes with Escape and keeps the order unchanged", async ({ page }) => {
    await page.getByRole("button", { name: "Customize Matcha Latte", exact: true }).click();
    await expect(page.locator("dialog.k-sheet")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.k-sheet")).toBeHidden();
    await expect(page.locator(".cx-mobile-bag")).toHaveCount(0);
  });
});

test("an older saved Salo record is replaced once by the Matcha Mood seed", async ({ page }) => {
  await page.goto("/?workspace=merchant");
  await page.evaluate(() =>
    localStorage.setItem("kawing-demo-v1", JSON.stringify({ brand: { name: "Salo" }, menu: [{ id: 1, name: "Harvest bowl", price: 285 }], orders: [] })),
  );
  await page.reload();
  const d = await state(page);
  expect(d.brand.name).toBe("Matcha Mood");
  expect(d.menu).toHaveLength(9);
  expect(d.seed).toBe("matcha-mood-1");
});

test("reduced motion stills the hero and ordering feedback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?surface=guest&entry=table&table=05#Customer");
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  const anim = await page.locator(".cx-hero-media img").evaluate((e) => getComputedStyle(e).animationName);
  expect(anim).toBe("none");
});

test("phone: the order is a bottom sheet that opens from the bag pill and closes with its handle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?surface=guest&entry=table&table=05#Customer");
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await page.getByRole("button", { name: "Add Matcha Latte", exact: true }).click();
  const pill = page.locator(".cx-mobile-bag");
  await expect(pill).toContainText("1 item");
  await pill.click();
  const cart = page.locator("#customer-cart");
  await expect(cart).toHaveClass(/is-open/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Close order", exact: true }).click();
  await expect(cart).not.toHaveClass(/is-open/);
});
