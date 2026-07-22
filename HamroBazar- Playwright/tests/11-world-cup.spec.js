const { test, expect } = require('@playwright/test');

test.describe('HamroBazar Hamro World Cup', () => {
  test('World Cup links are visible on homepage and open campaign page', async ({ page }) => {
    await page.goto('/');

    const utilityWorldCupLink = page.getByRole('link', { name: /Hamro World Cup/i }).first();
    await expect(utilityWorldCupLink).toBeVisible();

    await utilityWorldCupLink.click();
    await expect(page).toHaveURL(/\/campaign/);
    await expect(page).toHaveTitle(/Hamrobazar/i);
  });

  test('Homepage campaign banner points to campaign route', async ({ page }) => {
    await page.goto('/');

    const campaignBanner = page
      .getByRole('link', { name: /Hamro World Cup.*campaign/i })
      .first();

    await expect(campaignBanner).toBeVisible();
    await expect(campaignBanner).toHaveAttribute('href', /\/campaign/);
  });
});
