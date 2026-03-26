import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Authentication', () => {
  test.use({
    storageState: { cookies: [], origins: [] }
  });

  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toHaveText('Login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login with valid credentials', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'password');

    await expect(page).toHaveURL(/\/projects/, { timeout: 10000 });
    await expect(page.locator('h2')).toHaveText('Projects');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "passord");
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error')).toHaveText('Invalid email or password');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator('h2')).toHaveText('Sign Up');
  });

  test('should logout', async ({ page }) => {
    // Login first
    await loginAs(page, 'admin@example.com', 'password');

    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
  });
});
