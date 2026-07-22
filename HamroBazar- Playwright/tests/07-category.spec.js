const { test, expect } = require('@playwright/test');
const { CategoryPage } = require('../pages/CategoryPage');

test.describe('HamroBazar Categories', () => {
  test('opens Mobile Phones category', async ({ page }) => {
    const categoryPage = new CategoryPage(page);
    await categoryPage.gotoHome();
    await categoryPage.openMobileCategory();

    await expect(page).toHaveURL(/\/category\/mobile-phones-accessories/);
  });

  test('opens Real Estate category', async ({ page }) => {
    const categoryPage = new CategoryPage(page);
    await categoryPage.gotoHome();
    await categoryPage.openRealEstateCategory();

    await expect(page).toHaveURL(/\/category\/.*real-estate/i);
  });

  test('opens Electronics category', async ({ page }) => {
    const categoryPage = new CategoryPage(page);
    await categoryPage.gotoHome();
    await categoryPage.openElectronicsCategory();

    await expect(page).toHaveURL(/\/category\/.*electronic/i);
  });

  test('category page shows listing content', async ({ page }) => {
    const categoryPage = new CategoryPage(page);
    await categoryPage.gotoHome();
    await categoryPage.openMobileCategory();

    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.getByRole('link').first()).toBeVisible();
  });
});
