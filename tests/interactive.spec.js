import { test, expect } from "@playwright/test";
const frame = (p) => p.frameLocator('iframe[title^="Customer "]');
const view = async (p, role) => {
  await p.getByRole("button", { name: "Switch View", exact: true }).click();
  await p
    .getByRole("button", { name: role + " View", exact: true })
    .click();
};
const store = (p) =>
  p.evaluate(() => JSON.parse(localStorage.getItem("kawing-market-v1")));
async function openShop(p, booth) {
  await p
    .getByRole("button", { name: booth + " Occupied", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Open Business Profile", exact: false })
    .click();
  return frame(p);
}
async function checkout(f, item = "Harvest bowl", payment = "GCash") {
  await f.getByRole("button", { name: "Order now", exact: true }).click();
  await f.getByRole("button", { name: "Add " + item, exact: true }).click();
  if (item.includes("ceramic")) {
    await expect(f.getByLabel(item + " add-on", { exact: true })).toHaveCount(
      0,
    );
    await expect(
      f.getByLabel("Search products", { exact: true }),
    ).toBeVisible();
  }
  await f
    .getByRole("button", { name: "Review your order", exact: true })
    .click();
  await f
    .getByRole("button", {
      name: payment === "Cash" ? "Cash at counter" : payment + " · simulated",
      exact: true,
    })
    .click();
  await f
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
}
test("Studio frame uses actual device width and selects the exact editor from the canvas", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant&scenario=standard#Customization");
  const f = page.frameLocator('iframe[title="Interactive Studio preview"]');
  await expect
    .poll(() => f.locator("body").evaluate(() => innerWidth))
    .toBe(390);
  await f.getByRole("button", { name: "Guest Wi-Fi", exact: true }).focus();
  await f
    .getByRole("button", { name: "Guest Wi-Fi", exact: true })
    .press("Enter");
  await expect(page.locator(".inspector-context")).toContainText("Guest Wi-Fi");
  await expect(
    page.getByLabel("Demo network name", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Demo network name", { exact: true })
    .fill("Edited-Guest-DEMO");
  await page
    .getByRole("combobox", { name: "Studio screen size", exact: true })
    .selectOption("desktop");
  await expect
    .poll(() => f.locator("body").evaluate(() => innerWidth))
    .toBe(1280);
  await f.getByRole("button", { name: "Order now", exact: true }).click();
  await expect(page.locator(".inspector-context")).toContainText("Order now");
  await expect(
    page.getByRole("checkbox", { name: "Studio availability Harvest bowl" }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", { name: "Studio availability Harvest bowl" })
    .uncheck();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kawing-demo-v1")).menu[0].available,
    ),
  ).toBe(false);
  await page
    .getByRole("button", { name: "Save design", exact: true })
    .first()
    .click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kawing-demo-v1")).storefront.wifi.name,
    ),
  ).toBe("Edited-Guest-DEMO");
});
test("customer device and tier selection affect only the preview; keyboard and 360px remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?workspace=customer&scenario=standard");
  // Customer View opens the finished experience at once; preview controls are optional.
  await expect(page.getByRole("heading", { name: "Salo", exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Preview options", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Customer preview tier", { exact: true })
    .selectOption("basic");
  await page
    .getByLabel("Customer screen size", { exact: true })
    .selectOption("compact");
  const f = frame(page);
  await expect
    .poll(() => f.locator("body").evaluate(() => innerWidth))
    .toBe(360);
  await expect(
    f.getByRole("button", { name: "Play while you wait", exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Customer preview tier", { exact: true })
    .selectOption("growth");
  await expect(
    frame(page).getByRole("button", {
      name: "Play while you wait",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("kawing-demo-v1"),
        ).storefront.modules.find((m) => m.type === "game").enabled,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
test("standard operator cannot approve missing setup or bypass a blocking support issue", async ({
  page,
}) => {
  await page.goto("/?workspace=admin&scenario=standard");
  await page.getByRole("button", { name: "Setup review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mark demo setup reviewed" }),
  ).toBeDisabled();
  await page.getByLabel("Business category", { exact: true }).fill("Cafe");
  await page
    .getByLabel("Business contact", { exact: true })
    .fill("demo@example.test");
  await page.getByRole("button", { name: "Mark demo setup reviewed" }).click();
  await expect(
    page.locator(".admin-command-heading .readiness-badge"),
  ).toContainText("ready");
  await page.getByRole("button", { name: /^Support/ }).click();
  await page
    .getByRole("button", { name: "Record demo issue", exact: false })
    .click();
  await expect(
    page.locator(".admin-command-heading .readiness-badge"),
  ).toContainText("attention");
  await expect(
    page.getByRole("button", { name: "Resolve with note" }),
  ).toBeDisabled();
  await page
    .getByLabel("Resolve Cannot access the ordering flow", { exact: true })
    .fill("Verified available item and restored the demo link.");
  await page.getByRole("button", { name: "Start handling" }).click();
  await page.getByRole("button", { name: "Resolve with note" }).click();
  await page.getByRole("button", { name: "Setup review", exact: true }).click();
  await page.getByRole("button", { name: "Mark demo setup reviewed" }).click();
  await page.reload();
  await expect(
    page.locator(".admin-command-heading .readiness-badge"),
  ).toContainText("ready");
  await page.getByRole("button", { name: "Packages", exact: true }).click();
  await page
    .getByLabel("Merchant subscriber relationship", { exact: true })
    .selectOption("paused");
  await expect(
    page.locator(".admin-command-heading .readiness-badge"),
  ).toContainText("attention");
  await page.getByRole("button", { name: "Setup review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mark demo setup reviewed" }),
  ).toBeDisabled();
});
test("market readiness requires verified needs, completed tent setup and resolution notes", async ({
  page,
}) => {
  await page.goto("/?workspace=admin&scenario=market");
  await page.getByRole("button", { name: "Logistics", exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "Fulfill Tent & weather cover",
      exact: true,
    })
    .check();
  await expect(page.locator(".vendor-dossier .readiness-badge")).toContainText(
    "outstanding",
  );
  await page
    .getByLabel("Tent setup status", { exact: true })
    .selectOption("ready");
  await page
    .getByRole("checkbox", { name: "Fulfill Power connection", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Fulfill Waste collection", exact: true })
    .check();
  await expect(page.locator(".vendor-dossier .readiness-badge")).toContainText(
    "Ready to operate",
  );
  await page.getByRole("button", { name: /^Issues/ }).click();
  await page
    .getByRole("button", { name: "Report demo issue", exact: false })
    .click();
  await expect(page.locator(".vendor-dossier .readiness-badge")).toContainText(
    "outstanding",
  );
  await expect(
    page.getByRole("button", { name: "Resolve with note" }),
  ).toBeDisabled();
  await page
    .getByLabel("Resolution for Power connection unavailable", { exact: true })
    .fill("Demo cable replaced and tested under the requested load.");
  await page.getByRole("button", { name: "Start handling" }).click();
  await page.getByRole("button", { name: "Resolve with note" }).click();
  await expect(page.locator(".vendor-dossier .readiness-badge")).toContainText(
    "Ready to operate",
  );
  await page
    .getByRole("button", { name: "Business & tier", exact: true })
    .click();
  await page
    .getByLabel("Vendor event tier", { exact: true })
    .selectOption("bespoke");
  expect(
    (await store(page)).profiles.find((p) => p.id === "salo").ops.eventTier,
  ).toBe("bespoke");
  await page
    .getByRole("button", { name: /Luna Made.*No|Luna Made/ })
    .first()
    .click();
  await expect(page.locator(".subscription-summary")).toContainText(
    "No active subscription",
  );
});
test("merchant requests are not fulfillment and reported blockers reach the organizer", async ({
  page,
}) => {
  await page.goto("/?workspace=merchant&scenario=market");
  await page.getByRole("button", { name: "Logistics", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Request Cold storage", exact: true })
    .check();
  await expect(
    page.getByRole("checkbox", { name: "Fulfill Cold storage", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /^Issues/ }).click();
  await page
    .getByLabel("Issue summary", { exact: true })
    .fill("Fictional cold box is not available");
  await page
    .getByRole("button", { name: "Report demo issue", exact: false })
    .click();
  await view(page, "Admin");
  await page.getByRole("button", { name: /^Issues/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Fictional cold box is not available",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Logistics", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Request Cold storage", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Fulfill Cold storage", exact: true }),
  ).not.toBeChecked();
});
test("occupied booth opens standard ordering and shares verified fulfillment with that vendor", async ({
  page,
}) => {
  await page.goto("/?workspace=customer&scenario=market");
  const f = await openShop(page, "B02");
  await checkout(f);
  await f.getByRole("button", { name: "I’ve sent the demo payment" }).click();
  const id = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("kawing-demo-v1")).orders.find(
        (o) => !o.seed,
      ).id,
  );
  await view(page, "Admin");
  await page.getByRole("button", { name: "Orders", exact: true }).click();
  const card = page.locator(".market-orders article").filter({ hasText: id });
  await expect(
    card.getByRole("button", { name: "Start preparing" }),
  ).toBeDisabled();
  await card
    .getByRole("button", { name: "Review payment", exact: true })
    .click();
  await card
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await card.getByRole("button", { name: "Start preparing" }).click();
  await card.getByRole("button", { name: "Mark ready" }).click();
  await card.getByRole("button", { name: "Mark served" }).click();
  await view(page, "Customer");
  const returned = await openShop(page, "B02");
  await returned
    .getByRole("button", { name: "Order now", exact: true })
    .click();
  await expect(returned.locator(".cx-success")).toContainText(
    "Your order has been served",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kawing-demo-v1")).orders.find(
          (o) => !o.seed,
        ).sourceEvent.boothId,
    ),
  ).toBe("B02");
});
test("a craft booth uses its own catalog, cart and receipt instead of another merchant’s", async ({
  page,
}) => {
  await page.goto("/?workspace=customer&scenario=market");
  const f = await openShop(page, "B07");
  await checkout(f, "Everyday ceramic cup", "Cash");
  await expect(f.locator(".cx-success")).toContainText("350");
  const state = await page.evaluate(() => ({
    luna: JSON.parse(localStorage.getItem("kawing-merchant-v2:luna")),
    salo: localStorage.getItem("kawing-demo-v1"),
  }));
  expect(state.luna.orders).toHaveLength(1);
  expect(state.luna.orders[0].merchantId).toBe("luna");
  expect(state.salo).toBeNull();
  await page.getByRole("button", { name: "Back to map", exact: true }).click();
  await page.getByRole("button", { name: "B02 Occupied", exact: true }).click();
  await page
    .getByRole("button", { name: "Open Business Profile", exact: false })
    .click();
  await frame(page)
    .getByRole("button", { name: "Order now", exact: true })
    .click();
  await expect(frame(page).locator(".cx-success")).toHaveCount(0);
  await expect(
    frame(page).getByRole("button", { name: "Add Harvest bowl", exact: true }),
  ).toBeVisible();
});
test("checkout rejects an event closed or booth reassigned while a customer was browsing", async ({
  page,
}) => {
  await page.goto("/?workspace=customer&scenario=market");
  const f = await openShop(page, "B02");
  await f.getByRole("button", { name: "Order now", exact: true }).click();
  await f
    .getByRole("button", { name: "Add Harvest bowl", exact: true })
    .click();
  await f
    .getByRole("button", { name: "Review your order", exact: true })
    .click();
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("kawing-market-v1"));
    d.status = "ended";
    localStorage.setItem("kawing-market-v1", JSON.stringify(d));
  });
  await f
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await expect(f.getByRole("alert")).toContainText("not accepting new orders");
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("kawing-market-v1"));
    d.status = "active";
    d.booths.find((b) => b.id === "B02").merchant = "luna";
    localStorage.setItem("kawing-market-v1", JSON.stringify(d));
  });
  await f
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await expect(f.getByRole("alert")).toContainText("no longer available");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kawing-demo-v1")).orders.filter(
          (o) => !o.seed,
        ).length,
    ),
  ).toBe(0);
});

