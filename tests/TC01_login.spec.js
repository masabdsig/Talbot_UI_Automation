// Load environment variables from .env file
require('dotenv').config();

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { faker } = require('@faker-js/faker');

const username = faker.internet.email();
const password = faker.internet.password();
const validUsername = process.env.LOGIN_USERNAME;
const validPassword = process.env.LOGIN_PASSWORD;

test.describe('Login scenarios', () => {

    test('TC01 - User cannot login with invalid username and password', async ({ page }) => {
        const login = new LoginPage(page);
        await login.goto();
        await login.login(username, password);
        await page.locator('#toast-container:has-text("Login Error!!")').waitFor({ state: 'visible' });
        expect(page.url()).toContain('/login');
    });

    test('TC02 - Login fails with valid username and wrong password', async ({ page }) => {
        const login = new LoginPage(page);
        await login.goto();
        await login.login(validUsername, password);
        await page.locator('#toast-container:has-text("Login Error!!")').waitFor({ state: 'visible' });
        expect(page.url()).toContain('/login');
    });

    test('TC03 - Login succeeds with valid credentials and user session is saved', async ({ page }) => {
        const login = new LoginPage(page);
        await login.goto();
        await login.login(validUsername, validPassword);
        await login.skipMfa();
        expect(page.url()).toContain('/dashboard');
    });

    test.only('TC04 - Check Forgot Password Flow', async ({ page }) => {
        const login = new LoginPage(page);
        const testEmail = process.env.TEST_EMAIL || 'test@example.com';
        const senderEmail = process.env.SENDER_EMAIL || 'admin@example.com';
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