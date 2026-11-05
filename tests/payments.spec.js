import { test, expect, devices } from "@playwright/test";
import { PROVIDERS, provider, resolvePaymentRoute } from "../src/payments.js";

const state = (p) =>
  p.evaluate(() => JSON.parse(localStorage.getItem("kawing-demo-v1")));
const newest = async (p) => (await state(p)).orders.find((o) => !o.seed);

async function order(page, method) {
  await page.goto("/?surface=guest&entry=table&table=03#Customer");
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await page.getByRole("button", { name: "Add Matcha Latte", exact: true }).click();
  const bag = page.locator(".cx-mobile-bag"); // on phones the order opens as a bottom sheet
  if (await bag.isVisible()) await bag.click();
  await page.getByRole("button", { name: "Review your order", exact: true }).click();
  await page.getByRole("button", { name: method, exact: true }).click();
  await page.getByRole("button", { name: "Place demo order", exact: true }).click();
}

test.describe("payment routes (pure)", () => {
  test("all five methods are offered with public names", () => {
    expect(PROVIDERS.map((p) => p.label)).toEqual([
      "GCash",
      "Maya (formerly PayMaya)",
      "GoTyme Bank",
      "MariBank",
      "Cash",
    ]);
  });
  test("without an approved checkout every wallet/bank falls back to instructions", () => {
    for (const id of ["GCash", "Maya", "GoTyme", "MariBank"])
      expect(resolvePaymentRoute(id, { orderId: "A1" })).toMatchObject({
        kind: "instructions",
      });
    expect(resolvePaymentRoute("Cash").kind).toBe("counter");
    expect(resolvePaymentRoute("Venmo").kind).toBe("unavailable");
  });
  test("a hosted route needs https, a verified host, the same provider and order", () => {
    const gcash = provider("GCash");
    gcash.verifiedHosts.push("checkout.example.test");
    try {
      const ok = {
        provider: "GCash",
        orderId: "A1",
        url: "https://checkout.example.test/s/abc",
      };
      expect(resolvePaymentRoute("GCash", { orderId: "A1", checkout: ok })).toMatchObject({
        kind: "hosted",
        url: ok.url,
      });
      for (const bad of [
        { ...ok, url: "gcash://pay?amount=285" },
        { ...ok, url: "http://checkout.example.test/s/abc" },
        { ...ok, url: "https://evil.example.test/s/abc" },
        { ...ok, provider: "Maya" },
        { ...ok, orderId: "B2" },
      ])
        expect(
          resolvePaymentRoute("GCash", { orderId: "A1", checkout: bad }).kind,
        ).toBe("instructions");
    } finally {
      gcash.verifiedHosts.length = 0;
    }
  });
  test("provider copy holds no receiver numbers", () => {
    const text = JSON.stringify(PROVIDERS);
    expect(text).not.toMatch(/09\d{9}|\+63\s?9\d{2}/);
  });
});

test("Continue with a wallet shows truthful fallback and never promotes payment", async ({
  page,
}) => {
  let popups = 0;
  page.on("popup", () => popups++);
  await order(page, "GoTyme Bank · simulated");
  const url = page.url();
  const panel = page.getByRole("region", { name: "Pay with GoTyme Bank" });
  await expect(panel).toContainText("Simulation · No real payment");
  const go = panel.getByRole("button", { name: "Continue with GoTyme Bank" });
  await go.click();
  await expect(panel).toContainText(
    "No GoTyme Bank checkout is connected to this demo merchant",
  );
  await expect(panel.locator("ol li")).toHaveCount(3);
  await expect(go).toHaveAttribute("aria-expanded", "true");
  // Repeat taps only toggle the guide.
  await go.click();
  await expect(go).toHaveAttribute("aria-expanded", "false");
  await go.click();
  await panel.getByRole("button", { name: "Back to my order" }).click();
  await expect(go).toHaveAttribute("aria-expanded", "false");
  expect(page.url()).toBe(url);
  expect(popups).toBe(0);
  // No custom-scheme or off-site payment links anywhere on the page.
  const hrefs = await page.$$eval("a[href]", (a) => a.map((x) => x.href));
  for (const h of hrefs) expect(h).toMatch(/^https?:\/\/127\.0\.0\.1|^https:\/\//);
  expect((await newest(page)).paymentStatus).toBe("selected");
  await expect(page.locator(".cx-payment-state")).toHaveText(
    "Method selected · not verified",
  );
  await panel.getByRole("button", { name: "I’ve sent the demo payment" }).click();
  // A customer claim is not payment: only the cashier review/confirm path reaches confirmed.
  expect((await newest(page)).paymentStatus).toBe("claimed");
  await expect(page.locator(".cx-payment-state")).toHaveText(
    "Customer claims payment sent",
  );
  await page.reload();
  expect((await newest(page)).paymentStatus).toBe("claimed");
});

test("Maya explains its disabled deep link and Cash never offers an app", async ({
  page,
}) => {
  await order(page, "Maya (formerly PayMaya) · simulated");
  const panel = page.getByRole("region", {
    name: "Pay with Maya (formerly PayMaya)",
  });
  await panel
    .getByRole("button", { name: "Continue with Maya (formerly PayMaya)" })
    .click();
  await expect(panel).toContainText("no app or payment page is opened");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/");
  await order(page, "Cash at counter");
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(0);
  await expect(page.getByText("Pay at the counter · demo order only")).toBeVisible();
  expect((await newest(page)).paymentStatus).toBe("selected");
});

const { defaultBrowserType: _browser, ...phone } = devices["Pixel 7"];
test.describe("on a phone", () => {
  test.use(phone);
  test("mobile fallback is reachable and no app launch is attempted", async ({
    page,
  }) => {
    let navigations = 0;
    page.on("framenavigated", (f) => {
      if (f === page.mainFrame()) navigations++;
    });
    await order(page, "GCash · simulated");
    const before = navigations;
    const go = page.getByRole("button", { name: "Continue with GCash" });
    const box = await go.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    await go.click();
    await expect(page.getByText("No GCash checkout is connected")).toBeVisible();
    expect(navigations).toBe(before);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(0);
    expect((await newest(page)).paymentStatus).toBe("selected");
  });
});
