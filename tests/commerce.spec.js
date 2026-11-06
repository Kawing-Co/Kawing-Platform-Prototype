import { test, expect } from "@playwright/test";
import {
  config,
  extend,
  defaults,
  orderAction,
  reconcile,
  balance,
  redeem,
  onColor,
  safeUrl,
} from "../src/commerce.js";
const state = (p) =>
  p.evaluate(() => JSON.parse(localStorage.getItem("kawing-demo-v1")));
const save = (p) =>
  p.getByRole("button", { name: "Save design", exact: true }).first().click();
const customer = async (p) => {
  await p.getByRole("button", { name: "Customer hub", exact: true }).click();
};
const menu = async (p) => {
  await customer(p);
  await p.getByLabel("Entry context", { exact: true }).selectOption("table:05");
  await p.getByRole("button", { name: "Order now", exact: true }).click();
  if (
    await p
      .getByRole("button", { name: "Explore the menu", exact: true })
      .isVisible()
  )
    await p
      .getByRole("button", { name: "Explore the menu", exact: true })
      .click();
};
async function order(p) {
  await menu(p);
  await p
    .getByRole("button", { name: "Add Matcha Latte", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Review your order", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Maya (formerly PayMaya) · simulated", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  const o = (await state(p)).orders.find((o) => !o.seed);
  expect(o.paymentStatus).toBe("selected");
  await p.getByRole("button", { name: "I’ve sent the demo payment" }).click();
  expect((await state(p)).orders.find((v) => v.id === o.id).paymentStatus).toBe(
    "claimed",
  );
  return o;
}
async function serve(p, id) {
  await p.getByRole("button", { name: "Staff kitchen", exact: true }).click();
  const card = p.locator(".kitchen-card").filter({ hasText: id });
  await expect(
    card.getByRole("button", { name: "Start preparing" }),
  ).toBeDisabled();
  await card
    .getByRole("button", { name: "Review payment", exact: true })
    .click();
  await expect(
    card.getByRole("button", { name: "Start preparing" }),
  ).toBeDisabled();
  await card
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await card.getByRole("button", { name: "Start preparing" }).click();
  await card.getByRole("button", { name: "Mark ready" }).click();
  await card.getByRole("button", { name: "Mark served" }).click();
  return card;
}
test("schema migration retains valid records and blocks unsafe URLs and cross-merchant transitions", () => {
  const base = {
    brand: { name: "Legacy", accent: "#8b4f36" },
    menu: [],
    orders: [{ id: "old", status: "served", payment: "GCash", total: 20 }],
    storefront: {
      modules: {},
      loyalty: { eligible: {}, threshold: 3.5 },
      socials: [null],
    },
    ledger: {},
    accounts: {},
    events: {},
  };
  const d = extend(base);
  expect(d.orders[0].id).toBe("old");
  expect(d.storefront.modules).toHaveLength(8);
  expect(d.storefront.loyalty.threshold).toBe(4);
  expect(d.storefront.loyalty.eligible.length).toBeGreaterThan(0);
  expect(Array.isArray(d.ledger)).toBe(true);
  expect(onColor("#808080")).toBe("#000000");
  expect(safeUrl("javascript:alert(1)")).toBe(null);
  expect(safeUrl("https://evil.example", "Instagram")).toBe(null);
  expect(safeUrl("https://instagram.com/example", "Instagram")).toContain(
    "instagram.com",
  );
  const foreign = {
    ...d,
    orders: [
      {
        id: "foreign",
        merchantId: "other",
        status: "new",
        paymentStatus: "confirmed",
      },
    ],
  };
  expect(orderAction(foreign, "foreign", "advance")).toBe(foreign);
});
test("three compositions, saved theme, module ordering and preview isolation", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant#Storefront");
  const initial = (await state(page)).events.length;
  await page.getByRole("tab", { name: "Layout", exact: true }).click();
  for (const [title, cls] of [
    ["Visual Showcase", "sf-visual"],
    ["Minimal Utility", "sf-minimal"],
    ["Quick Actions", "sf-quick"],
  ]) {
    await page.getByRole("button", { name: new RegExp(title) }).click();
    await expect(
      page
        .frameLocator('iframe[title="Interactive Studio preview"]')
        .locator(".sf-shell"),
    ).toHaveClass(new RegExp(cls));
    await save(page);
    await customer(page);
    await expect(page.locator(".sf-shell")).toHaveClass(new RegExp(cls));
    await page
      .getByRole("button", { name: "Customization", exact: true })
      .click();
    await page.getByRole("tab", { name: "Layout", exact: true }).click();
  }
  await page.getByRole("tab", { name: "Brand", exact: true }).click();
  await page.getByLabel("Restaurant name", { exact: true }).fill("Daily Brew");
  await page.getByRole("button", { name: "Terracotta", exact: true }).click();
  await save(page);
  await page.getByRole("tab", { name: "Modules", exact: true }).click();
  await page
    .getByRole("button", { name: "Move Guest Wi-Fi up", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Enable Play while you wait", exact: true })
    .uncheck();
  await save(page);
  const saved = await state(page);
  expect(saved.storefront.modules.findIndex((m) => m.type === "wifi")).toBe(2);
  expect(saved.events.length).toBe(initial + 3);
  await page.reload();
  await customer(page);
  await expect(
    page.getByRole("heading", { name: "Daily Brew", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play while you wait", exact: true }),
  ).toHaveCount(0);
});
test("studio rejects unsafe social destinations, negative private feedback never gates reviews", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant#Storefront");
  await page.getByRole("tab", { name: "Content", exact: true }).click();
  await page.getByText("Social links", { exact: true }).click();
  await page
    .getByLabel("Instagram URL 1", { exact: true })
    .fill("javascript:alert(1)");
  await save(page);
  await expect(page.getByRole("status")).toContainText("invalid");
  await page.getByLabel("Instagram URL 1", { exact: true }).fill("");
  await save(page);
  await customer(page);
  await page
    .getByRole("button", { name: "Private feedback", exact: true })
    .click();
  await page
    .getByRole("combobox", {
      name: "How was your visit? (optional)",
      exact: true,
    })
    .selectOption("1");
  await page
    .getByLabel("Your fictional feedback", { exact: true })
    .fill("Fictional note: slow service.");
  await page
    .getByRole("button", { name: "Send private demo feedback" })
    .click();
  await page
    .getByRole("button", { name: "Back to Business Profile", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review us on Google", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review us on Google", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "No fictional business profile",
  );
  await page.getByRole("button", { name: "Engagement", exact: true }).click();
  await expect(
    page.getByText("Fictional note: slow service.", { exact: true }),
  ).toBeVisible();
  const record = page
    .locator(".feedback-record")
    .filter({ hasText: "Fictional note: slow service." });
  await record
    .getByRole("button", { name: "Mark reviewed", exact: true })
    .click();
  await record
    .getByRole("button", { name: "Mark resolved", exact: true })
    .click();
  expect((await state(page)).feedback[0].status).toBe("resolved");
  expect(
    (await state(page)).events.filter((e) => e.type === "review_click"),
  ).toHaveLength(1);
});
test("verified completed purchases credit loyalty once; redemption and refund preserve ledger integrity", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant#Customer");
  await page.getByRole("button", { name: "My rewards", exact: true }).click();
  await page
    .getByRole("button", { name: "Try Alex’s demo loyalty account" })
    .click();
  const o1 = await order(page);
  expect(balance(await state(page))).toBe(7);
  await serve(page, o1.id);
  expect(balance(await state(page))).toBe(8);
  await page.reload();
  expect(balance(await state(page))).toBe(8);
  const o2 = await order(page);
  await serve(page, o2.id);
  expect(balance(await state(page))).toBe(9);
  await customer(page);
  await page.getByRole("button", { name: "My rewards", exact: true }).click();
  await page
    .getByRole("button", { name: "Redeem reward", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Redeem reward", exact: true }),
  ).toBeDisabled();
  expect(balance(await state(page))).toBe(0);
  await page
    .getByRole("button", { name: "Staff kitchen", exact: true })
    .click();
  await page
    .locator(".kitchen-card")
    .filter({ hasText: o2.id })
    .getByRole("button", { name: "Simulate refund", exact: true })
    .click();
  const d = await state(page);
  expect(d.ledger.filter((l) => l.orderId === o2.id)).toHaveLength(2);
  expect(reconcile(d).ledger).toEqual(d.ledger);
  expect(orderAction(d, o2.id, "refund")).toBe(d);
  expect(balance(d)).toBe(-1);
});
test("recovery requires simulated proof; Wi-Fi is honest and the complete puzzle works", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant#Customer");
  await page.getByRole("button", { name: "My rewards", exact: true }).click();
  await page
    .getByText("Recover a demo loyalty account", { exact: true })
    .click();
  await page
    .getByLabel("Demo email", { exact: true })
    .fill("alex@example.test");
  await page.getByRole("button", { name: "Show simulated inbox" }).click();
  await page.getByLabel("Recovery code", { exact: true }).fill("000000");
  await page.getByRole("button", { name: "Verify demo code" }).click();
  expect((await state(page)).guestId).toBe(null);
  await page.getByLabel("Recovery code", { exact: true }).fill("246810");
  await page.getByRole("button", { name: "Verify demo code" }).click();
  expect((await state(page)).guestId).toBe("alex");
  await page
    .getByRole("button", { name: "Forget account on this browser" })
    .click();
  expect((await state(page)).guestId).toBe(null);
  await page
    .getByRole("button", { name: "Back to Business Profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Guest Wi-Fi", exact: true }).click();
  await expect(
    page.getByText(
      "A website cannot universally connect your phone to Wi-Fi.",
      { exact: false },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to Business Profile", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Play while you wait", exact: true })
    .click();
  for (const [a, b] of [
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 8],
  ]) {
    await page.getByRole("button", { name: "Card " + a, exact: true }).click();
    await page.getByRole("button", { name: "Card " + b, exact: true }).click();
  }
  await expect(page.getByRole("status")).toContainText("All paired");
  await page.getByRole("button", { name: "Restart puzzle" }).click();
  await expect(page.getByRole("status")).toContainText("0 of 4");
});
test("cart and modifiers persist, table context is explicit, and presentation restore preserves disabled tables", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant&entry=table&table=03#Customer");
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await page
    .getByRole("button", { name: "Customize Matcha Latte", exact: true })
    .click();
  await page.getByRole("radio", { name: /^Large/ }).click();
  await page.getByRole("radio", { name: /^Oat/ }).click();
  await page.getByRole("button", { name: /Add to order/ }).click();
  await expect(page.locator(".cx-total")).toContainText("320");
  await page.reload();
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await expect(page.locator(".cx-total")).toContainText("320");
  await expect(page.locator(".cx-cart-sum")).toContainText("Large · Oat");
  await expect(page.locator(".cx-cart-sub")).toContainText("Table 03");
  await page
    .getByRole("button", { name: "Customization", exact: true })
    .click();
  await save(page);
  await page.getByRole("tab", { name: "Operations", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Table 03 enabled", exact: true })
    .uncheck();
  await page.getByRole("button", { name: "Restore previous save" }).click();
  expect((await state(page)).storefront.tables["03"]).toBe(false);
  await customer(page);
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Review your order", exact: true }),
  ).toBeDisabled();
});
test("360px hub templates and modules support keyboard and reduced motion without console errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?workspace=merchant#Customer");
  const fits = () =>
    page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  expect(await fits()).toBe(true);
  await page.getByRole("button", { name: "Guest Wi-Fi", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Guest Wi-Fi", exact: true }),
  ).toBeFocused();
  expect(await fits()).toBe(true);
  await page
    .getByRole("button", { name: "Toggle navigation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Customization", exact: true })
    .click();
  expect(await fits()).toBe(true);
  await page.getByRole("tab", { name: "Layout", exact: true }).click();
  for (const title of ["Visual Showcase", "Minimal Utility"]) {
    await page.getByRole("button", { name: new RegExp(title) }).click();
    await save(page);
    await customer(page);
    expect(await fits()).toBe(true);
    await page
      .getByRole("button", { name: "Toggle navigation", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Customization", exact: true })
      .click();
    await page.getByRole("tab", { name: "Layout", exact: true }).click();
  }
  expect(errors).toEqual([]);
});

test("promotion scheduling and visibility work, disabled games have no stale route", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant#Storefront");
  await page.getByRole("tab", { name: "Content", exact: true }).click();
  await page.getByText("Merchant-owned promotion", { exact: true }).click();
  await page.getByLabel("Promotion end", { exact: true }).fill("2020-01-01");
  await page.getByLabel("Promotion start", { exact: true }).fill("2019-01-01");
  await save(page);
  await customer(page);
  await page
    .getByRole("button", { name: "Today’s offers", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good things are on their way." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Customization", exact: true })
    .click();
  await page.getByRole("tab", { name: "Modules", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Enable Play while you wait", exact: true })
    .uncheck();
  await save(page);
  await page.goto("/?workspace=merchant#game");
  await customer(page);
  await expect(
    page.getByRole("button", { name: "Play while you wait", exact: true }),
  ).toHaveCount(0);
});
test("counter cash approval is separate from payment and context/cart survive selection reload", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant#Storefront");
  await page.getByRole("tab", { name: "Operations", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Preparation policy", exact: true })
    .selectOption("counter");
  await customer(page);
  await page
    .getByLabel("Entry context", { exact: true })
    .selectOption("counter");
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Matcha Latte", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await expect(page.locator(".cx-total")).toContainText("230");
  await expect(page.getByLabel("Entry context")).toHaveValue("counter");
  await page
    .getByRole("button", { name: "Review your order", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Cash at counter", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  const o = (await state(page)).orders.find((o) => !o.seed);
  await page
    .getByRole("button", { name: "Staff kitchen", exact: true })
    .click();
  const card = page.locator(".kitchen-card").filter({ hasText: o.id });
  await expect(
    card.getByRole("button", { name: "Start preparing" }),
  ).toBeDisabled();
  await card.getByRole("button", { name: "Approve pay at counter" }).click();
  await card.getByRole("button", { name: "Start preparing" }).click();
  expect(
    (await state(page)).orders.find((v) => v.id === o.id).paymentStatus,
  ).toBe("selected");
});
test("current order status reopens receipt after browsing; full reset clears engagement and cart", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant#Start%20here");
  const o = await order(page);
  await page
    .getByRole("button", { name: "Explore the menu", exact: true })
    .click();
  await expect(page.locator(".cx-grid")).toBeVisible();
  await page.getByRole("button", { name: "Order status", exact: true }).click();
  await expect(page.locator(".cx-success")).toContainText(o.id);
  await page
    .getByRole("button", { name: "Owner workspace", exact: true })
    .click();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset demo", exact: true })
    .click();
  const d = await state(page);
  expect(d.orders).toHaveLength(3);
  expect(d.events).toHaveLength(0);
  expect(d.guestId).toBe(null);
  expect(d.storefront.layout).toBe("quick");
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith("kawing-cart-")),
    ),
  ).toHaveLength(0);
});

test("review CTR measures clicked views, and studio tabs support arrow keys", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant#Customer");
  await page
    .getByRole("button", { name: "Review us on Google", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review us on Google", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review us on Google", exact: true })
    .click();
  await page.getByRole("button", { name: "Engagement", exact: true }).click();
  await expect(
    page
      .locator(".engagement-grid .panel")
      .filter({ hasText: "Review-link clicks" }),
  ).toContainText("2");
  await expect(
    page
      .locator(".engagement-grid .panel")
      .filter({ hasText: "Review-link CTR" }),
  ).toContainText("100%");
  await page
    .getByRole("button", { name: "Customization", exact: true })
    .click();
  await page.getByRole("tab", { name: "Brand", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Layout", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("tab", { name: "Layout", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("guest entry examples expose only customer presentation even with a staff hash", async ({
  page,
}) => {
  await page.goto("/?surface=guest&entry=table&table=03#Orders");
  await expect(
    page.getByRole("button", { name: "Staff kitchen", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Customization", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Matcha Latte", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review your order", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Follow this order in the kitchen" }),
  ).toHaveCount(0);
  expect((await state(page)).orders.find((o) => !o.seed).table).toBe("03");
});
