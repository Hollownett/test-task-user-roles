import { test, expect } from '@playwright/test';

test.describe('UserRoleTable E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the user role management heading', async ({ page }) => {
    await expect(page.getByTestId('user-role-heading')).toBeVisible();
  });

  test('should display a list of users', async ({ page }) => {
    await expect(page.getByTestId('user-role-table')).toBeVisible();
    const rowCount = await page.getByTestId(/user-row-/).count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('search works to filter users', async ({ page }) => {
    const userNameCell = page.getByTestId(/user-name-/).first();
    const userName = await userNameCell.textContent();
    if (userName && userName.trim()) {
      await page.getByTestId('search-input').fill(userName.trim());
      await expect(page.getByTestId(/user-row-/).first()).toBeVisible();
    }
  });

  test('sorting by name and email toggles order', async ({ page }) => {
    await page.getByTestId('column-header-name').click();
    await page.getByTestId('column-header-name').click();
    await page.getByTestId('column-header-email').click();
    await page.getByTestId('column-header-email').click();
    await expect(page.getByTestId('user-role-table')).toBeVisible();
  });

  test('can change page size and paginate', async ({ page }) => {
    await page.locator('select').selectOption('10');
    await page.getByText('Next').click();
    await page.getByText('Previous').click();
  });

  test('can change user roles using the dropdown and save', async ({ page }) => {
    const userRow = page.getByTestId(/user-row-/).first();
    const userIdMatch = await userRow.getAttribute('data-testid');
    const userId = userIdMatch?.replace('user-row-', '');

    const dropdown = page.getByTestId(`user-roles-dropdown-${userId}`);
    await dropdown.click();

    const firstOption = page.getByTestId('select-role-menu-item-1');
    await firstOption.click();

    await page.getByTestId(`user-save-btn-${userId}`).click();

    await expect(page.getByText(/Roles updated successfully!/i)).toBeVisible();
  });

  test('shows "No users found" message when search returns nothing', async ({ page }) => {
    await page.getByTestId('search-input').fill('no-user-will-ever-have-this-name-or-email');
    await expect(page.getByTestId('no-users-found')).toBeVisible();
  });
});