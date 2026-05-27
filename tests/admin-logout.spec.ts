import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "admin",
      JSON.stringify({
        name: "Bethel Admin",
        role: "SUPER_ADMIN",
      })
    )

    localStorage.setItem("adminToken", "fake-token")
  })

  await page.goto("http://localhost:5173/dashboard")

})

test("can open profile dropdown", async ({ page }) => {
  await page.getByTestId("profile-menu-button").click()

  await expect(
    page.getByTestId("logout-button")
  ).toBeVisible()
})

test("can logout", async ({ page }) => {
  await page.getByTestId("profile-menu-button").click()

  await page.getByTestId("logout-button").click()

  await expect(page).toHaveURL("http://localhost:5173/")
})