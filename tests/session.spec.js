import { test, expect } from "@playwright/test";
import {
  parseSession,
  sessionHref,
  customizeTarget,
  resetKeys,
  tierOf,
} from "../src/session.js";

const header = (p) => p.locator(".space-session-header .session-context");
const switchTo = async (p, view) => {
  await p.getByRole("button", { name: "Switch View", exact: true }).click();
  await p.getByRole("button", { name: view, exact: true }).click();
};

test.describe("session model (pure)", () => {
  test("URL maps to scenario picker, view picker and view", () => {
    expect(parseSession("")).toMatchObject({ step: "scenario", view: null });
    expect(parseSession("?scenario=market")).toMatchObject({
      scenario: "market",
      step: "view",
      view: null,
    });
    expect(parseSession("?scenario=standard&workspace=admin")).toMatchObject({
      scenario: "standard",
      step: "inside",
      view: "admin",
    });
    expect(parseSession("?scenario=x&workspace=owner")).toMatchObject({
      scenario: "standard",
      view: null,
    });
    // Legacy links with only a workspace keep working as Standard Merchant.
    expect(parseSession("?workspace=merchant")).toMatchObject({
      scenario: "standard",
      step: "inside",
    });
  });
  test("session links keep unrelated parameters and set the view hash", () => {
    const base = "http://x.test/?merchant=salo&customize=1#Orders";
    expect(sessionHref(base, {})).toBe("http://x.test/?merchant=salo");
    expect(sessionHref(base, { scenario: "market" })).toBe(
      "http://x.test/?merchant=salo&scenario=market",
    );
    expect(
      sessionHref(base, { scenario: "standard", view: "merchant", customize: true }),
    ).toBe(
      "http://x.test/?merchant=salo&scenario=standard&workspace=merchant&customize=1#Customization",
    );
  });
  test("Customize never edits from Customer View", () => {
    expect(customizeTarget("standard", "customer").view).toBe("merchant");
    expect(customizeTarget("standard", "merchant").view).toBe("merchant");
    expect(customizeTarget("standard", "admin").view).toBe("admin");
    expect(customizeTarget("market", "customer").view).toBe("admin");
    expect(customizeTarget("market", "merchant").view).toBe("merchant");
  });
  test("reset only touches the chosen scenario and keeps Studio drafts by default", () => {
    const keys = [
      "kawing-demo-v1",
      "kawing-last-order",
      "kawing-guide-v1",
      "kawing-studio-draft",
      "kawing-cart-v2:salo:table:05",
      "kawing-cart-v2:luna:counter:",
      "kawing-market-v1",
      "kawing-merchant-v2:luna",
      "kawing-last-order:luna",
      "unrelated-key",
    ];
    expect(resetKeys("standard", keys)).toEqual([
      "kawing-demo-v1",
      "kawing-last-order",
      "kawing-guide-v1",
      "kawing-cart-v2:salo:table:05",
    ]);
    expect(
      resetKeys("standard", keys, { discardStudioDraft: true }),
    ).toContain("kawing-studio-draft");
    expect(resetKeys("market", keys)).toEqual([
      "kawing-cart-v2:luna:counter:",
      "kawing-market-v1",
      "kawing-merchant-v2:luna",
      "kawing-last-order:luna",
    ]);
  });
  test("unknown tiers fall back to the seeded Growth package", () => {
    expect(tierOf({ presentationTier: "basic" })).toBe("basic");
    expect(tierOf({ presentationTier: "platinum" })).toBe("growth");
    expect(tierOf(null)).toBe("growth");
  });
});

