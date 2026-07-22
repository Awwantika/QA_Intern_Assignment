class LoginPage {
  constructor(page) {
    this.page = page;
    this.phoneInput = page.getByTestId('phoneNumber');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByRole('button', { name: /Log In/i });
    this.signUpLink = page.getByTestId('auth-signup-link');
    this.forgotPasswordLink = page.getByRole('link', { name: /Forgot password/i });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(phone, password) {
    await this.phoneInput.fill(phone);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
