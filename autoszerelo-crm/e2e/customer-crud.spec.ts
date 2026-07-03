import { test, expect } from "@playwright/test";
import { AUTH_FILE, QA_PREFIX } from "./global-setup";

test.use({ storageState: AUTH_FILE });

test.describe("Ügyfél CRUD", () => {
  test("létrehozás, szerkesztés és törlés végigmegy", async ({ page }) => {
    const name = `${QA_PREFIX}Teszt Ügyfél`;

    await page.goto("/customers");
    await page.getByRole("button", { name: "Új ügyfél" }).click();
    await page.fill("#custName", name);
    await page.fill("#custPhone", "+36201234567");
    await page.getByRole("dialog").getByRole("button", { name: "Mentés" }).click();
    await expect(page.getByText(name)).toBeVisible();

    await page.getByText(name).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();

    await page.getByRole("button", { name: "Ügyfél szerkesztése" }).click();
    await page.fill("#custPhone", "+36301112233");
    await page.getByRole("dialog").getByRole("button", { name: "Mentés" }).click();
    await expect(page.getByText("+36301112233")).toBeVisible();

    await page.getByRole("button", { name: "Ügyfél törlése" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Ügyfél törlése" }).click();

    await page.waitForURL("/customers");
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
