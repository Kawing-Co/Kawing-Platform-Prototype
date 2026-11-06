import { test, expect } from "@playwright/test";
import { MENU_ITEMS as USUAL, STOREFRONT } from "../src/usual.js";
import { orderLine, unitPrice } from "../src/merchant.js";
import { resetKeys, sessionHref, parseSession } from "../src/session.js";

const usualItem = (name) => USUAL.find((m) => m.name === name);
const record = (p, key) => p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);

test.describe("the usual. menu and order model (pure)", () => {
  test("the printed menu: 25 items, printed prices, add-on prices", () => {
    expect(USUAL).toHaveLength(25);
    const byGroup = Object.groupBy ? Object.groupBy(USUAL, (m) => m.category) : null;
    if (byGroup) {
      expect(Object.fromEntries(Object.entries(byGroup).map(([k, v]) => [k, v.length]))).toEqual({
        signatures: 3, classics: 5, "non-coffee": 4, refreshers: 4, matcha: 6, hojicha: 3,
      });
    }
    const price = (n) => usualItem(n).price;
    expect([price("the usual"), price("dirty horchata"), price("americano cloud")]).toEqual([190, 180, 160]);
    expect([price("spanish latte"), price("americano"), price("seasalt latte")]).toEqual([160, 120, 180]);
    expect([price("classic matcha"), price("dango matcha"), price("classic hojicha"), price("blush"), price("golden hour")]).toEqual([230, 270, 200, 180, 150]);
    // add-ons: extra shot 30, sub-oat 50, sub whole milk 40, foam 30, more matcha 30, syrup 20
    const u = usualItem("the usual");
    expect(unitPrice(u, { milk: "oat", extras: ["shot"] })).toBe(190 + 50 + 30);
    expect(unitPrice(u, { milk: "whole", extras: ["foam", "syrup"] })).toBe(190 + 40 + 30 + 20);
    expect(unitPrice(usualItem("classic matcha"), { extras: ["matcha"] })).toBe(230 + 30);
  });
  test("selections are cleaned and the price is always recomputed from the menu", () => {
    const u = usualItem("the usual");
    const line = orderLine({ ...u, price: 1 }, { milk: "diamond", extras: ["shot", "caviar"] }, 2);
    expect(line.sel).toEqual({ milk: "house", extras: ["shot"] });
    expect(line.price).toBe(1 + 30); // a forged item price is not trusted by the menu either
    expect(unitPrice(u, line.sel)).toBe(220);
  });
  test("every drink has a photograph that exists on disk under /images/usual", async () => {
    const { existsSync } = await import("node:fs");
    for (const m of USUAL) expect(existsSync("public" + m.image), m.name).toBe(true);
    expect(STOREFRONT.theme.background).toBe("#eaebe0"); // the menu's warm grey, a touch greener like their feed
  });
});

test.describe("session: which business is open", () => {
  test("the business parameter round-trips and defaults to Matcha Mood", () => {
    expect(parseSession("?scenario=standard").business).toBe("salo");
    expect(parseSession("?scenario=standard&business=usual").business).toBe("usual");
    expect(parseSession("?business=nope").business).toBe("salo");
    const href = sessionHref("http://x.test/?scenario=standard&business=usual", { scenario: "standard", view: "customer" });
    expect(new URL(href).searchParams.get("business")).toBe("usual");
    const market = sessionHref("http://x.test/?scenario=standard&business=usual", { scenario: "market", view: "admin" });
    expect(new URL(market).searchParams.get("business")).toBeNull();
  });
  test("reset keeps each scenario's keys apart", () => {
    const keys = ["kawing-demo-v1", "kawing-merchant-v2:usual", "kawing-last-order:usual", "kawing-cart-v2:usual:table:05", "kawing-merchant-v2:luna", "kawing-market-v1", "kawing-cart-v2:luna:counter:"];
    expect(resetKeys("standard", keys)).toEqual(["kawing-demo-v1", "kawing-merchant-v2:usual", "kawing-last-order:usual", "kawing-cart-v2:usual:table:05"]);
    expect(resetKeys("market", keys).sort()).toEqual(["kawing-cart-v2:luna:counter:", "kawing-market-v1", "kawing-merchant-v2:luna"]);
  });
});

