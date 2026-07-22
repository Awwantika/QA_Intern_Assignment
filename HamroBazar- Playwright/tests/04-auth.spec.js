const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { LoginPage } = require('../pages/LoginPage');
const { SignUpPage } = require('../pages/SignUpPage');

test.describe('HamroBazar Login / Sign Up', () => {
  test('opens login page from homepage', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.signInLink.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login/i);
  });

  test('login page shows phone and password fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.phoneInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.signUpLink).toBeVisible();
  });

  test('navigates from login to sign up page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.signUpLink.click();

    await expect(page).toHaveURL(/\/signup/);
    await expect(page).toHaveTitle(/Create Account/i);
  });

  test('sign up page shows form and button is disabled when empty', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.goto();

    await expect(signUpPage.fullNameInput).toBeVisible();
    await expect(signUpPage.phoneInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
    await expect(signUpPage.signUpButton).toBeDisabled();
  });

  test('sign up button enables after filling form and accepting terms', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.goto();

    await signUpPage.fillForm({
      fullName: 'Test User',
      phone: '9800000000',
      password: 'TestPass123!',
    });
    await signUpPage.termsCheckbox.click();

    await expect(signUpPage.signUpButton).toBeEnabled();
  });

  test('opens forgot password page from login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.forgotPasswordLink.click();

    await expect(page).toHaveURL(/\/forget-password/);
    await expect(page).toHaveTitle(/Forgot Password/i);
    await expect(page.getByTestId('phoneNumber')).toBeVisible();
  });

  test('attempts login with provided credentials', async ({ page }) => {
    const phone = process.env.HB_PHONE;
    const password = process.env.HB_PASSWORD;
    test.skip(!phone || !password, 'Set HB_PHONE and HB_PASSWORD environment variables');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(phone, password);

    // reCAPTCHA blocks automated login — if still on /login, server did not verify credentials.
    await expect(page).toHaveURL(/\/login/);
  });
});
