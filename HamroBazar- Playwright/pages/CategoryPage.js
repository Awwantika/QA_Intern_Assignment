const { BasePage } = require('./BasePage');

class CategoryPage extends BasePage {
  constructor(page) {
    super(page);
    this.mobileCategoryLink = page
      .getByRole('link', { name: 'Mobile Phones & Accessories' })
      .first();
    this.realEstateLink = page.getByRole('link', { name: 'Real Estate' }).first();
    this.electronicsLink = page
      .getByRole('link', { name: 'Electronics, TVs, & More' })
      .first();
  }

  async gotoHome() {
    await this.page.goto('/');
  }

  async openMobileCategory() {
    await this.mobileCategoryLink.click();
  }

  async openRealEstateCategory() {
    await this.realEstateLink.click();
  }

  async openElectronicsCategory() {
    await this.electronicsLink.click();
  }
}

module.exports = { CategoryPage };
