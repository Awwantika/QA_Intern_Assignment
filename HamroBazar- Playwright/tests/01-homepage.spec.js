const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');

test.describe('HamroBazar Homepage', () => {
  test('loads the homepage with correct title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(page).toHaveTitle(/Hamrobazar/i);
    await expect(page).toHaveURL(/hamrobazaar\.com/);
  });

  test('shows main sections and navigation links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(homePage.trendingSection).toBeVisible();
    await expect(homePage.allCategoriesButton).toBeVisible();
    await expect(homePage.faqLink).toBeVisible();
    await expect(homePage.signInLink).toBeVisible();
  });

  test('shows the search box', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(homePage.searchBox).toBeVisible();
    await expect(homePage.searchBox).toBeEditable();
  });
});
