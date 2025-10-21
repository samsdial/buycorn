import { expect, test } from '@playwright/test';

test('home page loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Buy Corn - limiter time/);

  const body = page.locator('body');
  await expect(body).toBeVisible();
});

test('home page has main element', async ({ page }) => {
  await page.goto('/');

  const main = page.locator('main');
  await expect(main).toBeVisible();
});
