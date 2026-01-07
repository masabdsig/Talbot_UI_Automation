// Load environment variables from .env and .env.local files
// Priority order (highest to lowest):
// 1. Environment variables set directly (e.g., GitHub Actions secrets)
// 2. .env.local (for local development - gitignored)
// 3. .env (for CI/shared config)
// Note: dotenv.config() silently fails if file doesn't exist, so this works in both CI and local
require('dotenv').config(); // Load .env (used in CI)
require('dotenv').config({ path: '.env.local' }); // Load .env.local (local only, gitignored)

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { faker } = require('@faker-js/faker');

const username = faker.internet.email();
const password = faker.internet.password();
const validUsername = process.env.LOGIN_USERNAME;
const validPassword = process.env.LOGIN_PASSWORD;

test.describe('Login scenarios', () => {

    test('TC01 - User cannot login with invalid username and password', async ({ page }) => {
        console.log('\n=== TC01: Testing login with invalid credentials ===');
        const login = new LoginPage(page);
        
        console.log('Step 1: Navigating to login page...');
        await login.goto();
        console.log('✔️ Login page loaded');
        
        console.log('\nStep 2: Attempting login with invalid credentials...');
        await login.login(username, password);
        
        console.log('\nStep 3: Verifying login error is displayed...');
        await login.verifyLoginError();
        
        console.log('\n✔️ TC01 completed: User cannot login with invalid credentials');
    });

    test('TC02 - Login fails with valid username and wrong password', async ({ page }) => {
        console.log('\n=== TC02: Testing login with valid username and wrong password ===');
        const login = new LoginPage(page);
        
        console.log('Step 1: Navigating to login page...');
        await login.goto();
        console.log('✔️ Login page loaded');
        
        console.log('\nStep 2: Attempting login with valid username and wrong password...');
        await login.login(validUsername, password);
        
        console.log('\nStep 3: Verifying login error is displayed...');
        await login.verifyLoginError();
        
        console.log('\n✔️ TC02 completed: Login fails with valid username and wrong password');
    });

    test('TC03 - Login succeeds with valid credentials and user session is saved', async ({ page }) => {
        console.log('\n=== TC03: Testing successful login with valid credentials ===');
        const login = new LoginPage(page);
        
        console.log('Step 1: Navigating to login page...');
        await login.goto();
        console.log('✔️ Login page loaded');
        
        console.log('\nStep 2: Attempting login with valid credentials...');
        await login.login(validUsername, validPassword);
        
        console.log('\nStep 3: Handling MFA if present...');
        await login.skipMfa();
        
        console.log('\nStep 4: Verifying successful login...');
        await login.verifyLoginSuccess();
        
        console.log('\nStep 5: Saving user session...');
        await login.saveSession();
        
        console.log('\n✔️ TC03 completed: Login successful with valid credentials and session saved');
    });

    test('TC04 - Check Forgot Password Flow', async ({ page }) => {
        const login = new LoginPage(page);
        const testEmail = process.env.TEST_EMAIL || 'mishrasum2022@gmail.com';
        const senderEmail = process.env.SENDER_EMAIL || 'admin@atcemr.com';
        const newPassword = faker.internet.password({ length: 12, memorable: false }) + '@123';
        
        console.log('\n========================================');
        console.log(`📝 Generated New Password: ${newPassword}`);
        console.log('========================================\n');

        // Step 1: Go to login page
        console.log('Step 1: Navigating to login page...');
        await login.goto();
        console.log('✔️ Login page loaded');

        // Step 2: Click on forget password and navigate to forget password page
        console.log('\nStep 2: Clicking on "Forgot password?" link...');
        await login.openForgotPassword();
        await expect(page).toHaveURL(/\/forgotpassword/);
        console.log('✔️ Navigated to forgot password page');

        // Step 3: Fill email address
        console.log('\nStep 3: Filling email address...');
        await login.fillForgotPasswordEmail(testEmail);
        console.log(`✔️ Entered email: ${testEmail}`);

        // Step 4: Submit password reset and validate verification page
        console.log('\nStep 4: Clicking "Reset my Password" button...');
        const requestTimestamp = await login.submitPasswordResetAndValidatePage();
        console.log('✔️ Verification Code page loaded with all required fields');

        // Step 5: Get OTP from latest email
        const otpCode = await login.getOTPFromEmail(senderEmail, requestTimestamp);

        // Step 6: Submit OTP and new password, validate success
        console.log('\nStep 6: Submitting OTP and new password...');
        await login.submitOTPAndNewPassword(otpCode, newPassword);
        console.log(`✔️ Entered OTP code: ${otpCode}`);
        console.log(`✔️ Entered new password: ${newPassword}`);
        console.log('✔️ Submitted new password');
        await login.verifyPasswordResetSuccess();

        // Step 7: Print new password and verify login
        console.log('\nStep 7: Testing login with new password...');
        login.printNewPassword(newPassword, testEmail);
        await login.verifyLoginWithNewPassword(testEmail, newPassword);

        console.log('\n✔️ Forgot Password Flow completed successfully');
        console.log(`✔️ New password verified: ${newPassword}`);
    });
});