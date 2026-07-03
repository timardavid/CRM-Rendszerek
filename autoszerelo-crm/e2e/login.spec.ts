import { test, expect } from "@playwright/test";
import { QA_EMAIL, QA_PASSWORD } from "./global-setup";

// Fresh, logged-out browser context for every test in this file.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Bejelentkezés", () => {
  test("hibás jelszóval hibaüzenetet mutat és törli a jelszó mezőt", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "nincs-ilyen-fiok@example.com");
    await page.fill("#password", "rosszjelszo123");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Hibás email vagy jelszó.")).toBeVisible();
    await expect(page.locator("#password")).toHaveValue("");
    await expect(page.locator("#password")).toBeFocused();
  });

  test("helyes adatokkal bejelentkezik és a dashboardra kerül", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", QA_EMAIL);
    await page.fill("#password", QA_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL("/");
    await expect(page.getByRole("heading", { name: "Áttekintés" })).toBeVisible();
  });
});
