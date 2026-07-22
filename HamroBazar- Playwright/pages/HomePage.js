class HomePage {
  constructor(page) {
    this.page = page;
    this.searchBox = page.getByPlaceholder('Search for anything');
    this.trendingSection = page.getByText('Trending', { exact: true }).first();
    this.allCategoriesButton = page.getByText('All Categories');
    this.faqLink = page.getByTestId('utility-bar-faq-link');
    this.signInLink = page.getByRole('link', { name: /Sign in/i });
  }

  async goto() {
    await this.page.goto('/');
  }
}

module.exports = { HomePage };