test("separate local views receive new orders and verified status without a reload", async ({
  page,
}) => {
  await page.goto("/?workspace=admin&scenario=market");
  await page.getByRole("button", { name: "Orders", exact: true }).click();
  const guest = await page.context().newPage();
  await guest.goto(
    "/?surface=guest&merchant=salo&entry=counter&marketBooth=B02#Customer",
  );
  await checkout(guest);
  await guest
    .getByRole("button", { name: "I’ve sent the demo payment" })
    .click();
  const id = await guest.evaluate(
    () =>
      JSON.parse(localStorage.getItem("kawing-demo-v1")).orders.find(
        (o) => !o.seed,
      ).id,
  );
  const card = page.locator(".market-orders article").filter({ hasText: id });
  await expect(card).toBeVisible();
  await card
    .getByRole("button", { name: "Review payment", exact: true })
    .click();
  await expect(guest.locator(".cx-payment-state")).toContainText(
    "Cashier reviewing",
  );
  await card
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(guest.locator(".cx-payment-state")).toContainText(
    "Cashier confirmed",
  );
  await card.getByRole("button", { name: "Start preparing" }).click();
  await card.getByRole("button", { name: "Mark ready" }).click();
  await card.getByRole("button", { name: "Mark served" }).click();
  await expect(guest.locator(".cx-success")).toContainText(
    "Your order has been served",
  );
  await guest.close();
});

test("mobile organizer switches vendor directly without scrolling a directory", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/?workspace=admin&scenario=market");
  await page
    .getByLabel("Select event business", { exact: true })
    .selectOption("luna");
  await expect(page.locator(".vendor-dossier>header")).toContainText(
    "Luna Made",
  );
  await page
    .getByRole("button", { name: "Business & tier", exact: true })
    .click();
  await expect(page.locator(".subscription-summary")).toContainText(
    "No active subscription",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
