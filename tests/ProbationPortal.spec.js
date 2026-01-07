const { test, expect } = require('@playwright/test');
const { ProbationPortalPage } = require('../pages/ProbationPortal');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

test.describe('Probation Portal Navigation and Default State', () => {
  test.use({ storageState: 'authState.json' });

  test.beforeEach(async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);
    
    // Navigate to Dashboard
    await probationPortal.navigateToDashboard();
    
    // Skip MFA if visible
    await expect(probationPortal.skipMfaButton).toBeVisible({ timeout: 10000 });
    await probationPortal.skipMfa();
    
    // Navigate to Portal Requests page via UI (using Quick Menu)
    await probationPortal.navigateToPortalRequestsViaUI();
    await probationPortal.waitForPortalRequestsGridToLoad();
    console.log('✔️ Portal Requests page loaded successfully');
    
    // Navigate to Probation Portal via UI (clicking the heading)
    await probationPortal.navigateToProbationPortalViaUI();
    console.log('✔️ Probation Portal section loaded successfully');
  });

  test('TC01-Verify Probation Portal navigation from Portal Requests', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC01] Probation Portal Default State and Control Visibility...');

    // Verify Probation Portal is selected by default
    await probationPortal.verifyProbationPortalIsSelected();

    // Verify Search control is available
    await probationPortal.verifySearchControl();

    // Verify Status dropdown is visible
    await probationPortal.verifyStatusDropdown();

    // Verify Search button
    await probationPortal.verifySearchButton();

    // Verify Reset button
    await probationPortal.verifyResetButton();

    // Verify New Request button
    await probationPortal.verifyNewRequestButton();

    console.log('✅ Test completed: Probation Portal default state and all controls verified');
  });

  test('TC02-Verify default status selection in Status dropdown', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC02] Verify default status selection in Status dropdown...');

    // Verify default status selection in Status dropdown
    await probationPortal.verifyDefaultStatusSelection();

    // Click on Status dropdown to view all available options
    await probationPortal.clickStatusDropdownToExpandOptions();

    // Verify all status options are available
    await probationPortal.verifyStatusDropdownOptionsAvailable();

    console.log('✅ Test completed: Default status selection and dropdown options verified');
  });

  test('TC03-Verify all grid columns are displayed', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC03] Verify all grid columns are displayed...');

    // Verify grid columns are displayed
    const columnCount = await probationPortal.verifyGridColumnsDisplayed();

    // Fetch and print all grid column names
    const columnNames = await probationPortal.fetchAndPrintGridColumnNames();

    console.log(`✅ Test completed: All ${columnCount} grid columns verified and displayed`);
  });

  test('TC04-Probation Portal New Request Creation and Form Validation', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC04] Probation Portal New Request Creation and Form Validation...');

    // Generate test data using faker
    const testFirstName = faker.person.firstName();
    const testLastName = faker.person.lastName();
    const testEmail = faker.internet.email();
    const testPhone = faker.helpers.replaceSymbols('(###) ###-####');
    const testDesignation = 'Probation Officer';
    const testAdditionalInfo = faker.lorem.sentence();

    console.log(`STEP 1: Generated test data - ${testFirstName} ${testLastName}`);

    // Get initial count
    const initialCount = await probationPortal.getInitialGridCount();

    // Click New Request button
    await probationPortal.clickNewRequestButton();
    await probationPortal.verifyProbationPortalAccessDialogOpened();

    // Verify close button
    await probationPortal.verifyCloseDialogButton();

    // Test close button functionality
    await probationPortal.closeDialog();
    await probationPortal.verifyDialogClosed();

    // Reopen dialog
    await probationPortal.clickNewRequestButton();
    await probationPortal.verifyProbationPortalAccessDialogOpened();

    // Fill form fields with generated data
    await probationPortal.fillFirstName(testFirstName);
    await probationPortal.fillLastName(testLastName);
    await probationPortal.fillEmail(testEmail);
    await probationPortal.fillPhone(testPhone);
    await probationPortal.fillDesignation(testDesignation);
    await probationPortal.fillAdditionalInfo(testAdditionalInfo);

    // Save the new request
    await probationPortal.clickSaveButton();

    // Verify record appears in grid
    await probationPortal.verifyRecordInGrid(testFirstName, testLastName);
    await probationPortal.verifyRecordEmail(testEmail);
    await probationPortal.verifyRecordDesignation(testDesignation);
    await probationPortal.verifyRecordAdditionalInfo(testAdditionalInfo);

    // Verify count incremented
    await probationPortal.verifyGridCountIncremented(initialCount);

    console.log('✅ TC04: Probation Portal New Request Creation and Form Validation - PASSED');
  });

   test('TC05-Probation Portal Search Functionality', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC05] Probation Portal Search and Filter Functionality...');

    // Get first record data from grid for testing search
    const recordData = await probationPortal.getFirstRecordData();
    console.log(`STEP 1: Retrieved test data from first grid record - ${recordData.firstName} ${recordData.lastName}`);

    // TEST 1: Search by First Name
    console.log('\n🔍 TEST 1: Testing Search by First Name...');
    console.log(`STEP: Searching for First Name: "${recordData.firstName}"`);
    await probationPortal.fillSearchInput(recordData.firstName);
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();
    const firstNameResultCount = await probationPortal.verifySearchResultsNotEmpty();
    await probationPortal.verifyRecordInGrid(recordData.firstName, recordData.lastName);
    console.log(`✔️ Search by First Name works correctly - Found ${firstNameResultCount} result(s)`);

    // Reset filters for next test
    console.log('\nSTEP: Resetting filters after TEST 1...');
    await probationPortal.clickResetButton();
    await probationPortal.page.waitForTimeout(500);
    await probationPortal.waitForLoadingSpinnerToComplete();

    // TEST 2: Search by Last Name
    console.log('\n🔍 TEST 2: Testing Search by Last Name...');
    console.log(`STEP: Searching for Last Name: "${recordData.lastName}"`);
    await probationPortal.fillSearchInput(recordData.lastName);
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();
    const lastNameResultCount = await probationPortal.verifySearchResultsNotEmpty();
    await probationPortal.verifyRecordInGrid(recordData.firstName, recordData.lastName);
    console.log(`✔️ Search by Last Name works correctly - Found ${lastNameResultCount} result(s)`);

    // Reset filters for next test
    console.log('\nSTEP: Resetting filters after TEST 2...');
    await probationPortal.clickResetButton();
    await probationPortal.page.waitForTimeout(500);
    await probationPortal.waitForLoadingSpinnerToComplete();

    // TEST 3: Search by Email
    console.log('\n🔍 TEST 3: Testing Search by Email...');
    console.log(`STEP: Searching for Email: "${recordData.email}"`);
    await probationPortal.fillSearchInput(recordData.email);
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();
    const emailResultCount = await probationPortal.verifySearchResultsNotEmpty();
    await probationPortal.verifyRecordEmail(recordData.email);
    console.log(`✔️ Search by Email works correctly - Found ${emailResultCount} result(s)`);

    // Reset filters for next test
    console.log('\nSTEP: Resetting filters after TEST 3...');
    await probationPortal.clickResetButton();
    await probationPortal.page.waitForTimeout(500);
    await probationPortal.waitForLoadingSpinnerToComplete();

    // TEST 4: Search by Phone Number
    console.log('\n🔍 TEST 4: Testing Search by Phone Number...');
    console.log(`STEP: Searching for Phone: "${recordData.phone}"`);
    await probationPortal.fillSearchInput(recordData.phone);
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();
    const phoneResultCount = await probationPortal.verifySearchResultsNotEmpty();
    await probationPortal.verifyRecordPhone(recordData.phone);
    console.log(`✔️ Search by Phone Number works correctly - Found ${phoneResultCount} result(s)`);

    // Final reset to restore grid to original state
    console.log('\nSTEP: Final reset of filters...');
    await probationPortal.clickResetButton();
    await probationPortal.page.waitForTimeout(500);
    await probationPortal.waitForLoadingSpinnerToComplete();

    console.log('\n✅ TC05: Probation Portal Search Functionality - PASSED');
  });

  test('TC06-Probation Portal Reset Button Functionality', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC06] Probation Portal Reset Button Functionality Verification...');

    // Capture original grid count before any searches
    const originalGridCount = await probationPortal.getSearchResultCount();
    console.log(`STEP 0: Captured original grid count: ${originalGridCount} records`);

    // Get first record data from grid for testing
    const recordData = await probationPortal.getFirstRecordData();
    console.log(`STEP 1: Retrieved test data from first grid record - ${recordData.firstName} ${recordData.lastName}`);

    // TEST 1: Verify Reset after First Name Search
    console.log('\n🔍 TEST 1: Verify Reset after First Name Search...');
    console.log(`STEP: Searching for First Name: "${recordData.firstName}"`);
    await probationPortal.fillSearchInput(recordData.firstName);
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();
    const firstNameResultCount = await probationPortal.verifySearchResultsNotEmpty();
    console.log(`STEP: Found ${firstNameResultCount} result(s) after search`);

    // Verify Reset functionality
    console.log('\nSTEP: Clicking Reset button...');
    await probationPortal.clickResetButton();
    await probationPortal.page.waitForTimeout(500);
    await probationPortal.waitForLoadingSpinnerToComplete();
    await probationPortal.verifyResetFunctionality(originalGridCount);
    console.log(`✔️ Reset verified after First Name search`);

    console.log('\n✅ TC06: Probation Portal Reset Button Functionality - PASSED');
  });
