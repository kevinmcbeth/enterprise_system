import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to board
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
    await page.click('.project-card a');
    await expect(page).toHaveURL(/\/projects\/\d+\/board/, { timeout: 10000 });
  });

  test('should display board with columns', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Board');
    await expect(page.locator('app-board-column')).toHaveCount(3);
    await expect(page.locator('app-board-column h3').nth(0)).toHaveText('TO DO');
    await expect(page.locator('app-board-column h3').nth(1)).toHaveText('IN PROGRESS');
    await expect(page.locator('app-board-column h3').nth(2)).toHaveText('DONE');
  });

  test('should display task cards', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForTimeout(2000);
    const cards = page.locator('app-task-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should create a new task', async ({ page }) => {
    await page.fill('input[placeholder="New task title..."]', 'My Playwright Test Task');
    await page.click('button:has-text("Add Task")');

    // Wait for task to appear
    await page.waitForTimeout(2000);
    await expect(page.locator('app-task-card h4:has-text("My Playwright Test Task")')).toBeVisible();
  });

  test('should open task detail modal on click', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForTimeout(2000);
    const firstCard = page.locator('app-task-card').first();
    await firstCard.click();

    // Modal should appear
    await expect(page.locator('.overlay')).toBeVisible();
    await expect(page.locator('.modal h3')).toBeVisible();
  });

  test('should close task detail modal', async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.locator('app-task-card').first().click();
    await expect(page.locator('.overlay')).toBeVisible();

    // Click close button
    await page.click('.close-btn');
    await expect(page.locator('.overlay')).not.toBeVisible();
  });

  test('should have add task input and button', async ({ page }) => {
    await expect(page.locator('input[placeholder="New task title..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Add Task")')).toBeVisible();
  });
});
