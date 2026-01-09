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
    const skipMfaVisible = await probationPortal.skipMfaButton.isVisible({ timeout: 10000 }).catch(() => false);
    if (skipMfaVisible) {
      await probationPortal.skipMfa();
      console.log('✔️ MFA skipped');
    }
    
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
// add if condition if rows count < 2 skip sorting test
  test('TC08-Probation Portal Grid Data and Sorting Validation', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC08] Probation Portal Grid Data and Sorting Validation...');

    // STEP 1: Verify grid loads with data
    console.log('\nSTEP 1: Verifying grid loads and displays data...');
    await expect(probationPortal.probationPortalGrid).toBeVisible({ timeout: 10000 });
    
    const recordCount = await probationPortal.getGridRecordCount();
    console.log(`ASSERT: Grid loaded with ${recordCount} records`);
    
    // SKIP if insufficient data for sorting validation
    if (recordCount < 2) {
      console.log(`⏭️ SKIPPING: Only ${recordCount} record(s) found. Sorting requires at least 2 records for validation.`);
      test.skip();
      return;
    }

    // STEP 2: Test sorting for each column
    console.log('\nSTEP 2: Testing sorting functionality for all columns...');
    
    // Column indices: First Name: 0, Last Name: 1, Email: 2, Phone Number: 3, Designation: 4, Additional Info: 5, Action By: 6, Action Notes: 7, Action: 8
    const columnsToTest = [
      { index: 0, name: 'First Name' },
      { index: 1, name: 'Last Name' },
      { index: 2, name: 'Email' },
      { index: 3, name: 'Phone Number' },
      { index: 4, name: 'Designation' },
      { index: 5, name: 'Additional Info' },
      { index: 6, name: 'Action By' },
      { index: 7, name: 'Action Notes' }
    ];

    for (const column of columnsToTest) {
      await probationPortal.testColumnDualClickSorting(column.index, column.name);
    }

    console.log('\n✅ TC08: Probation Portal Grid Data and Sorting Validation - COMPLETED');
  });

  test('TC09-Verify Approve and Reject buttons are visible and clickable', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC09] Verify Approve and Reject buttons are visible and clickable...');

    // Verify both Approve and Reject buttons are visible and clickable
    await probationPortal.verifyApproveAndRejectButtons();

    console.log(`\n✅ TC09: Approve and Reject buttons verification - PASSED`);
  });
// fix notification locator.

  test('TC10-Probation Portal Approval Workflow', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC10] Probation Portal Approval Workflow - STARTED');

    // STEP 1: Verify portal is loaded and status is set to "New"
    await expect(probationPortal.probationPortalGrid).toBeVisible({ timeout: 10000 });
    await probationPortal.waitForLoadingSpinnerToComplete();
    console.log('STEP 1: Probation Portal loaded with "New" status filter');

    // STEP 2: Get initial record count
    const initialRecordCount = await probationPortal.getGridRecordCount();
    console.log(`STEP 2: Initial record count captured: ${initialRecordCount} records`);

    // STEP 3: Retrieve first record data for verification
    const recordData = await probationPortal.getFirstRecordData();
    const { firstName, lastName } = recordData;
    console.log(`STEP 3: First record data captured - ${firstName} ${lastName}`);

    // STEP 4-7: Initiate approval workflow (click approve, open dialog, close/reopen)
    const dialog = await probationPortal.initiateApprovalWorkflow();
    console.log('STEP 4-7: Approval workflow initiated - dialog ready');

    // STEP 8: Test radio button selection and text population
    console.log('\nSTEP 8: Testing radio button selection and text population...');
    const hasRadioButtons = await probationPortal.verifyRadioButtonsAvailable(dialog);
    
    if (hasRadioButtons) {
      console.log('  Testing "Expired Treatment Plan" option:');
      await probationPortal.testRadioButtonAndTextPopulation(dialog, 'Expired Treatment Plan', 'Treatment');
      console.log('  Testing "Patient Balance" option:');
      await probationPortal.testRadioButtonAndTextPopulation(dialog, 'Patient Balance', 'Balance');
      console.log('  Testing "Other" option:');
      await probationPortal.clickRadioButton(dialog, 'Other');
      const otherTextArea = dialog.getByRole('textbox');
      await expect(otherTextArea).toBeVisible();
    }
    console.log('STEP 8: Radio button testing completed');

    // STEP 9-13: Complete approval with note (enter note, save, verify notification)
    const approvalNote = faker.lorem.sentences(2).replace(/\s+/g, ' ');
    await probationPortal.completeApprovalWithNote(dialog, approvalNote);
    console.log('STEP 9-13: Approval saved - success notification verified');

    // STEP 14: Verify record count decreased by 1
    await probationPortal.waitForLoadingSpinnerToComplete();
    const finalRecordCount = await probationPortal.getGridRecordCount();
    expect(finalRecordCount).toBe(initialRecordCount - 1);
    console.log(`STEP 14: Record count verified - decreased from ${initialRecordCount} to ${finalRecordCount}`);

    // STEP 15-18: Verify approved status and record (filter, search, verify record)
    await probationPortal.verifyApprovedStatusAndRecord(firstName, lastName, approvalNote);
    console.log('STEP 15-18: Approved record verified in filtered grid');

    console.log('TC10: Probation Portal Approval Workflow - COMPLETED\n');
  });
