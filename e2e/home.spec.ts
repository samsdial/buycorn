import { test, expect } from '@playwright/test';

test('home page loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Next.js/);

  const body = page.locator('body');
  await expect(body).toBeVisible();
});

test('home page has main element', async ({ page }) => {
  await page.goto('/');
  const main = page.locator('main');
  await expect(main).toBeVisible();
});
