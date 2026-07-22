const { BasePage } = require('./BasePage');

class NavigationPage extends BasePage {
  constructor(page) {
    super(page);
    this.faqLink = page.getByTestId('utility-bar-faq-link');
    this.mobileCategoryLink = page
      .getByRole('link', { name: 'Mobile Phones & Accessories' })
      .first();
  }

  async gotoHome() {
    await this.page.goto('/');
  }

  async openFaq() {
    await this.faqLink.click();
  }

  async openMobileCategory() {
    await this.mobileCategoryLink.click();
  }

  async openAdByName(adName) {
    const adLink = this.page.getByRole('link', { name: adName }).first();
    await adLink.click();
  }
}

module.exports = { NavigationPage };
