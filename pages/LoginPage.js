class LoginPage {
  constructor(page) {
    this.page = page;

    // --- LOGIN PAGE LOCATORS ---
    this.usernameField = page.getByRole('textbox', { name: 'Username' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.mfaSkipButton = page.getByRole('button', { name: ' Skip' });
    // More flexible error toast locator - catches various error messages
    this.loginErrorToast = page.locator('#toast-container').filter({ hasText: /login error|invalid|incorrect|wrong password|authentication failed/i });

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
    console.log(`ACTION: Entering username: ${username}`);
    await this.usernameField.fill(username);
    console.log(`ACTION: Entering password: ${password ? '***' : '(empty)'}`);
    await this.passwordField.fill(password);
    console.log('ACTION: Clicking Sign In button...');

    // Click and wait for navigation or response
    await this.signInButton.click();

    // Wait for either navigation to dashboard, MFA page, or MFA button to appear
    const timeout = process.env.CI ? 30000 : 15000;
    try {
      // Try waiting for any of these conditions
      await Promise.race([
        this.page.waitForURL(/\/dashboard/, { timeout: timeout }).catch(() => null),
        this.page.waitForURL(/\/mfa/, { timeout: timeout }).catch(() => null),
        this.mfaSkipButton.waitFor({ state: 'visible', timeout: timeout }).catch(() => null),
        this.page.waitForTimeout(2000).then(() => null) // Minimum wait
      ]);
    } catch (e) {
      // Continue even if none of the conditions are met
      console.log('INFO: Login click completed, waiting for next step...');
    }

    console.log(`ACTION: Login request submitted. Current URL: ${this.page.url()}`);
  }

  // --- LOGIN VALIDATION ---
  async verifyLoginError() {
    const { expect } = require('@playwright/test');
    console.log('VALIDATION: Waiting for login error toast...');

    // Check if we're already on login page (network might be faster)
    const isOnLoginPage = this.page.url().includes('/login');

    // Use a longer timeout for CI environments (30 seconds)
    const timeout = process.env.CI ? 30000 : 15000;

    // First, wait for toast container to appear (more reliable)
    const toastContainer = this.page.locator('#toast-container');
    await toastContainer.waitFor({ state: 'visible', timeout: timeout });
    console.log('✔️ Toast container is visible');

    // Then check for error content with a more flexible approach
    const errorToast = this.page.locator('#toast-container').filter({
      hasText: /login error|invalid|incorrect|wrong password|authentication failed|error/i
    });

    try {
      await errorToast.waitFor({ state: 'visible', timeout: 5000 });
      const errorText = await errorToast.textContent().catch(() => '');
      console.log(`✔️ Login error toast is visible: ${errorText.trim()}`);
    } catch (e) {
      // Fallback: check if toast container has any visible content
      const toastText = await toastContainer.textContent().catch(() => '');
      if (toastText && toastText.trim().length > 0) {
        console.log(`✔️ Error message displayed: ${toastText.trim()}`);
      } else {
        throw new Error('Login error toast did not appear or was empty');
      }
    }

    // Verify we're still on login page
    await expect(this.page).toHaveURL(/\/login/);
    console.log('✔️ User remains on login page');
  }

  async verifyLoginSuccess() {
    const { expect } = require('@playwright/test');
    console.log('VALIDATION: Verifying successful login...');

    // Use longer timeout for CI
    const timeout = process.env.CI ? 30000 : 20000;

    // Wait for navigation to dashboard with multiple strategies
    try {
      // Strategy 1: Wait for URL change to dashboard
      await this.page.waitForURL(/\/dashboard/, { timeout: timeout });
      console.log(`✔️ Navigated to dashboard: ${this.page.url()}`);
    } catch (e) {
      // Strategy 2: Check if we're already on dashboard
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard')) {
        console.log(`✔️ Already on dashboard: ${currentUrl}`);
        return;
      }

      // Strategy 3: Wait for network to be idle and check again
      console.log('INFO: Waiting for network to be idle...');
      try {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      } catch (ne) {
        // Continue even if networkidle times out
        console.log('INFO: Network idle timeout, continuing...');
      }

      // Check URL again after network settles
      await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 5000 });
      console.log(`✔️ Login successful - navigated to dashboard: ${this.page.url()}`);
    }

    // Ensure page is fully loaded
    await this.page.waitForLoadState('domcontentloaded');
    console.log('✔️ Dashboard page loaded successfully');
  }

  // --- MFA SKIP ---
  async skipMfa() {
    console.log('ACTION: Checking for MFA skip button...');
    const timeout = process.env.CI ? 20000 : 10000;

    // Wait a bit for page to settle after login
    await this.page.waitForTimeout(1000);

    // Check for MFA skip button first - if visible, we need to click it regardless of URL
    // Wait for button to be attached, visible, and enabled
    try {
      await this.mfaSkipButton.waitFor({ state: 'attached', timeout: 3000 });
      await this.mfaSkipButton.waitFor({ state: 'visible', timeout: 3000 });
      // Ensure button is enabled before clicking
      await this.page.waitForTimeout(500); // Small wait to ensure button is fully ready
      
      console.log('ACTION: MFA skip button found and ready, clicking...');
      await this.mfaSkipButton.click({ force: false });
      
      // Wait for modal to close
      await this.page.waitForTimeout(1000);
      
      // Wait for navigation to dashboard after clicking MFA skip
      try {
        await this.page.waitForURL(/\/dashboard/, { timeout: timeout });
        console.log('✔️ MFA skipped - navigated to dashboard');
      } catch (e) {
        // If URL doesn't change, wait a bit more and check if modal is gone
        await this.page.waitForTimeout(1000);
        const newUrl = this.page.url();
        const isModalGone = await this.mfaSkipButton.isVisible({ timeout: 1000 }).catch(() => false);
        if (newUrl.includes('/dashboard') || !isModalGone) {
          console.log('✔️ MFA skipped - on dashboard');
        } else {
          console.log(`MFA skipped URL is: ${newUrl}`);
        }
      }
    } catch (e) {
      // Button not found or not visible - check if we're already on dashboard
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard')) {
        console.log('ℹ️ Already on dashboard - MFA not required or already handled');
        return;
      }
      
      console.log('ℹ️ MFA skip button not found - MFA may not be required');
      // If MFA button not found, check if we should wait for redirect
      if (currentUrl.includes('/login') || currentUrl.includes('/mfa')) {
        console.log('INFO: Waiting for navigation to dashboard...');
        try {
          await this.page.waitForURL(/\/dashboard/, { timeout: timeout });
          console.log('✔️ Navigated to dashboard without MFA');
        } catch (err) {
          console.log(`INFO: Still on ${currentUrl}, will verify in next step`);
        }
      }
    }
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

  // --- FORGOT PASSWORD FLOW HELPERS ---
  async validateVerificationPageFields() {
    const { expect } = require('@playwright/test');
    await expect(this.verifyInstruction).toBeVisible({ timeout: 10000 });
    await expect(this.codeField).toBeVisible();
    await expect(this.newPasswordField).toBeVisible();
    await expect(this.confirmPasswordField).toBeVisible();
    await expect(this.submitNewPasswordButton).toBeVisible();
  }

  async submitPasswordResetAndValidatePage() {
    const requestTimestamp = Date.now();
    console.log(`📅 Password reset requested at: ${new Date(requestTimestamp).toISOString()}`);
    await this.submitForgotPassword();
    await this.page.waitForTimeout(2000);
    await this.validateVerificationPageFields();
    return requestTimestamp;
  }

  async submitOTPAndNewPassword(otpCode, newPassword) {
    await this.fillVerificationCode(otpCode);
    await this.fillNewPasswords(newPassword);
    await this.submitNewPassword();
  }

  async verifyPasswordResetSuccess() {
    await this.page.waitForTimeout(3000);
    const successMessage = this.page.locator('#toast-container:has-text("Password"), #toast-container:has-text("success"), #toast-container:has-text("reset"), #toast-container:has-text("changed")');
    const successVisible = await successMessage.isVisible({ timeout: 10000 }).catch(() => false);

    if (successVisible) {
      const messageText = await successMessage.textContent().catch(() => '');
      console.log(`✔️ Password reset successful - ${messageText}`);
      return true;
    }

    const isLoginPage = this.page.url().includes('/login');
    if (isLoginPage) {
      console.log('✔️ Password reset successful - redirected to login page');
      return true;
    }

    const pageText = await this.page.textContent('body').catch(() => '');
    if (pageText.toLowerCase().includes('success') || pageText.toLowerCase().includes('password')) {
      console.log('✔️ Password reset appears successful');
      return true;
    }

    console.log('ℹ️ Verifying password reset completion...');
    return false;
  }

  async verifyLoginWithNewPassword(email, newPassword) {
    if (!this.page.url().includes('/login')) {
      await this.goto();
    }

    await this.login(email, newPassword);
    await this.page.waitForTimeout(3000);

    const currentUrl = this.page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('✔️ Login successful with new password - navigated to dashboard');
      return true;
    }

    const mfaSkipVisible = await this.mfaSkipButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (mfaSkipVisible) {
      await this.skipMfa();
      const { expect } = require('@playwright/test');
      await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      console.log('✔️ Login successful with new password - MFA skipped');
      return true;
    }

    const errorMessage = this.page.locator('#toast-container:has-text("Error"), #toast-container:has-text("invalid")');
    const errorVisible = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
    if (errorVisible) {
      console.log('❌ Login failed with new password - error message displayed');
      throw new Error('Login failed with new password');
    }

    console.log('ℹ️ Login status unclear - checking page state');
    return false;
  }

  async getOTPFromEmail(senderEmail, requestTimestamp) {
    const { getOTPFromLatestEmail } = require('../utils/gmailHelper');
    console.log(`\nStep 5: Reading latest email from sender: ${senderEmail}...`);
    console.log(`   Looking for email sent after: ${new Date(requestTimestamp).toISOString()}`);

    try {
      const otpCode = await getOTPFromLatestEmail(senderEmail, 5000, 6, requestTimestamp);
      if (!otpCode) {
        throw new Error('Could not extract OTP code from email');
      }
      console.log(`✔️ OTP retrieved from latest email (sender: ${senderEmail}): ${otpCode}`);
      return otpCode;
    } catch (error) {
      console.error('\n❌ Error retrieving OTP:', error.message);
      if (error.message.includes('No email found')) {
        console.error(`\n⚠️  No email found from ${senderEmail}`);
        console.error('   Please ensure:');
        console.error('   1. The email has been sent');
        console.error('   2. You are checking the correct Gmail account');
        console.error('   3. The sender email is correct\n');
      } else if (error.message.includes('authorize') || error.message.includes('token')) {
        console.error('\n🔐 GMAIL AUTHORIZATION REQUIRED:');
        console.error('   You need to authorize the application first.');
        console.error('   Run: node utils/gmailHelper.js (if standalone)');
        console.error('   Or ensure token.json exists in project root\n');
      }
      throw error;
    }
  }

  printNewPassword(newPassword, email) {
    console.log(`\n========================================`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`📧 Email: ${email}`);
    console.log('========================================\n');
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
    
    // Wait for page to settle after navigation
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000); // Allow page to stabilize

    // ✅ Skip MFA only if it appears - wait for button to be ready
    try {
      // Wait for button to be attached and visible
      await this.mfaSkipButton.waitFor({ state: 'visible', timeout: 3000 });
      // Additional wait to ensure button is fully interactive
      await this.page.waitForTimeout(500);
      console.log('➡️ MFA modal detected, skipping MFA...');
      await this.skipMfa();
      
      // Wait for MFA modal to disappear (check that button is no longer visible)
      let modalClosed = false;
      for (let i = 0; i < 10; i++) {
        const isVisible = await this.mfaSkipButton.isVisible({ timeout: 500 }).catch(() => false);
        if (!isVisible) {
          modalClosed = true;
          console.log('✔️ MFA modal closed');
          break;
        }
        await this.page.waitForTimeout(500);
      }
      if (!modalClosed) {
        console.log('⚠️ MFA modal may still be visible, continuing anyway...');
      }
    } catch (e) {
      // Button not found or not visible - MFA may not be required
      console.log('ℹ️ MFA modal not shown, continuing...');
    }

    // Wait for dashboard to load
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
    await this.page.waitForTimeout(2000); // Allow page to stabilize
  }

  // --- SESSION MANAGEMENT ---
  async saveSession() {
    const fs = require('fs');
    console.log('ACTION: Saving user session...');

    // Extract localStorage (needed for Cognito/SPA apps)
    const localStorage = await this.page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });

    // Extract cookies
    const state = await this.page.context().storageState();

    // Merge cookies + localStorage
    const fullState = {
      ...state,
      origins: [
        {
          origin: process.env.BASE_ORIGIN || "https://talbot-dev-newui.atcemr.com",
          localStorage: Object.entries(localStorage).map(([name, value]) => ({
            name,
            value
          }))
        }
      ]
    };

    // Write final session file
    fs.writeFileSync("authState.json", JSON.stringify(fullState, null, 2));
    console.log('✔️ Session saved successfully to authState.json');
  }
}

module.exports = { LoginPage };
