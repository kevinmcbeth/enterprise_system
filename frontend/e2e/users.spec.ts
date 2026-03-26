import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Users (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
  });

  test('should navigate to Users from navbar', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'password');
    await page.click('a[href="/users"]');
    await expect(page).toHaveURL(/\/users/, { timeout: 10000 });
    await expect(page.locator('h2')).toHaveText('Users');
  });

  test('should display users table for admin', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'password');
    await page.goto('/users');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th').nth(0)).toHaveText('Name');
    await expect(page.locator('th').nth(1)).toHaveText('Email');
    await expect(page.locator('th').nth(2)).toHaveText('Role');
    await expect(page.locator('th').nth(3)).toHaveText('Created');
  });

  test('should show seed users', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'password');
    await page.goto('/users');
    await page.waitForTimeout(2000);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should show admin and member roles', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'password');
    await page.goto('/users');
    await page.waitForTimeout(2000);
    await expect(page.locator('.role-badge.admin').first()).toHaveText('ADMIN');
    await expect(page.locator('.role-badge:not(.admin)').first()).toHaveText('MEMBER');
  });

  test('should show user count', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'password');
    await page.goto('/users');
    await page.waitForTimeout(2000);
    await expect(page.locator('.summary')).toContainText('user(s)');
  });

  test('should deny access to non-admin users', async ({ page }) => {
    await loginAs(page, 'member@example.com', 'password');
    await page.goto('/users');
    await page.waitForTimeout(2000);
    await expect(page.locator('.error')).toHaveText('Access denied. Admin privileges required.');
  });
});
