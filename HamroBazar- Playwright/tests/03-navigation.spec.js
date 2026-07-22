const { test, expect } = require('@playwright/test');
const { NavigationPage } = require('../pages/NavigationPage');

test.describe('HamroBazar Navigation', () => {
  test('opens FAQ page from header', async ({ page }) => {
    const navigationPage = new NavigationPage(page);
    await navigationPage.gotoHome();
    await navigationPage.openFaq();

    await expect(page).toHaveURL(/\/FAQ/);
    await expect(page).toHaveTitle(/FAQ/i);
  });

  test('opens a category page', async ({ page }) => {
    const navigationPage = new NavigationPage(page);
    await navigationPage.gotoHome();
    await navigationPage.openMobileCategory();

    await expect(page).toHaveURL(/\/category\/mobile-phones-accessories/);
  });

  test('opens an ad listing from homepage', async ({ page }) => {
    const navigationPage = new NavigationPage(page);
    await navigationPage.gotoHome();

    const detailLink = page.locator('a[href*="/detail/"]').first();
    await expect(detailLink).toBeVisible();
    await detailLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/detail\//);
  });
});
