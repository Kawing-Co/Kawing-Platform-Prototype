import { test, expect } from "@playwright/test";
import { inTriangle } from "../src/premium.js";
const studio = "/?scenario=standard&workspace=merchant#Customization";
test("pointer intent keeps a diagonal path inside the submenu safety region", () => {
  expect(
    inTriangle(
      { x: 60, y: 25 },
      { x: 0, y: 50 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ),
  ).toBe(true);
  expect(
    inTriangle(
      { x: 20, y: 5 },
      { x: 0, y: 50 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ),
  ).toBe(false);
});
test("command search navigates with the keyboard and honors unsaved draft cancellation", async ({
  page,
}) => {
  await page.goto(studio);
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", {
    name: "Quick actions",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await page
    .getByRole("combobox", { name: "Search actions" })
    .fill("Staff orders");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#Orders$/);
  await expect(dialog).toBeHidden();
  await page.goto(studio);
  await page
    .getByLabel("Restaurant name", { exact: true })
    .fill("Retained premium draft");
  await page.getByRole("button", { name: "Open quick actions" }).click();
  await page
    .getByRole("combobox", { name: "Search actions" })
    .fill("Customer View");
  page.once("dialog", (d) => d.dismiss());
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Restaurant name", { exact: true })).toHaveValue(
    "Retained premium draft",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("kawing-studio-draft")).brand.name,
    ),
  ).toBe("Retained premium draft");
});
test("undo restores only catalog availability and can be consumed only once", async ({
  page,
}) => {
  await page.goto(studio);
  const original = await page.evaluate(
    () => JSON.parse(localStorage.getItem("kawing-demo-v1")).orders,
  );
  await page.getByRole("tab", { name: "Menu", exact: true }).click();
  const available = page.getByRole("checkbox", {
    name: "Studio availability Matcha Latte",
    exact: true,
  });
  await available.uncheck();
  await expect(available).not.toBeChecked();
  await expect(page.locator(".premium-toast")).toContainText("sold out");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(available).toBeChecked();
  await expect(page.locator(".premium-toast")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("kawing-demo-v1")).orders,
    ),
  ).toEqual(original);
});
test("module visibility undo restores the live draft and navigation clears stale undo", async ({
  page,
}) => {
  await page.goto(studio);
  await page.getByRole("tab", { name: "Modules", exact: true }).click();
  const toggle = page.getByRole("checkbox", {
    name: "Enable Private feedback",
    exact: true,
  });
  await toggle.uncheck();
  await expect(
    page
      .frameLocator('iframe[title="Interactive Studio preview"]')
      .getByRole("button", { name: "Private feedback", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  await page.getByRole("button", { name: "Open quick actions" }).click();
  await page
    .getByRole("combobox", { name: "Search actions" })
    .fill("Business analytics");
  page.once("dialog", (d) => d.accept());
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#Analytics$/);
  await expect(page.locator(".premium-toast")).toHaveCount(0);
});
test("mobile command sheet supports swipe dismissal, Escape and focus return", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(studio);
  const trigger = page.getByRole("button", { name: "Open quick actions" });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Quick actions", exact: true }),
  ).toBeVisible();
  const handle = page.locator(".command-sheet-handle");
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 135, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByRole("dialog", { name: "Quick actions", exact: true }),
  ).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("optional spatial preview has honest fallback and film never starts automatically", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return kind === "webgl" ? null : original.call(this, kind, ...args);
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore in 3D", exact: true })
    .click();
  await expect(
    page.getByText("3D isn’t available in this browser.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Watch the product story", exact: false })
    .click();
  const film = page.getByRole("dialog", {
    name: "Kawing product story",
    exact: true,
  });
  await expect(film).toBeVisible();
  expect(
    await film.locator("video").evaluate((v) => v.paused && !v.autoplay),
  ).toBe(true);
  await film.getByRole("button", { name: "Close product story" }).click();
  await expect(film).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Watch the product story", exact: false }),
  ).toBeFocused();
});
test("real WebGL scene rotates, zooms and recovers from context loss", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore in 3D", exact: true })
    .click();
  await expect(
    page.locator(".spatial-canvas, .spatial-fallback"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rotate scene right" }).click();
  await page.getByRole("button", { name: "Reset scene rotation" }).click();
  if (await page.locator(".spatial-canvas").count()) {
    await page
      .locator(".spatial-canvas")
      .evaluate((c) =>
        c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
      );
    await expect(page.locator(".spatial-fallback")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Rotate scene right" }),
    ).toBeHidden();
  }

  await page.getByRole("tab", { name: "02 Team", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("A team in sync.");
});
test("3D stays unloaded until requested, draws only on demand and supports focused keys", async ({
  page,
}) => {
  const loaded = [];
  page.on("request", (r) => {
    if (r.url().includes("SpatialCanvas")) loaded.push(r.url());
  });
  await page.addInitScript(() => {
    window.__sceneDraws = 0;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      window.__sceneDraws++;
      return draw.apply(this, args);
    };
  });
  await page.goto("/");
  await page.locator(".product-story").scrollIntoViewIfNeeded();
  expect(loaded).toHaveLength(0);
  await page
    .getByRole("button", { name: "Explore in 3D", exact: true })
    .click();
  const canvas = page.locator(".spatial-canvas");
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__sceneDraws))
    .toBeGreaterThan(0);
  expect(loaded.length).toBeGreaterThan(0);
  await page.waitForTimeout(200); // Allow the initial ResizeObserver delivery to settle.
  const idle = await page.evaluate(() => window.__sceneDraws);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__sceneDraws)).toBe(idle);
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  expect(Number(await canvas.getAttribute("data-angle"))).toBeCloseTo(-0.05);
  await page.keyboard.press("+");
  expect(Number(await canvas.getAttribute("data-zoom"))).toBeCloseTo(1.15);
  await page.keyboard.press("Home");
  await expect(canvas).toHaveAttribute("data-angle", "-0.35");
  await expect(canvas).toHaveAttribute("data-zoom", "1");
  await page
    .getByRole("button", { name: "Inspect scene detail", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-zoom", "1.35");
  await page
    .getByRole("button", { name: "Show full scene", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-zoom", "1");
  await page.getByRole("tab", { name: "01 Guest", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel")).toContainText("A team in sync.");
  await expect(
    page.getByRole("tab", { name: "02 Team", exact: true }),
  ).toBeFocused();
});
test("slow iframe reveals a stable skeleton and its selected screen size is preserved", async ({
  page,
}) => {
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route("**/?surface=studio-preview", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto(studio);
  await expect(
    page.getByRole("status", { name: "Loading customer preview", exact: true }),
  ).toBeVisible();
  release();
  await expect(
    page
      .frameLocator('iframe[title="Interactive Studio preview"]')
      .getByRole("button", { name: "Order now", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Loading customer preview", exact: true }),
  ).toHaveCount(0);
});
test("BlurHash placeholder keeps menu images stable until the real photograph loads", async ({
  page,
}) => {
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route("**/images/matcha/latte-iced.jpg", async (r) => {
    await gate;
    await r.continue();
  });
  await page.goto("/?surface=guest&entry=counter#Customer");
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  const image = page.locator(".progressive-image").first();
  await expect(image).not.toHaveClass(/image-ready/);
  expect(
    await image.evaluate((e) => getComputedStyle(e).backgroundImage),
  ).toContain("data:image/png");
  const before = await image.boundingBox();
  release();
  await expect(image).toHaveClass(/image-ready/);
  const after = await image.boundingBox();
  expect(Math.abs(after.height - before.height)).toBeLessThan(0.1);
});
test("reduced motion, immediate ordering feedback, and recovery autofill remain accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?surface=guest&entry=counter#Customer");
  await page.getByRole("button", { name: "My rewards", exact: true }).click();
  await page
    .getByText("Recover a demo loyalty account", { exact: true })
    .click();
  await expect(
    page.getByLabel("Recovery code", { exact: true }),
  ).toHaveAttribute("autocomplete", "one-time-code");
  await page
    .getByRole("button", { name: "Back to Business Profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Matcha Latte", exact: true })
    .click();
  await expect(
    page
      .getByRole("button", { name: "Add one Matcha Latte", exact: true })
      .first(),
  ).toBeVisible();
  await page.locator(".cx-mobile-bag").click(); // phones: the order is a bottom sheet
  await page
    .getByRole("button", { name: "Review your order", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .dblclick();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kawing-demo-v1")).orders.filter(
          (o) => !o.seed,
        ).length,
    ),
  ).toBe(1);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("rapid view transitions finish on the last requested scenario", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    const cards = document.querySelectorAll(".scenario-cards>button");
    cards[0].click();
    cards[1].click();
  });
  await expect(page).toHaveURL(/scenario=market$/);
  await expect(page.locator(".space-role-cards")).toContainText(
    "Opens the booth map.",
  );
});
test("foreground revalidation refreshes a cached local order snapshot", async ({
  page,
}) => {
  await page.goto("/?scenario=market&workspace=admin");
  await page.evaluate(() =>
    localStorage.setItem(
      "kawing-demo-v1",
      JSON.stringify({
        orders: [
          {
            id: "SWR-DEMO",
            merchantId: "salo",
            payment: "GCash",
            paymentStatus: "selected",
            status: "new",
            total: 285,
            items: [{ id: 1, name: "Sample order", qty: 1 }],
          },
        ],
      }),
    ),
  );
  await page.getByRole("button", { name: "Orders", exact: true }).click();
  const order = page
    .locator(".market-orders article")
    .filter({ hasText: "SWR-DEMO" });
  await expect(order).toContainText("Method selected");
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("kawing-demo-v1"));
    d.orders[0].paymentStatus = "claimed";
    localStorage.setItem("kawing-demo-v1", JSON.stringify(d));
    window.dispatchEvent(new Event("focus"));
  });
  await expect(order).toContainText("Customer claims payment sent");
});

