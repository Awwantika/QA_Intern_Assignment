const { BasePage } = require('./BasePage');

class FooterPage extends BasePage {
  constructor(page) {
    super(page);
    this.faqLink = page.getByTestId('footer-link-faq');
    this.termsLink = page.getByRole('link', { name: 'Terms of Use' });
    this.privacyLink = page.getByRole('link', { name: 'Privacy Policy' });
    this.safetyTipsLink = page.getByRole('link', { name: 'Safety Tips' });
    this.contactLink = page.getByTestId('footer-link-contact-us');
  }

  async gotoHome() {
    await this.page.goto('/');
  }
}

module.exports = { FooterPage };
