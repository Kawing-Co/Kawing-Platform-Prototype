import { test, expect } from "@playwright/test";

async function enter(page, scenario, role) {
  await page.goto("/");
  await page.getByRole("button", { name: new RegExp(scenario) }).click();
  await page.getByRole("button", { name: new RegExp("Enter " + role) }).click();
  // Pop-up Merchant View opens on the booth map, with no extra click.
  if (role === "Merchant View" && scenario === "Explore a market")
    await expect(
      page.getByRole("button", { name: "Map", exact: true }),
    ).toHaveClass(/active/);
}
test("two simulations lead immediately to exactly three spaces", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Standard Merchant", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Pop-up Market", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Explore a business/ }).click();
  await expect(page.locator(".space-role-cards>button")).toHaveCount(3);
  await page.getByRole("button", { name: /Enter Merchant View/ }).click();
  await expect(
    page.getByRole("heading", { name: /Kawing Studio/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Customization", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch View", exact: true }).click();
  await page.getByRole("button", { name: "Customer View", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Preview options", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Customization", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Switch View", exact: true }).click();
  await page.getByRole("button", { name: "Admin View", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A clear view of the whole." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Packages", exact: true }).click();
  await page.getByRole("button", { name: /Basic Essential/ }).click();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("kawing-demo-v1")).presentationTier,
    ),
  ).toBe("basic");
});
test("shared booth assignment propagates across merchant, customer and admin", async ({
  page,
}) => {
  await enter(page, "Explore a market", "Merchant View");
  await page
    .getByRole("button", { name: "B01 Available", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm demo booth", exact: false })
    .click();
  await expect(page.getByRole("status")).toContainText("confirmed locally");
  await page.getByRole("button", { name: "Switch View", exact: true }).click();
  await page.getByRole("button", { name: "Customer View", exact: true }).click();
  await page.getByRole("button", { name: "B01 Occupied", exact: true }).click();
  await expect(page.locator(".booth-detail")).toContainText("Salo");
  await expect(
    page.getByRole("button", { name: "Confirm demo booth", exact: false }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Switch View", exact: true }).click();
  await page.getByRole("button", { name: "Admin View", exact: true }).click();
  await page
    .getByRole("button", { name: "Layout Editor", exact: true })
    .click();
  await page.getByRole("button", { name: "B01 Occupied", exact: true }).click();
  await page.getByLabel("Booth y", { exact: true }).fill("30");
  await page
    .getByRole("button", { name: "Publish demo layout", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("walkway");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByLabel("Booth x", { exact: true }).fill("-1");
  await page
    .getByRole("button", { name: "Publish demo layout", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("inside");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByLabel("Booth x", { exact: true }).fill("24");
  await page
    .getByRole("button", { name: "Publish demo layout", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("overlaps");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByLabel("Booth x", { exact: true }).fill("6");
  await page
    .getByRole("button", { name: "Publish demo layout", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("browser only");
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kawing-market-v1")).booths.find(
          (b) => b.id === "B01",
        ).x,
    ),
  ).toBe(6);
});
test("temporary profile and lifecycle are real local interactions", async ({
  page,
}) => {
  await enter(page, "Explore a market", "Admin View");
  await page.getByRole("button", { name: "Merchants", exact: true }).click();
  await page.getByLabel("Business name", { exact: true }).fill("Demo Bloom");
  await page
    .getByRole("button", {
      name: "Create temporary demo profile",
      exact: false,
    })
    .click();
  await page
    .getByRole("button", { name: "B03 Available", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Layout Editor", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Assigned merchant", exact: true })
    .selectOption({ label: "Demo Bloom" });
  await page
    .getByRole("button", { name: "Publish demo layout", exact: true })
    .click();
  await page.getByRole("button", { name: "Event setup", exact: true }).click();
  await page
    .getByLabel("Event lifecycle", { exact: true })
    .selectOption("ended");
  await page.getByRole("button", { name: "Switch View", exact: true }).click();
  await page.getByRole("button", { name: "Customer View", exact: true }).click();
  await page.getByRole("button", { name: "B03 Occupied", exact: true }).click();
  await expect(page.locator(".booth-detail")).toContainText(
    "no longer publicly discoverable",
  );
  await expect(page.locator(".market-ended")).toContainText("ended");
});
test("layout validation rejects overlap and bounds; mobile has usable map/list navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await enter(page, "Explore a market", "Customer View");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Fit map", exact: true }).click();
  await page.getByRole("button", { name: "Booth list", exact: true }).click();
  await expect(page.getByLabel("Accessible booth list")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".market-pager")).toContainText("Page 2");
  await page.getByRole("button", { name: "B07", exact: false }).click();
  await expect(page.locator(".booth-detail")).toContainText("Luna Made");
});

test("Studio drafts survive view changes and package media limits are functional", async ({
  page,
}) => {
  await enter(page, "Explore a business", "Merchant View");
  await page
    .getByLabel("Restaurant name", { exact: true })
    .fill("Draft Coffee");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Switch View", exact: true }).click();
  await page.getByRole("button", { name: "Customer View", exact: true }).click();
  await expect(
    page
      .frameLocator('iframe[title^="Customer "]')
      .getByRole("heading", { name: "Salo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch View", exact: true }).click();
  await page.getByRole("button", { name: "Merchant View", exact: true }).click();
  await expect(page.getByLabel("Restaurant name", { exact: true })).toHaveValue(
    "Draft Coffee",
  );
  await page
    .getByRole("button", { name: "Save design", exact: true })
    .first()
    .click();
  await page.getByRole("tab", { name: "Media & tier", exact: true }).click();
  await page.getByRole("button", { name: /Basic Essential/ }).click();
  await page
    .getByRole("button", { name: "Add approved gallery image", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add approved gallery image", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Add approved gallery image",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Try a mock style suggestion",
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Save design", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Switch View", exact: true }).click();
  await page.getByRole("button", { name: "Customer View", exact: true }).click();
  await expect(
    page
      .frameLocator('iframe[title^="Customer "]')
      .getByRole("heading", { name: "Draft Coffee", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title^="Customer "]')
      .getByLabel("Business gallery")
      .locator("img"),
  ).toHaveCount(2);
});
