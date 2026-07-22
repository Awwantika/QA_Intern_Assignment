const { test, expect } = require('@playwright/test');
const { HeaderPage } = require('../pages/HeaderPage');

test.describe('HamroBazar Header', () => {
  test('header shows main navigation links', async ({ page }) => {
    const headerPage = new HeaderPage(page);
    await headerPage.gotoHome();

    await expect(headerPage.homeLink).toBeVisible();
    await expect(headerPage.aboutBoostLink).toBeVisible();
    await expect(headerPage.faqLink).toBeVisible();
    await expect(headerPage.contactLink).toBeVisible();
    await expect(headerPage.signInLink).toBeVisible();
    await expect(headerPage.searchBox).toBeVisible();
  });

  test('opens About boosting page from header', async ({ page }) => {
    const headerPage = new HeaderPage(page);
    await headerPage.gotoHome();

    await headerPage.aboutBoostLink.click();

    await expect(page).toHaveURL(/\/boost/);
  });

  test('opens Contact page from header', async ({ page }) => {
    const headerPage = new HeaderPage(page);
    await headerPage.gotoHome();

    await headerPage.contactLink.click();

    await expect(page).toHaveURL(/\/contact/);
    await expect(page).toHaveTitle(/Contact/i);
  });

  test('Home link returns to homepage', async ({ page }) => {
    const headerPage = new HeaderPage(page);
    await page.goto('/FAQ');
    await headerPage.homeLink.click();

    await expect(page).toHaveURL(/hamrobazaar\.com\/?$/);
  });
});
