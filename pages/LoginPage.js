class LoginPage {
  constructor(page) {
    this.page = page;

    // --- LOGIN PAGE LOCATORS ---
    this.usernameField = page.getByRole('textbox', { name: 'Username' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.mfaSkipButton = page.getByRole('button', { name: ' Skip' });

    // Forgot password link
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });

    // --- FORGOT PASSWORD PAGE LOCATORS ---
    this.fpHeader = page.getByRole('heading', { name: 'Forgot your password' });
    this.fpInstruction = page.getByText(
      'Enter your Username to receive Verification Code on your email',
      { exact: false }
    );
    this.fpEmailInput = page.locator('#email');
    this.fpResetPasswordButton = page.getByRole('button', { name: 'Reset my Password' });

    // Back to Sign In (exists on both FP screens)
    this.backToSignInLink = page.getByRole('link', { name: 'Back to Sign In' });

    // --- VERIFICATION PAGE LOCATORS ---
    this.verifyInstruction = page.getByText(
      'Enter the Verification Code sent to your email and new password below',
      { exact: false }
    );
    this.codeField = page.locator('#code');
    this.newPasswordField = page.locator('#password');
    this.confirmPasswordField = page.locator('#confirmpwd');
    this.submitNewPasswordButton = page.getByRole('button', { name: 'Submit' });
  }

  // --- NAVIGATION ---
  async goto() {
    await this.page.goto(process.env.LOGIN_URL);
  }

  // --- LOGIN ---
  async login(username, password) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.signInButton.click();
  }

  // --- MFA SKIP ---
  async skipMfa() {
    await this.page.waitForTimeout(2000);
    await this.mfaSkipButton.click();
    await this.page.waitForTimeout(2000);
  }

  // --- FORGOT PASSWORD ACTIONS ---
  async openForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL('**/forgotpassword');
  }

  async fillForgotPasswordEmail(email) {
    await this.fpEmailInput.fill(email);
  }

  async submitForgotPassword() {
    await this.fpResetPasswordButton.click();
  }

  // --- VERIFICATION PAGE ACTIONS ---
  async fillVerificationCode(code) {
    await this.codeField.fill(code);
  }

  async fillNewPasswords(password) {
    await this.newPasswordField.fill(password);
    await this.confirmPasswordField.fill(password);
  }

  async submitNewPassword() {
    await this.submitNewPasswordButton.click();
  }

  // --- BACK TO LOGIN ---
  async backToSignIn() {
    await this.backToSignInLink.click();
    await this.page.waitForURL('**/login');
  }

  // --- NAVIGATE TO DASHBOARD (using saved session) ---
  async navigateToDashboard() {
    console.log('Navigating to dashboard...');
    await this.page.goto('/dashboard');
    
    // Handle MFA skip if it appears
    try {
      await this.skipMfa();
    } catch (e) {
      console.log('MFA skip not needed or failed');
    }
    
    // Wait for dashboard to load
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
    await this.page.waitForTimeout(2000); // Allow page to stabilize
  }
}

module.exports = { LoginPage };