test.describe("Touch scene", () => {
  test.use({ isMobile: true, hasTouch: true });
  test("mobile scene and all inspection controls stay inside the visible card", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Explore in 3D", exact: true })
      .click();
    await expect(page.locator(".spatial-canvas")).toBeVisible();
    await page.locator(".product-story").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.locator(".spatial-controls").evaluate((e) => {
          const card = e.closest(".product-story").getBoundingClientRect(),
            r = e.getBoundingClientRect();
          return (
            r.left >= card.left &&
            r.right <= card.right &&
            r.right <= innerWidth
          );
        }),
      )
      .toBe(true);
    const controls = await page.locator(".spatial-controls").boundingBox();
    const close = await page
      .getByRole("button", { name: "Close 3D", exact: true })
      .boundingBox();
    expect(close.x + close.width).toBeLessThanOrEqual(controls.x);
    await page
      .getByRole("button", { name: "Inspect scene detail", exact: true })
      .click();
    await expect(page.locator(".spatial-canvas")).toHaveAttribute(
      "data-zoom",
      "1.35",
    );
    await page
      .getByRole("button", { name: "Show full scene", exact: true })
      .click();
    await expect(page.locator(".spatial-canvas")).toHaveAttribute(
      "data-zoom",
      "1",
    );
  });
});
