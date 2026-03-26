import { test, expect } from '@playwright/test';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 10000 });
  });

  test('should display project list', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Projects');
    await expect(page.locator('.project-card')).toHaveCount(1);
    await expect(page.locator('.project-card h3')).toHaveText('Demo Project');
  });

  test('should show create project form', async ({ page }) => {
    await page.click('button:has-text("+ New Project")');
    await expect(page.locator('.create-form')).toBeVisible();
    await expect(page.locator('.create-form input').first()).toBeVisible();
  });

  test('should navigate to board when clicking project', async ({ page }) => {
    await page.click('.project-card a');
    await expect(page).toHaveURL(/\/projects\/\d+\/board/, { timeout: 10000 });
    await expect(page.locator('h2')).toHaveText('Board');
  });
});
