import { test, expect } from "@playwright/test";
import { studioChecks } from "../src/studio-review.js";

const base = {
  modules: [{ type: "order", enabled: true }],
  socials: [],
  reviewUrl: "",
  promotion: { start: "2026-11-01", end: "2026-11-30" },
  galleryAssets: ["/a.jpg", "/b.jpg", "/c.jpg"],
};
const failing = (draft, brand, tier) =>
  studioChecks(draft, brand, tier)
    .filter((c) => !c.ok)
    .map((c) => c.id);

test("Review & publish checks mirror save rules and package quotas", () => {
  expect(failing(base, { name: "Salo" }, "growth")).toEqual([]);
  expect(failing(base, { name: "  " }, "growth")).toEqual(["name"]);
  expect(failing(base, { name: "Salo" }, "basic")).toEqual(["gallery"]);
  expect(
    failing(
      {
        ...base,
        modules: [{ type: "order", enabled: false }],
        socials: [{ platform: "Instagram", url: "javascript:alert(1)" }],
        promotion: { start: "2026-12-01", end: "2026-11-01" },
      },
      { name: "Salo" },
    ),
  ).toEqual(["modules", "social", "promotion"]);
});

test("Kawing Studio ends with Review & publish and its checklist reacts to the draft", async ({
  page,
}) => {
  await page.goto("/?scenario=standard&workspace=merchant#Customization");
  await expect(page).toHaveTitle("Kawing · Kawing Studio");
  const tabs = page.getByRole("tab");
  await expect(tabs.first()).toHaveText("Business details");
  await expect(tabs.last()).toHaveText("Review & publish");
  await page
    .getByRole("tab", { name: "Review & publish", exact: true })
    .click();
  await expect(page.locator(".studio-check-summary")).toHaveText(
    "All checks pass. Saving updates this browser only.",
  );
  await page.getByRole("tab", { name: "Brand", exact: true }).click();
  await page.getByLabel("Restaurant name", { exact: true }).fill("");
  await page
    .getByRole("tab", { name: "Review & publish", exact: true })
    .click();
  await expect(page.locator(".studio-check-summary")).toHaveText(
    "1 item needs attention before saving.",
  );
  await expect(page.locator(".studio-checklist")).toContainText(
    "Add a name in Brand.",
  );
});

test("no user-facing Storefront wording remains on the main surfaces", async ({
  page,
}) => {
  for (const url of [
    "/",
    "/?scenario=standard",
    "/?scenario=standard&workspace=merchant#Customization",
    "/?scenario=standard&workspace=admin#Admin",
    "/?workspace=merchant#Start%20here",
    "/?surface=guest&entry=table&table=03#Customer",
  ]) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    expect(await page.locator("body").innerText(), url).not.toMatch(
      /storefront/i,
    );
    expect(await page.title(), url).not.toMatch(/storefront/i);
  }
  await page.getByRole("button", { name: "Order now", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Back to Business Profile", exact: true }),
  ).toBeVisible();
});

test("saving a blank name preserves the saved profile and draft until corrected", async ({
  page,
}) => {
  await page.goto("/?scenario=standard&workspace=merchant#Customization");
  const read = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("kawing-demo-v1")));
  const before = await read();
  await page.getByLabel("Restaurant name", { exact: true }).fill("   ");
  await page
    .getByRole("tab", { name: "Review & publish", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save demo design", exact: true })
    .click();
  expect((await read()).brand).toEqual(before.brand);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("kawing-studio-draft")).brand.name,
    ),
  ).toBe("   ");
  await expect(page.locator(".studio-save-bar [role=status]")).toContainText(
    "Add a business name",
  );
  await page.getByRole("tab", { name: "Brand", exact: true }).click();
  await page
    .getByLabel("Restaurant name", { exact: true })
    .fill("New neighborhood cafe");
  await page
    .getByRole("button", { name: "Save design", exact: true })
    .first()
    .click();
  await expect
    .poll(async () => (await read()).brand.name)
    .toBe("New neighborhood cafe");
  expect((await read()).orders).toEqual(before.orders);
  expect(
    await page.evaluate(() => localStorage.getItem("kawing-studio-draft")),
  ).toBeNull();
});
