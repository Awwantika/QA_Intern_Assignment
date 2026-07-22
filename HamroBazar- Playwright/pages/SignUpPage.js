class SignUpPage {
  constructor(page) {
    this.page = page;
    this.fullNameInput = page.getByTestId('fullName');
    this.phoneInput = page.getByTestId('phoneNumber');
    this.passwordInput = page.getByTestId('password');
    this.termsCheckbox = page.getByText(/I have read and agree/i);
    this.signUpButton = page.getByRole('button', { name: /^Sign up$/i });
  }

  async goto() {
    await this.page.goto('/signup');
  }

  async fillForm({ fullName, phone, password }) {
    await this.fullNameInput.fill(fullName);
    await this.phoneInput.fill(phone);
    await this.passwordInput.fill(password);
  }
}

module.exports = { SignUpPage };
