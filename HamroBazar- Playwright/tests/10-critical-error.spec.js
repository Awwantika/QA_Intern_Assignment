const { test, expect } = require('@playwright/test');
const { ErrorPage } = require('../pages/ErrorPage');

const KEY_PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'Contact', path: '/contact' },
  { name: 'FAQ', path: '/FAQ' },
  { name: 'Login', path: '/login' },
  { name: 'Sign up', path: '/signup' },
  { name: 'Boost', path: '/boost' },
  { name: 'Chat', path: '/chat' },
  { name: 'Terms', path: '/terms' },
  { name: 'Privacy', path: '/privacy-policy' },
  { name: 'Safety Tips', path: '/safety-tips' },
];

test.describe('HamroBazar Critical Error Page', () => {
  for (const { name, path } of KEY_PAGES) {
    test(`${name} does not show critical error page`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle', timeout: 60000 });

      const errorPage = new ErrorPage(page);
      await expect(errorPage.criticalErrorHeading).toBeHidden();
      await expect(errorPage.criticalErrorMessage).toBeHidden();
    });
  }

  test('ad detail page does not show critical error', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const detailLink = page.locator('a[href*="/detail/"]').first();
    await detailLink.waitFor({ state: 'visible', timeout: 15000 });
    await detailLink.click();
    await page.waitForLoadState('networkidle');

    const errorPage = new ErrorPage(page);
    await expect(errorPage.criticalErrorHeading).toBeHidden();
    await expect(errorPage.criticalErrorMessage).toBeHidden();
  });
});