//test will fail if there is no data with new status
  test('TC11-Probation Portal Rejection Workflow', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC11] Probation Portal Rejection Workflow - STARTED');

    // STEP 1: Verify portal is loaded
    await expect(probationPortal.probationPortalGrid).toBeVisible({ timeout: 10000 });
    await probationPortal.waitForLoadingSpinnerToComplete();
    console.log('STEP 1: Probation Portal loaded with "New" status filter');

    // STEP 2: Get initial record count and first record data
    const initialRecordCount = await probationPortal.getGridRecordCount();
    console.log(`STEP 2: Initial record count captured: ${initialRecordCount} records`);

    const recordData = await probationPortal.getFirstRecordData();
    const { firstName, lastName } = recordData;
    console.log(`STEP 3: First record data captured - ${firstName} ${lastName}`);

    // STEP 4-7: Initiate rejection workflow (click reject, open dialog, close/reopen)
    const dialog = await probationPortal.initiateRejectionWorkflow();
    console.log('STEP 4-7: Rejection workflow initiated - dialog ready');

    // STEP 8: Test radio button selection and text population
    console.log('\nSTEP 8: Testing radio button selection and text population...');
    const hasRadioButtons = await probationPortal.verifyRadioButtonsAvailable(dialog);
    
    if (hasRadioButtons) {
      console.log('  Testing "Expired Treatment Plan" option:');
      await probationPortal.testRadioButtonAndTextPopulation(dialog, 'Expired Treatment Plan', 'Treatment');
      console.log('  Testing "Patient Balance" option:');
      await probationPortal.testRadioButtonAndTextPopulation(dialog, 'Patient Balance', 'Balance');
      console.log('  Testing "Other" option:');
      await probationPortal.clickRadioButton(dialog, 'Other');
      const otherTextArea = dialog.getByRole('textbox');
      await expect(otherTextArea).toBeVisible();
    }
    console.log('STEP 8: Radio button testing completed');

    // STEP 9-13: Complete rejection with note (enter note, save, verify notification)
    const rejectionNote = faker.lorem.sentences(2).replace(/\s+/g, ' ');
    await probationPortal.completeRejectionWithNote(dialog, rejectionNote);
    console.log('STEP 9-13: Rejection saved - success notification verified');

    // STEP 14: Verify record count decreased by 1
    await probationPortal.waitForLoadingSpinnerToComplete();
    const finalRecordCount = await probationPortal.getGridRecordCount();
    expect(finalRecordCount).toBe(initialRecordCount - 1);
    console.log(`STEP 14: Record count verified - decreased from ${initialRecordCount} to ${finalRecordCount}`);

    // STEP 15-18: Verify rejected status and record (filter, search, verify record)
    await probationPortal.verifyRejectedStatusAndRecord(firstName, lastName, rejectionNote);
    console.log('STEP 15-18: Rejected record verified in filtered grid');

    console.log('TC11: Probation Portal Rejection Workflow - COMPLETED\n');
  });

  test('TC12-Verify Probation Portal thumbnail count matches grid count', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC12] Verify Probation Portal thumbnail count matches grid count...');

    // Step 1: Get current grid count (already on Probation Portal with default "New" status from beforeEach)
    const gridCount = await probationPortal.getGridRecordCount();
    console.log(`STEP 1: Grid count is ${gridCount}`);

    // Step 2: Navigate back to Portal Requests dashboard to see thumbnail
    await probationPortal.navigateToPortalRequestsViaUI();
    await probationPortal.waitForPortalRequestsGridToLoad();
    console.log('STEP 2: Portal Requests dashboard loaded');

    // Step 3: Get thumbnail count for Probation Portal
    const thumbnailCount = await probationPortal.getThumbnailCount();
    console.log(`STEP 3: Thumbnail count is ${thumbnailCount}`);
    // Step 4: Verify counts match
    expect(thumbnailCount).toBe(gridCount);
    console.log(`STEP 4: Thumbnail count (${thumbnailCount}) matches grid count (${gridCount})`);

    console.log('\n✅ TC12: Probation Portal thumbnail count verification - PASSED');
  });

  test('TC13-Pagination Functionality - Records Per Page Dropdown', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log('\n➡️ [TC13] Pagination - Records Per Page Dropdown');

    // Step 1: Verify grid is loaded
    console.log('\nSTEP 1: Verifying grid is loaded...');
    await expect(probationPortal.probationPortalGrid).toBeVisible({ timeout: 10000 });
    await probationPortal.waitForLoadingSpinnerToComplete();
    console.log('✅ STEP 1: Grid loaded successfully');

    // Step 2: Apply "Rejected" status filter and search
    console.log('\nSTEP 2: Applying "Rejected" status filter...');
    await probationPortal.selectStatusFilter('Rejected');
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();
    console.log('✅ STEP 2: "Rejected" status filter applied');

    // Step 3: Verify pagination info is visible
    console.log('\nSTEP 3: Verifying pagination info...');
    const paginationInfo = page.getByText(/\d+ items?/);
    const paginationVisible = await paginationInfo.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (paginationVisible) {
      const paginationText = await paginationInfo.textContent();
      console.log(`✅ STEP 3: Pagination info visible - "${paginationText}"`);
    } else {
      console.log('⚠️ STEP 3: Pagination info not visible, continuing with test');
    }

    // Step 4: Test page size dropdown functionality
    console.log('\nSTEP 4: Testing page size dropdown...');
    const result = await probationPortal.testPageSizeDropdown();
    
    // Assert that dropdown was found
    expect(result.found).toBe(true);
    console.log('✅ STEP 4a: Page size dropdown found');
    
    // Assert that page size change functionality actually works
    expect(result.changed).toBe(true);
    console.log('✅ STEP 4b: Page size change functionality verified - dropdown is working correctly');

    console.log('\n✅ TC13: Pagination - Records Per Page Dropdown - COMPLETED');
  });

  test('TC14-Pagination Functionality - Next & Previous Page Navigation', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    // Test pagination for all status filters using POM method
    const results = await probationPortal.testPaginationForAllStatuses();

    // Validate results for each status
    for (const [status, result] of Object.entries(results)) {
      if (!result.skipped) {
        // Verify basic assertions
        expect(result.rowsOnFirstPage).toBeGreaterThanOrEqual(0);
        
        if (result.navigationResult.hasNextPage) {
          expect(result.navigationResult.rowsOnSecondPage).toBeGreaterThanOrEqual(0);
          
          if (result.navigationResult.backNavigationResult.backLinkVisible) {
            expect(result.navigationResult.backNavigationResult.backNavigationSuccess).toBe(true);
          }
        }
        
        expect(result.depthResult.totalPages).toBeGreaterThanOrEqual(1);
        expect(result.depthResult.totalRows).toBeGreaterThanOrEqual(0);
      }
    }

    console.log('✅ TC14: All pagination assertions completed successfully');
  });
  
});