test.describe("the platform keeps Kawing's identity", () => {
  test("the entry page is Kawing's own: paper, forest, several merchants, no Matcha headline", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator(".spaces-intro h1");
    await expect(h1).toContainText("Good business.");
    const c = await h1.evaluate((e) => getComputedStyle(e).color);
    expect(c).not.toBe("rgb(244, 248, 232)"); // not the light-on-dark merchant hero
    await expect(page.locator(".spaces-collage figure")).toHaveCount(3);
    await expect(page.locator(".spaces-collage")).toContainText("the usual.");
    await expect(page.locator(".spaces-collage")).toContainText("Matcha Mood");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe("rgb(20, 35, 26)");
  });
  test("Standard Merchant offers both businesses and opens the chosen one", async ({ page }) => {
    await page.goto("/?scenario=standard");
    const group = page.getByRole("radiogroup", { name: "Business" });
    await expect(group.getByRole("radio", { name: /Matcha Mood/ })).toHaveAttribute("aria-checked", "true");
    await group.getByRole("radio", { name: /the usual\./ }).click();
    await expect(page.locator(".spaces-eyebrow")).toContainText("THE USUAL.");
    await page.getByRole("button", { name: /Enter Merchant View/ }).click();
    await expect(page.getByLabel("Restaurant name", { exact: true })).toHaveValue("the usual.");
    expect(new URL(page.url()).searchParams.get("business")).toBe("usual");
    await expect(page.locator(".session-context")).toContainText("the usual.");
    // Matcha Mood's own record is untouched
    expect(await record(page, "kawing-demo-v1")).toBeNull();
  });
});

test.describe("the usual. as a merchant profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?surface=guest&merchant=usual&entry=table&table=05#Customer");
  });

  test("its own theme: greige paper, geometric lowercase type, black pills", async ({ page }) => {
    const shell = page.locator(".sf-shell").first();
    await expect(page.getByRole("heading", { name: "the usual.", exact: true })).toBeVisible();
    const t = await shell.evaluate((e) => {
      const cs = getComputedStyle(e), h = getComputedStyle(e.querySelector("h1"));
      return { bg: cs.getPropertyValue("--sf-bg").trim(), primary: cs.getPropertyValue("--sf-primary").trim(), display: cs.getPropertyValue("--sf-display").trim(), caseTok: cs.getPropertyValue("--sf-case").trim(), h1Font: h.fontFamily, h1Case: h.textTransform };
    });
    expect(t.bg).toBe("#eaebe0");
    expect(t.primary).toBe("#141412");
    expect(t.display).toContain("Jost");
    expect(t.caseTok).toBe("lowercase");
    expect(t.h1Font).toContain("Jost");
    expect(t.h1Case).toBe("lowercase");
  });

  test("customize, order, and the kitchen receives the options; Matcha Mood's record is untouched", async ({ page }) => {
    await page.getByRole("button", { name: "Order now", exact: true }).click();
    await page.getByRole("button", { name: "Customize the usual", exact: true }).click();
    const sheet = page.locator("dialog.k-sheet");
    await expect(sheet.locator(".k-sheet-price")).toContainText("190");
    await sheet.getByRole("radio", { name: /^oat|^Oat/i }).click();
    await sheet.getByRole("checkbox", { name: /Extra shot/i }).click();
    await expect(sheet.locator(".k-sheet-price")).toContainText("270");
    await expect(sheet.locator(".k-sheet-chips")).toContainText(/oat/i);
    await sheet.getByRole("button", { name: /Add to order/i }).click();
    const bag = page.locator(".cx-mobile-bag");
    if (await bag.isVisible()) await bag.click();
    await expect(page.locator(".cx-total")).toContainText("270");
    await page.getByRole("button", { name: "Review your order", exact: true }).click();
    await page.getByRole("button", { name: "Place demo order", exact: true }).click();
    await expect(page.locator(".cx-success")).toBeVisible();
    const usual = await record(page, "kawing-merchant-v2:usual");
    const mine = usual.orders.find((o) => !o.seed);
    expect(mine.total).toBe(270);
    expect(mine.items[0].sel).toMatchObject({ milk: "oat", extras: ["shot"] });
    expect(usual.seed).toBe("the-usual-1");
    expect(await record(page, "kawing-demo-v1")).toBeNull();
  });

  test("categories follow the printed menu and the add-on prices show in the sheet", async ({ page }) => {
    await page.getByRole("button", { name: "Order now", exact: true }).click();
    const rail = page.locator(".cx-categories");
    for (const c of ["signatures", "classics", "non-coffee", "refreshers", "matcha", "hojicha"]) await expect(rail).toContainText(c);
    await page.getByRole("button", { name: "Customize classic matcha", exact: true }).click();
    const sheet = page.locator("dialog.k-sheet");
    await expect(sheet).toContainText("More matcha (1g)");
    await expect(sheet).toContainText("+₱50"); // oat
  });
});

test("Merchant View for the usual. shows its own menu and kitchen orders with options", async ({ page }) => {
  await page.goto("/?scenario=standard&business=usual&workspace=merchant#Orders");
  const card = page.locator(".kitchen-card").filter({ hasText: "KW-1048" });
  await expect(card).toContainText("the usual");
  await expect(card).toContainText("Oat");
  await expect(card).toContainText("₱720");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("button", { name: "Toggle availability for dango matcha" })).toBeVisible();
});
