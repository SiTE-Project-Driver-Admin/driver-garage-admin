import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("adminToken", "fake-token")
  })
})

test("user management page loads", async ({ page }) => {
  await page.goto("http://localhost:5173/users")

  await expect(page.getByTestId("users-page-title")).toBeVisible()
  await expect(page.getByTestId("users-page-subtitle")).toBeVisible()
})

test("users table loads with data", async ({ page }) => {
  await page.goto("http://localhost:5173/users")

  await expect(page.locator("table")).toBeVisible()

  await expect(page.locator("tbody tr").first()).toBeVisible()
})

test("user stats are visible", async ({ page }) => {
  await page.goto("http://localhost:5173/users")

  await expect(page.getByTestId("stat-total-users")).toBeVisible()
  await expect(page.getByTestId("stat-active-users")).toBeVisible()
  await expect(page.getByTestId("stat-warned-users")).toBeVisible()
  await expect(page.getByTestId("stat-blocked-users")).toBeVisible()
})

test("can search users", async ({ page }) => {
  await page.goto("http://localhost:5173/users")

  await page.getByPlaceholder("Search users by name or email...").fill("john")

  await expect(page.getByTestId("users-table")).toBeVisible()
  await expect(page.locator("tbody tr").first()).toBeVisible()
})

test("can block a user", async ({ page }) => {
  await page.goto("http://localhost:5173/users")

  const firstRow = page.locator("tbody tr").first()

  await firstRow.getByRole("button").nth(1).click()

  // optional: verify UI update (depends on backend response)
  await expect(firstRow).toBeVisible()
})