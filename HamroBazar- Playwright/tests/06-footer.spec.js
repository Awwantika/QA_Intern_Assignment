const { test, expect } = require('@playwright/test');
const { FooterPage } = require('../pages/FooterPage');

test.describe('HamroBazar Footer', () => {
  test.beforeEach(async ({ page }) => {
    const footerPage = new FooterPage(page);
    await footerPage.gotoHome();
  });

  test('footer shows important links', async ({ page }) => {
    const footerPage = new FooterPage(page);

    await expect(footerPage.faqLink).toBeVisible();
    await expect(footerPage.termsLink).toBeVisible();
    await expect(footerPage.privacyLink).toBeVisible();
    await expect(footerPage.safetyTipsLink).toBeVisible();
    await expect(footerPage.contactLink).toBeVisible();
  });

  test('opens Terms of Use page', async ({ page }) => {
    const footerPage = new FooterPage(page);
    await footerPage.termsLink.click();

    await expect(page).toHaveURL(/\/terms/);
    await expect(page).toHaveTitle(/Terms/i);
  });

  test('opens Privacy Policy page', async ({ page }) => {
    const footerPage = new FooterPage(page);
    await footerPage.privacyLink.click();

    await expect(page).toHaveURL(/\/privacy-policy/);
    await expect(page).toHaveTitle(/Privacy/i);
  });

  test('opens Safety Tips page', async ({ page }) => {
    const footerPage = new FooterPage(page);
    await footerPage.safetyTipsLink.click();

    await expect(page).toHaveURL(/\/safety-tips/);
    await expect(page).toHaveTitle(/Safety/i);
  });

  test('opens FAQ page from footer', async ({ page }) => {
    const footerPage = new FooterPage(page);
    await footerPage.faqLink.click();

    await expect(page).toHaveURL(/\/FAQ/);
    await expect(page).toHaveTitle(/FAQ/i);
  });
});