test("Scenario → View entry is two addressable steps with exactly three views", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Standard Merchant", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Pop-up Market", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Explore a market/ }).click();
  await expect(page).toHaveURL(/\?scenario=market$/);
  await expect(page.locator(".space-role-cards h2")).toHaveText([
    "Merchant View",
    "Customer View",
    "Admin View",
  ]);
  // No package, account or setup gate before a view.
  await expect(page.getByText(/Basic|Bespoke|Sign in|Create account/)).toHaveCount(0);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Pop-up Market", exact: true }),
  ).toBeVisible();
  await page.goForward();
  await page.getByRole("button", { name: /Enter Customer View/ }).click();
  await expect(header(page)).toContainText("Pop-up Market");
  await expect(header(page)).toContainText("Growth tier");
  await expect(header(page)).toContainText("Customer View");
  // Customer View carries no organizer or merchant controls.
  await expect(
    page.getByRole("button", { name: "Layout Editor", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "My participation", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Change Scenario", exact: true }).click();
  await page.getByRole("button", { name: /Explore a business/ }).click();
  await page.getByRole("button", { name: /Enter Customer View/ }).click();
  // The finished customer experience opens immediately, with no tier gate.
  await expect(
    page
      .frameLocator('iframe[title^="Customer "]')
      .getByRole("heading", { name: "Salo", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kawing Studio" })).toHaveCount(0);
});

test("Switch View menu is keyboard friendly and preserves the scenario", async ({
  page,
}) => {
  await page.goto("/?scenario=market&workspace=merchant");
  const trigger = page.getByRole("button", { name: "Switch View", exact: true });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("button", { name: /Merchant View/ }).first(),
  ).toHaveAttribute("aria-current", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  await switchTo(page, "Admin View");
  await expect(page).toHaveURL(/scenario=market&workspace=admin/);
  await expect(header(page)).toContainText("Pop-up Market");
  await expect(header(page)).toContainText("Admin View");
  await page.goBack();
  await expect(header(page)).toContainText("Merchant View");
});

test("Customize opens the right setup panel and tier changes reach the header", async ({
  page,
}) => {
  await page.goto("/?scenario=standard&workspace=customer#Customer");
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await expect(header(page)).toContainText("Merchant View");
  await expect(
    page.getByRole("tab", { name: "Media & tier", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page).not.toHaveURL(/customize=1/);
  // In place: from another Studio section, Customize returns to Media & tier.
  await page.getByRole("tab", { name: "Layout", exact: true }).click();
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "Media & tier", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await switchTo(page, "Admin View");
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A fit for every stage." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Basic Essential/ }).click();
  await expect(header(page)).toContainText("Basic tier");
  await page.goto("/?scenario=market&workspace=customer");
  await expect(header(page)).toContainText("Basic tier");
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await expect(header(page)).toContainText("Admin View");
  await expect(
    page.getByRole("heading", { name: "A shared event, clearly managed." }),
  ).toBeVisible();
});

test("Reset is scenario-scoped, confirmed, and keeps the Studio draft unless asked", async ({
  page,
}) => {
  await page.goto("/?scenario=market&workspace=admin");
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await page.getByLabel("Event name").fill("Evening Bazaar");
  await page.goto("/?scenario=standard&workspace=admin#Admin");
  await page.getByRole("button", { name: "Packages", exact: true }).click();
  await page.getByRole("button", { name: /Bespoke/ }).first().click();
  await switchTo(page, "Merchant View");
  await page.getByLabel("Restaurant name", { exact: true }).fill("Draft Name");
  await expect
    .poll(() => page.evaluate(() => !!localStorage.getItem("kawing-studio-draft")))
    .toBe(true);
  await expect(header(page)).toContainText("Bespoke tier");

  const dialog = page.getByRole("dialog", { name: /Reset Standard Merchant/ });
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Keep exploring" }).click();
  await expect(dialog).toBeHidden();
  await expect(header(page)).toContainText("Bespoke tier");

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    dialog.getByLabel("Also discard the unsaved Kawing Studio draft"),
  ).not.toBeChecked();
  await dialog.getByRole("button", { name: "Reset Standard" }).click();
  await expect(page.locator(".session-status")).toContainText(
    "Standard Merchant restored",
  );
  await expect(header(page)).toContainText("Growth tier");
  // Draft kept, market untouched.
  await expect(page.getByLabel("Restaurant name", { exact: true })).toHaveValue(
    "Draft Name",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("kawing-market-v1")).name,
    ),
  ).toBe("Evening Bazaar");

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await dialog.getByLabel("Also discard the unsaved Kawing Studio draft").check();
  await dialog.getByRole("button", { name: "Reset Standard" }).click();
  await expect(page.getByLabel("Restaurant name", { exact: true })).toHaveValue(
    "Salo",
  );

  await page.getByRole("button", { name: "Change Scenario", exact: true }).click();
  await page.getByRole("button", { name: /Explore a market/ }).click();
  await page.getByRole("button", { name: /Enter Customer View/ }).click();
  await expect(page.getByRole("heading", { name: "Evening Bazaar" })).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page
    .getByRole("dialog", { name: /Reset Pop-up Market/ })
    .getByRole("button", { name: "Reset Pop-up" })
    .click();
  await expect(
    page.getByRole("heading", { name: "The Sunday Commons" }),
  ).toBeVisible();
});

test("unsaved Studio work is warned about before switching views", async ({
  page,
}) => {
  await page.goto("/?scenario=standard&workspace=merchant#Customization");
  await page.getByLabel("Restaurant name", { exact: true }).fill("Unsaved");
  let message = "";
  page.once("dialog", (d) => {
    message = d.message();
    d.dismiss();
  });
  await switchTo(page, "Admin View");
  expect(message).toContain("retained draft");
  await expect(header(page)).toContainText("Merchant View");
});

test("mobile 360px header keeps every session action reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?scenario=market&workspace=merchant");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(0);
  for (const name of ["Switch View", "Customize", "More"]) {
    const box = await page.getByRole("button", { name, exact: true }).boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Change Scenario", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Change Scenario", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Pop-up Market", exact: true }),
  ).toBeVisible();
});
