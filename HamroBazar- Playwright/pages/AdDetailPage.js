const { BasePage } = require('./BasePage');

class AdDetailPage extends BasePage {
  constructor(page) {
    super(page);
    this.listingLinks = page.locator(
      'a[href*="/detail/"], a[href*="/product/"], a[href*="/ad/"]'
    );
  }

  async gotoHome() {
    await this.page.goto('/');
  }

  async openFirstListing() {
    const selectors = [
      'a[href*="/detail/"]',
      'a[href*="/product/"]',
      'a[href*="/ad/"]',
      'main a[href^="/"][href*="-"]',
    ];

    for (const selector of selectors) {
      const link = this.page.locator(selector).first();
      if ((await link.count()) > 0 && (await link.isVisible())) {
        await link.click();
        return;
      }
    }

    const trendingLink = this.page
      .getByRole('link')
      .filter({ hasNotText: /Home|FAQ|Contact|Sign in|About|Worldcup|Saved|Alerts|Post|Boost/i })
      .first();
    await trendingLink.click();
  }
}

module.exports = { AdDetailPage };
