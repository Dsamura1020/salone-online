import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("SaloneOnline").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" }).first()).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search");

    await expect(
      page.getByRole("heading", { name: "Search businesses" }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g. coffee shop in Freetown"),
    ).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: "About SaloneOnline" }),
    ).toBeVisible();
  });
});

test.describe("auth redirects", () => {
  test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
  });
});
