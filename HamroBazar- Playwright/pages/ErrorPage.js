const { BasePage } = require('./BasePage');

class ErrorPage extends BasePage {
  constructor(page) {
    super(page);
    this.criticalErrorHeading = page.getByText(/Something went wrong/i);
    this.criticalErrorMessage = page.getByText(/critical error occurred/i);
  }
}

module.exports = { ErrorPage };
