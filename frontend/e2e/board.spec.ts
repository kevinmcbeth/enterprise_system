import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to board
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    await loginAs(page, 'admin@example.com', 'password');
    await page.click('.project-card a');
    await expect(page).toHaveURL(/\/projects\/\d+\/board/, { timeout: 10000 });
  });

  test('should display board with columns', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Board');
    await expect(page.locator('app-board-column')).toHaveCount(3);
    await expect(page.locator('app-board-column h3').nth(0)).toHaveText('To Do');
    await expect(page.locator('app-board-column h3').nth(1)).toHaveText('In Progress');
    await expect(page.locator('app-board-column h3').nth(2)).toHaveText('Done');
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

    await expect(
      page.locator('app-task-card h4:has-text("My Playwright Test Task")').first()
    ).toBeVisible();

    // Clean up - delete the task after the test
    await page.locator('app-task-card:has(h4:has-text("My Playwright Test Task"))').first().click();
    await page.click('button:has-text("Delete")'); // whatever your delete button is
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

  test('should delete a task from detail modal', async ({ page }) => {
    // Create a task to delete
    await page.fill('input[placeholder="New task title..."]', 'Task To Delete');
    await page.click('button:has-text("Add Task")');
    await expect(
      page.locator('app-task-card h4:has-text("Task To Delete")').first()
    ).toBeVisible();

    // Open the task detail modal
    await page.locator('app-task-card:has(h4:has-text("Task To Delete"))').first().click();
    await expect(page.locator('.overlay')).toBeVisible();

    // Accept the confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Click delete
    await page.click('.delete-btn');

    // Modal should close and task should be gone
    await expect(page.locator('.overlay')).not.toBeVisible();
    await expect(page.locator('app-task-card h4:has-text("Task To Delete")')).not.toBeVisible();
  });
});
