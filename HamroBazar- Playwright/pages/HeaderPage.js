const { BasePage } = require('./BasePage');

class HeaderPage extends BasePage {
  constructor(page) {
    super(page);
    this.homeLink = page.getByTestId('utility-bar-home-link');
    this.aboutBoostLink = page.getByRole('link', { name: 'About boosting' });
    this.faqLink = page.getByTestId('utility-bar-faq-link');
    this.contactLink = page.getByTestId('utility-bar-contact-link');
    this.signInLink = page.getByRole('link', { name: /Sign in/i });
    this.searchBox = page.getByTestId('search-product-input');
  }

  async gotoHome() {
    await this.page.goto('/');
  }
}

module.exports = { HeaderPage };