//Ask Sumit about how to verify grid status after filtering by status dropdown as we dont have status column
  test('TC07-Probation Portal Status Dropdown Filtering', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC07] Probation Portal Status Dropdown Filtering...');

    // STEP 1: Retrieve and verify available status options are visible and enabled
    console.log('\nSTEP 1: Retrieving and verifying status options are visible and enabled...');
    await probationPortal.clickStatusDropdownToExpandOptions();
    
    // Verify each status option is visible and enabled
    const statusOptions = ['New', 'Approved', 'Rejected'];
    for (const option of statusOptions) {
      const optionElement = page.getByRole('option', { name: option });
      await expect(optionElement).toBeVisible();
      const isEnabled = await optionElement.isEnabled();
      expect(isEnabled).toBe(true);
      console.log(`✔️ Status option "${option}" is visible and enabled (clickable)`);
    }

    // Close dropdown by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // STEP 2: Select "Rejected" Status
    console.log('\nSTEP 2: Selecting "Rejected" status from dropdown...');
    await probationPortal.selectStatusFilter('Rejected');
    console.log('✔️ "Rejected" status selected');

    // STEP 3: Click Search button
    console.log('\nSTEP 3: Clicking Search button...');
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();
    console.log('✔️ Search executed');

    // STEP 4: Verify "Rejected" status is visible in status dropdown field
    console.log('\nSTEP 4: Verifying "Rejected" is present in status dropdown field...');
    await probationPortal.verifyStatusFilterApplied('Rejected');
    console.log('✔️ Status filter "Rejected" verified in dropdown field');

    // Final reset to restore grid to original state
    console.log('\nSTEP 5: Final reset of filters...');
    await probationPortal.clickResetButton();
    await probationPortal.page.waitForTimeout(500);
    await probationPortal.waitForLoadingSpinnerToComplete();
    console.log('✔️ Filters reset to default state');

    console.log('\n✅ TC07: Probation Portal Status Dropdown Filtering - PASSED');
  });
  
});