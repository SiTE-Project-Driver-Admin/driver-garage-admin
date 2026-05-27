import { test, expect } from "@playwright/test"

test("admin can login successfully", async ({ page }) => {
  await page.goto("http://localhost:5173")

  await page.getByTestId("email-input").fill("admin@example.com")
  await page.getByTestId("password-input").fill("admin123")
  await page.getByTestId("login-button").click()

  await expect(page.getByText("Dashboard")).toBeVisible()
})

test("shows error on invalid login", async ({ page }) => {
  await page.goto("http://localhost:5173")

  await page.getByTestId("email-input").fill("wrong@example.com")
  await page.getByTestId("password-input").fill("wrongpassword")
  await page.getByTestId("login-button").click()

  await expect(page.getByTestId("login-error")).toBeVisible()
})