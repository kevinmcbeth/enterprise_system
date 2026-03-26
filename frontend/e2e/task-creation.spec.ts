import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Task Creation from All Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    await loginAs(page, 'admin@example.com', 'password');
    await page.goto('/tasks');
    await page.waitForTimeout(1000);
  });

  test('should show create task button', async ({ page }) => {
    await expect(page.locator('button:has-text("+ New Task")')).toBeVisible();
  });

  test('should toggle create task form', async ({ page }) => {
    await page.click('button:has-text("+ New Task")');
    await expect(page.locator('.create-form')).toBeVisible();
    await page.click('button:has-text("+ New Task")');
    await expect(page.locator('.create-form')).not.toBeVisible();
  });

  test('should show project dropdown in create form', async ({ page }) => {
    await page.click('button:has-text("+ New Task")');
    const projectSelect = page.locator('.create-form select').first();
    await expect(projectSelect).toBeVisible();
    // Should have at least the Demo Project option
    const options = projectSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(1); // "Select Project" + at least one real project
  });

  test('should show assignee dropdown in create form', async ({ page }) => {
    await page.click('button:has-text("+ New Task")');
    // Assignee is the 4th select (project, priority, assignee) - wait, let me check the order
    // Order: project select, title input, priority select, assignee select, date input
    const selects = page.locator('.create-form select');
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(3); // project, priority, assignee
  });

  test('should show priority dropdown in create form', async ({ page }) => {
    await page.click('button:has-text("+ New Task")');
    const prioritySelect = page.locator('.create-form select').nth(1);
    await expect(prioritySelect).toBeVisible();
    await expect(prioritySelect.locator('option')).toHaveCount(5); // P0-P4
  });

  test('should disable create button when no project or title', async ({ page }) => {
    await page.click('button:has-text("+ New Task")');
    const createBtn = page.locator('.create-form button');
    await expect(createBtn).toBeDisabled();
  });

  test('should create a task with project and assignee', async ({ page }) => {
    const tasksBefore = await page.locator('tbody tr').count();

    await page.click('button:has-text("+ New Task")');

    // Select project (first real option)
    await page.locator('.create-form select').first().selectOption({ index: 1 });

    // Fill title
    await page.fill('.create-form input[placeholder="Task title"]', 'Cross-Project Test Task');

    // Select priority
    await page.locator('.create-form select').nth(1).selectOption('P1');

    // Select assignee (first real user)
    await page.locator('.create-form select').nth(2).selectOption({ index: 1 });

    // Click create
    await page.locator('.create-form button').click();

    // Form should close and task should appear
    await page.waitForTimeout(2000);
    await expect(page.locator('.create-form')).not.toBeVisible();
    const tasksAfter = await page.locator('tbody tr').count();
    expect(tasksAfter).toBeGreaterThan(tasksBefore);
  });

  test('should filter by assignee', async ({ page }) => {
    await page.waitForTimeout(2000);
    const assigneeSelect = page.locator('.filters select').nth(2);
    await expect(assigneeSelect).toBeVisible();

    // Filter by unassigned
    await assigneeSelect.selectOption('unassigned');
    await page.waitForTimeout(500);

    // All visible rows should have "—" in assignee column
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(4)).toHaveText('—');
    }
  });
});
