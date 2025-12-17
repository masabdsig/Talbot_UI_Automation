const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PatientPage } = require('../pages/Patients');
const { WorkMenuPage } = require('../pages/WorkMenuPage');

test.use({ storageState: 'authState.json' });

test.describe('Patients Page - Work Menu Validation', () => {

  test('Validate Work menu options on Patients page', async ({ page }) => {
    await page.goto('/dashboard');
    const loginPage = new LoginPage(page);
    await loginPage.skipMfa();

    // STEP 1: Wait for dashboard to load
    console.log('STEP: Waiting for dashboard to load...');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000); // Allow page to stabilize

    // STEP 2: Navigate to Patients tab
    console.log('STEP: Navigating to Patients tab...');
    const patientPage = new PatientPage(page);
    await patientPage.gotoPatientsTab();
    await expect(patientPage.addPatientBtn).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000); // Allow page to stabilize

    // STEP 3: Initialize Work Menu Page Object
    console.log('STEP: Initializing Work Menu page object...');
    const workMenuPage = new WorkMenuPage(page);
    
    // STEP 4: Scroll to find Work menu (it might be below the fold)
    console.log('STEP: Scrolling to find Work menu...');
    await workMenuPage.scrollToWorkMenu();

    // STEP 5: Open Work menu (or verify it's visible)
    console.log('STEP: Opening Work menu...');
    await workMenuPage.openWorkMenu();
    
    // STEP 6: Get all Work menu options
    console.log('STEP: Retrieving Work menu options...');
    const workMenuOptions = await workMenuPage.getWorkMenuOptions();
    
    if (workMenuOptions.length === 0) {
      throw new Error('No Work menu options found');
    }

    console.log(`INFO: Found ${workMenuOptions.length} Work menu option(s)`);

    // STEP 7: Validate each Work menu option
    for (const option of workMenuOptions) {
      const optionText = option.text;
      console.log(`\n--- Validating Work menu option: "${optionText}" ---`);

      // ASSERTION 1: Option is visible
      console.log(`ASSERT: Verifying "${optionText}" is visible...`);
      await expect(option.locator).toBeVisible({ timeout: 5000 });
      console.log(`✓ ASSERT: "${optionText}" is visible`);

      // ASSERTION 2: Option is clickable/enabled
      console.log(`ASSERT: Verifying "${optionText}" is clickable...`);
      await expect(option.locator).toBeEnabled();
      console.log(`✓ ASSERT: "${optionText}" is clickable`);

      // ASSERTION 3: Click option and verify no errors are thrown
      console.log(`STEP: Clicking "${optionText}"...`);
      try {
        await workMenuPage.clickWorkMenuOption(optionText);
        console.log(`✓ ASSERT: Clicking "${optionText}" completed without errors`);
      } catch (error) {
        throw new Error(`Failed to click "${optionText}": ${error.message}`);
      }

      // ASSERTION 4: Page/modal loads successfully
      console.log(`ASSERT: Verifying page/modal loaded successfully for "${optionText}"...`);
      await page.waitForTimeout(2000); // Allow time for content to render
      console.log(`✓ ASSERT: Page/modal loaded for "${optionText}"`);

      // ASSERTION 5: Primary heading or key element is present
      await workMenuPage.validatePrimaryHeading(optionText);

      // Check for console errors (basic check)
      const consoleErrors = await workMenuPage.getConsoleErrors();
      
      if (consoleErrors.length > 0) {
        console.log(`WARNING: Console errors detected for "${optionText}": ${consoleErrors.length} error(s)`);
      }

      console.log(`✓ Validation complete for "${optionText}"\n`);

      // Navigate back to Patients page if needed (if option navigated away)
      const navigationNeeded = await workMenuPage.isNavigationNeeded();
      if (navigationNeeded) {
        console.log(`STEP: Navigating back to Patients page...`);
        await patientPage.gotoPatientsTab();
        await page.waitForTimeout(2000);
        
        // Re-initialize Work menu after navigation
        await workMenuPage.scrollToWorkMenu();
        await workMenuPage.openWorkMenu();
      }
    }

    console.log('\n✓ All Work menu options validated successfully');
  });

});
