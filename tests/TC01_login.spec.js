const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
import { faker } from '@faker-js/faker';


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

    test('TC04 - Check Forgot Password Flow', async ({ page }) => {
        const login = new LoginPage(page);

        // 1️⃣ Navigate to Login page
        await login.goto();

        // 2️⃣ Click "Forgot password?"
        await login.openForgotPassword();

        // 3️⃣ Validate Forgot Password page content
        await expect(login.fpHeader).toBeVisible();
        await expect(login.fpInstruction).toBeVisible();

        // 4️⃣ Enter email using faker
        const randomEmail = faker.internet.email();
        await login.fillForgotPasswordEmail(randomEmail);
        console.log(`✔️ Entered email: ${randomEmail}`);

        // 5️⃣ Submit forgot password request
        await login.submitForgotPassword();

        // 6️⃣ Validate Verification Code page UI
        await expect(login.verifyInstruction).toBeVisible();
        await expect(login.codeField).toBeVisible();
        await expect(login.newPasswordField).toBeVisible();
        await expect(login.confirmPasswordField).toBeVisible();
        await expect(login.submitNewPasswordButton).toBeVisible();
        console.log('✔️ Verification Code page loaded');

        // 7️⃣ Click "Back to Sign In"
        await login.backToSignIn();

        // 8️⃣ Validate user returned to login page
        await expect(page).toHaveURL(/\/login/);
        console.log('✔️ Returned to Login page successfully');
    });

});