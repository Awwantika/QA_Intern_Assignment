class SearchPage {
  constructor(page) {
    this.page = page;
    this.searchBox = page.getByTestId('search-product-input');
    this.searchButton = page.getByRole('button', { name: /search/i }).first();
    this.suggestionsLabel = page.getByText('Suggestions', { exact: true });
    this.suggestionOptions = page.getByRole('option');
  }

  async goto() {
    await this.page.goto('/');
  }

  async enterSearchQuery(query) {
    // On dynamic home page renders, first fill can get reset by hydration.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await this.searchBox.click();
      await this.searchBox.fill('');
      await this.searchBox.type(query, { delay: 40 });

      if ((await this.searchBox.inputValue()) === query) {
        return;
      }

      await this.page.waitForTimeout(400);
    }

    throw new Error(`Unable to keep search input value for query: ${query}`);
  }

  async search(query) {
    await this.enterSearchQuery(query);
    const beforeUrl = this.page.url();
    await this.searchBox.press('Enter');
    await this.page.waitForTimeout(1200);

    // Enter key does not always trigger navigation on the live site.
    if (this.page.url() === beforeUrl) {
      await this.searchButton.click();
    }
  }
}

module.exports = { SearchPage };
