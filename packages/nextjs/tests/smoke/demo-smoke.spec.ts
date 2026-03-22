import { expect, test } from "@playwright/test";

test.describe("City/Sync demo smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("citysync:demo:guestMode", "1");
    });
  });

  test("demo landing renders role entry cards", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByText("City/Sync DEMO")).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter as Issuer Organization" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter as Redeemer Organization" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter as Civic Participant" })).toBeVisible();
  });

  test("core deep-dive pages return content", async ({ page }) => {
    const routes = [
      "/demo/about-pilot-program",
      "/demo/public-sector-economy",
      "/demo/task-management",
      "/demo/task-verification",
      "/demo/how-redemption-works",
      "/demo/graduate-sanctions",
      "/demo/mce",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.ok(), `expected 2xx response for ${route}`).toBeTruthy();
      await expect(page.locator("main h1, article h1, h1").first()).toBeVisible();
    }
  });

  test("experimental redesign page still loads", async ({ page }) => {
    const response = await page.goto("/demo/redesign");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByText("Civic Wallet OS")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start the Guided Tour" })).toBeVisible();
  });
});
