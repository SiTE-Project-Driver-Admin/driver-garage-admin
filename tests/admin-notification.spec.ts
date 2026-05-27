import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("adminToken", "fake-token")
  })

  await page.route("**/admin/notifications", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "1",
          title: "Server Update",
          message: "System maintenance scheduled",
          type: "WARNING",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Welcome",
          message: "System is running normally",
          type: "SUCCESS",
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ]),
    })
  })

  await page.route("**/admin/notifications/*/read", async (route) => {
    const url = route.request().url()

    const id = url.split("/").slice(-2)[0]

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id,
        title: "Server Update",
        message: "System maintenance scheduled",
        type: "WARNING",
        isRead: true,
        createdAt: new Date().toISOString(),
      }),
    })
  })

  await page.route("**/admin/notifications/read-all", async (route) => {
    await route.fulfill({
      status: 200,
    })
  })

  await page.goto("http://localhost:5173/notifications")

  await expect(page.getByText("Loading notifications...")).toBeHidden({
    timeout: 10000,
  })
})

test("notifications page loads", async ({ page }) => {
  await expect(page.getByTestId("page-title")).toBeVisible()

  await expect(
    page.getByTestId("notifications-subtitle")
  ).toBeVisible()
})

test("unread card is visible", async ({ page }) => {
  await expect(page.getByText("Unread Notifications")).toBeVisible()
})

test("notifications are rendered", async ({ page }) => {
  const items = page.locator(".bg-white.rounded-xl.border.divide-y > div")
  await expect(items.first()).toBeVisible()
})

test("can mark single notification as read", async ({ page }) => {
  await page.getByRole("button", { name: /mark as read/i }).first().click()

  await expect(page.getByRole("button", { name: /mark as read/i })).toBeHidden()
})

test("can mark all as read", async ({ page }) => {
  await page.getByTestId("mark-all-read").click()

  await expect(page.locator(".bg-yellow-50")).toHaveCount(0)
})