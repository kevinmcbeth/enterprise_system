import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('All Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    await loginAs(page, 'admin@example.com', 'password');
  });

  test('should navigate to All Tasks from navbar', async ({ page }) => {
    await page.click('a[href="/tasks"]');
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
    await expect(page.locator('h2')).toHaveText('All Tasks');
  });

  test('should display tasks table with columns', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th')).toHaveCount(6);
    await expect(page.locator('th').nth(0)).toHaveText('Title');
    await expect(page.locator('th').nth(1)).toHaveText('Project');
    await expect(page.locator('th').nth(2)).toHaveText('Status');
    await expect(page.locator('th').nth(3)).toHaveText('Priority');
    await expect(page.locator('th').nth(4)).toHaveText('Assignee');
    await expect(page.locator('th').nth(5)).toHaveText('Due Date');
  });

  test('should show tasks from seed data', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForTimeout(2000);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show project name for each task', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForTimeout(2000);
    await expect(page.locator('tbody tr').first().locator('td').nth(1)).not.toHaveText('');
  });

  test('should show task summary count', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForTimeout(2000);
    await expect(page.locator('.summary')).toContainText('task(s)');
    await expect(page.locator('.summary')).toContainText('project(s)');
  });

  test('should filter by project', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForTimeout(2000);
    const totalBefore = await page.locator('tbody tr').count();

    // Select first project in filter
    await page.locator('select').first().selectOption({ index: 1 });
    await page.waitForTimeout(500);

    const totalAfter = await page.locator('tbody tr').count();
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
    expect(totalAfter).toBeGreaterThan(0);
  });

  test('should filter by priority', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForTimeout(2000);

    // Filter by P0
    await page.locator('select').nth(1).selectOption('P0');
    await page.waitForTimeout(500);

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    // All visible rows should have P0 priority
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('app-priority-badge')).toContainText('P0');
    }
  });

  test('should navigate to project board when clicking a task row', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForTimeout(2000);
    await page.locator('tbody tr').first().click();
    await expect(page).toHaveURL(/\/projects\/\d+\/board/, { timeout: 10000 });
  });

  test('should require authentication', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/login/);
  });
});
