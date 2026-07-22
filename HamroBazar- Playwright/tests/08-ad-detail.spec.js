const { test, expect } = require('@playwright/test');
const { AdDetailPage } = require('../pages/AdDetailPage');

test.describe('HamroBazar Ad Detail', () => {
  test('opens an ad listing from homepage', async ({ page }) => {
    const adDetailPage = new AdDetailPage(page);
    await adDetailPage.gotoHome();

    const homeUrl = page.url();
    await adDetailPage.openFirstListing();
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(homeUrl);
  });

  test('ad detail page has a title', async ({ page }) => {
    const adDetailPage = new AdDetailPage(page);
    await adDetailPage.gotoHome();

    await adDetailPage.openFirstListing();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Hamrobazar/i);
  });
});
