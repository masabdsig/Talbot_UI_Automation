const { test, expect } = require('@playwright/test');
const { ProbationPortalPage } = require('../pages/ProbationPortal');
const { faker } = require('@faker-js/faker');

test.use({ storageState: 'authState.json' });

test.describe('Probation Portal Module Tests', () => {
  test.beforeEach(async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);
    
    console.log('SETUP: Navigating to Probation Portal...');
    await probationPortal.navigateToDashboard();
    
    // Skip MFA if visible
    const skipMfaVisible = await probationPortal.skipMfaButton.isVisible({ timeout: 10000 }).catch(() => false);
    if (skipMfaVisible) {
      await probationPortal.skipMfa();
    }
    
    // Navigate to Portal Requests page via UI
    await probationPortal.navigateToPortalRequestsViaUI();
    await probationPortal.waitForPortalRequestsGridToLoad();
    
    // Navigate to Probation Portal via UI
    await probationPortal.navigateToProbationPortalViaUI();
    console.log('SETUP: Probation Portal loaded successfully');
  });

  test('Verify Probation Portal Navigation and Controls', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Verify Probation Portal is displayed...");
    await probationPortal.verifyProbationPortalIsSelected();

    console.log("STEP 2: Verify all controls visibility and functionality...");
    await probationPortal.verifySearchControl();
    await probationPortal.verifyStatusDropdown();
    await probationPortal.verifySearchButton();
    await probationPortal.verifyResetButton();
    await probationPortal.verifyNewRequestButton();


    console.log(`ASSERT: All controls (Search, Status, Buttons) verified successfully`);
  });

  // done
  test('Verify Default Status Selection and Dropdown Options', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Verify default status selection is 'New'...");
    await probationPortal.verifyDefaultStatusSelection();

    console.log("STEP 2: Expand status dropdown to view all options...");
    await probationPortal.clickStatusDropdownToExpandOptions();

    console.log("STEP 3: Verify all status options are available...");
    await probationPortal.verifyStatusDropdownOptionsAvailable();

    console.log("ASSERT: Default status selection and dropdown options verified successfully");
  });

  // done
  test('Validate Grid Column Headers Visibility', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Validating all grid column headers are visible...");
    await probationPortal.validateGridColumns();

    console.log("ASSERT: All grid column headers validated successfully");
  });

  // done
  test('Create New Probation Portal Request and Verify in Grid', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    // Generate test data
    const testData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.helpers.replaceSymbols('(###) ###-####'),
      designation: 'Probation Officer',
      additionalInfo: faker.lorem.sentence()
    };

    console.log(`STEP 1: Generated test data - ${testData.firstName} ${testData.lastName}`);

    console.log("STEP 2: Get initial grid record count...");
    const initialCount = await probationPortal.getInitialGridCount();

    console.log("STEP 3: Click New Request button...");
    await probationPortal.clickNewRequestButton();
    await probationPortal.verifyProbationPortalAccessDialogOpened();

    console.log("STEP 4: Verify close button functionality...");
    await probationPortal.verifyCloseDialogButton();
    await probationPortal.closeDialog();
    await probationPortal.verifyDialogClosed();

    console.log("STEP 5: Reopen dialog and fill form...");
    await probationPortal.clickNewRequestButton();
    await probationPortal.verifyProbationPortalAccessDialogOpened();
    await probationPortal.fillFirstName(testData.firstName);
    await probationPortal.fillLastName(testData.lastName);
    await probationPortal.fillEmail(testData.email);
    await probationPortal.fillPhone(testData.phone);
    await probationPortal.fillDesignation(testData.designation);
    await probationPortal.fillAdditionalInfo(testData.additionalInfo);

    console.log("STEP 6: Save new request...");
    await probationPortal.clickSaveButton();

    console.log("STEP 7: Verify record saved in grid...");
    await probationPortal.verifyRecordInGrid(testData.firstName, testData.lastName, testData.email, testData.designation, testData.additionalInfo);

    console.log("STEP 8: Verify grid count incremented...");
    await probationPortal.verifyGridCountIncremented(initialCount);

    console.log("ASSERT: New request created and verified in grid successfully");
  });
  // done
  test('Probation Portal Search Functionality', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Ensure at least one record with New status exists...");
    const recordCount = await probationPortal.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 2: Get first record data from grid for testing search...");
    const recordData = await probationPortal.getFirstRecordData();
    console.log(`STEP: Retrieved test data - ${recordData.firstName} ${recordData.lastName}`);

    // TEST 1: Search by First Name
    console.log('\nSTEP 3: Testing Search by First Name...');
    console.log(`STEP: Searching for: "${recordData.firstName}"`);
    await probationPortal.fillSearchInput(recordData.firstName);
    await probationPortal.clickSearchButton();
    const firstNameResultCount = await probationPortal.verifySearchResultsNotEmpty();
    await probationPortal.verifyRecordInGrid(recordData.firstName, recordData.lastName);
    console.log(`ASSERT: Search by First Name works correctly - Found ${firstNameResultCount} result(s)`);

    // Reset filters
    console.log('\nSTEP: Resetting filters...');
    await probationPortal.clickResetButton();
    await page.waitForTimeout(500);

    // TEST 2: Search by Last Name
    console.log('\nSTEP 4: Testing Search by Last Name...');
    console.log(`STEP: Searching for: "${recordData.lastName}"`);
    await probationPortal.fillSearchInput(recordData.lastName);
    await probationPortal.clickSearchButton();
    const lastNameResultCount = await probationPortal.verifySearchResultsNotEmpty();
    await probationPortal.verifyRecordInGrid(recordData.firstName, recordData.lastName);
    console.log(`ASSERT: Search by Last Name works correctly - Found ${lastNameResultCount} result(s)`);

    // Reset filters
    console.log('\nSTEP: Resetting filters...');
    await probationPortal.clickResetButton();
    await page.waitForTimeout(500);

    // TEST 3: Search by Email
    console.log('\nSTEP 5: Testing Search by Email...');
    console.log(`STEP: Searching for: "${recordData.email}"`);
    await probationPortal.fillSearchInput(recordData.email);
    await probationPortal.clickSearchButton();
    const emailResultCount = await probationPortal.verifySearchResultsNotEmpty();
    await probationPortal.verifyRecordEmail(recordData.email);
    console.log(`ASSERT: Search by Email works correctly - Found ${emailResultCount} result(s)`);

    // Reset filters
    console.log('\nSTEP: Resetting filters...');
    await probationPortal.clickResetButton();
    await page.waitForTimeout(500);

    // Final reset
    console.log('\nSTEP: Final reset of filters...');
    await probationPortal.clickResetButton();
    await page.waitForTimeout(500);

    console.log('\nASSERT: All search functionality tests passed');
  });


  // done
  test('Probation Portal Reset Button Functionality', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Ensure at least one record with New status exists...");
    const recordCount = await probationPortal.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 2: Store first record data before applying filters...");
    const recordToVerify = await probationPortal.getFirstRecordData();
    console.log(`DEBUG: Stored record: ${recordToVerify.firstName} ${recordToVerify.lastName}`);

    console.log("STEP 3: Performing complete reset functionality test (change status AND search)...");
    const result = await probationPortal.performCompleteResetFunctionalityTest();
    
    console.log(`ASSERT: Initial grid state: ${result.initialRecordCount} records with "New" status`);
    console.log(`ASSERT: Applied status filter: Changed to "${result.appliedStatusFilter}"`);
    console.log(`ASSERT: Filtered result (status only): ${result.approvedFilteredCount} records`);
    console.log(`ASSERT: Filtered result (status + search): ${result.doubleFilteredCount} records`);
    console.log(`ASSERT: Reset applied and verified - count restored to ${result.resetRecordCount}`);
    console.log(`ASSERT: Search field and status dropdown reset to defaults`);

    console.log("STEP 4: Verify stored record exists in grid after reset...");
    console.log(`STEP 4.1: Verifying record: "${recordToVerify.firstName} ${recordToVerify.lastName}"...`);
    await probationPortal.verifyRecordInGrid(recordToVerify.firstName, recordToVerify.lastName);

    console.log("ASSERT: Reset Functionality test passed - Stored record verified in grid after reset");
  });

  // done
  test('Probation Portal Status Dropdown Filtering', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Retrieve and verify available status options...");
    await probationPortal.clickStatusDropdownToExpandOptions();
    
    const statusOptions = ['New', 'Approved', 'Rejected'];
    for (const option of statusOptions) {
      const optionElement = page.getByRole('option', { name: option });
      await expect(optionElement).toBeVisible();
      const isEnabled = await optionElement.isEnabled();
      expect(isEnabled).toBe(true);
      console.log(`ASSERT: Status option "${option}" is visible and enabled`);
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    console.log("\nSTEP 2: Select 'Rejected' status filter...");
    await probationPortal.selectStatusFilter('Rejected');

    console.log("STEP 3: Click Search button...");
    await probationPortal.clickSearchButton();

    console.log("STEP 4: Verify 'Rejected' status is applied...");
    await probationPortal.verifyStatusFilterApplied('Rejected');

    console.log("STEP 5: Reset filters to default state...");
    await probationPortal.clickResetButton();
    await page.waitForTimeout(500);

    console.log("ASSERT: Status dropdown filtering verified successfully");
  });
  // done
  test('Probation Portal Grid Data and Sorting Validation', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Verify grid loads with data...");
    await expect(probationPortal.probationPortalGrid).toBeVisible({ timeout: 10000 });
    
    const recordCount = await probationPortal.getGridRecordCount();
    console.log(`ASSERT: Grid loaded with ${recordCount} records`);
    
    if (recordCount < 2) {
      console.log(`SKIP: Only ${recordCount} record(s) found. Sorting requires at least 2 records for validation.`);
      test.skip();
      return;
    }

    console.log("\nSTEP 2: Test sorting functionality for all columns...");
    
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

    console.log(`ASSERT: Grid sorting validation completed for ${columnsToTest.length} columns`);
  });

  // done
  test('Probation Portal Verify Approve and Reject buttons', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Ensure at least one record with New status exists...");
    const recordCount = await probationPortal.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 2: Verify Approve and Reject buttons are visible and clickable...");
    await probationPortal.verifyApproveAndRejectButtons();

    console.log("ASSERT: All Approve and Reject buttons verified successfully");
  });
  // done
  test('Probation Portal Approval Workflow', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Ensure at least one record with New status exists...");
    const recordCount = await probationPortal.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 2: Verify portal is loaded with 'New' status filter...");
    await expect(probationPortal.probationPortalGrid).toBeVisible({ timeout: 10000 });
    await probationPortal.waitForLoadingSpinnerToComplete();

    console.log("STEP 3: Get initial record count...");
    const initialRecordCount = await probationPortal.getGridRecordCount();

    console.log("STEP 4: Retrieve first record data...");
    const recordData = await probationPortal.getFirstRecordData();
    const { firstName, lastName } = recordData;

    console.log("STEP 5-8: Initiate approval workflow...");
    const dialog = await probationPortal.initiateApprovalWorkflow();

    console.log("\nSTEP 9: Testing radio button selection and text population...");
    const hasRadioButtons = await probationPortal.verifyRadioButtonsAvailable(dialog);
    
    if (hasRadioButtons) {
      await probationPortal.testRadioButtonAndTextPopulation(dialog, 'Expired Treatment Plan', 'Treatment');
      await probationPortal.testRadioButtonAndTextPopulation(dialog, 'Patient Balance', 'Balance');
      await probationPortal.clickRadioButton(dialog, 'Other');
    }

    console.log("\nSTEP 10-14: Complete approval with note...");
    const approvalNote = faker.lorem.sentences(2).replace(/\s+/g, ' ');
    await probationPortal.completeApprovalWithNote(dialog, approvalNote);

    console.log("STEP 15: Verify record count decreased by 1...");
    await probationPortal.waitForLoadingSpinnerToComplete();
    const finalRecordCount = await probationPortal.getGridRecordCount();
    expect(finalRecordCount).toBe(initialRecordCount - 1);

    console.log("STEP 16-19: Verify approved status and record...");
    await probationPortal.verifyApprovedStatusAndRecord(firstName, lastName, approvalNote);

    console.log("ASSERT: Approval workflow completed successfully");
  });

  // done
  test('Probation Portal Rejection Workflow', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Ensure at least one record with New status exists...");
    const recordCount = await probationPortal.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 2: Verify portal is loaded...");
    await expect(probationPortal.probationPortalGrid).toBeVisible({ timeout: 10000 });
    await probationPortal.waitForLoadingSpinnerToComplete();

    console.log("STEP 3: Get initial record count...");
    const initialRecordCount = await probationPortal.getGridRecordCount();

    console.log("STEP 4: Retrieve first record data...");
    const recordData = await probationPortal.getFirstRecordData();
    const { firstName, lastName } = recordData;

    console.log("STEP 5-8: Initiate rejection workflow...");
    const dialog = await probationPortal.initiateRejectionWorkflow();

    console.log("\nSTEP 9: Testing radio button selection and text population...");
    const hasRadioButtons = await probationPortal.verifyRadioButtonsAvailable(dialog);
    
    if (hasRadioButtons) {
      await probationPortal.testRadioButtonAndTextPopulation(dialog, 'Expired Treatment Plan', 'Treatment');
      await probationPortal.testRadioButtonAndTextPopulation(dialog, 'Patient Balance', 'Balance');
      await probationPortal.clickRadioButton(dialog, 'Other');
    }

    console.log("\nSTEP 10-14: Complete rejection with note...");
    const rejectionNote = faker.lorem.sentences(2).replace(/\s+/g, ' ');
    await probationPortal.completeRejectionWithNote(dialog, rejectionNote);

    console.log("STEP 14.5: Verify success message popup appeared...");
    await probationPortal.verifySuccessMessagePopup();

    console.log("STEP 15: Verify record count decreased by 1...");
    await probationPortal.waitForLoadingSpinnerToComplete();
    const finalRecordCount = await probationPortal.getGridRecordCount();
    expect(finalRecordCount).toBe(initialRecordCount - 1);

    console.log("STEP 15.5: Change status filter to 'Rejected' to verify record status...");
    await probationPortal.selectStatusFilter('Rejected');
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();

    console.log("STEP 16: Verify rejected record exists in grid...");
    console.log(`DEBUG: Rejection note used: "${rejectionNote}"`);
    await probationPortal.verifyRecordInGrid(firstName, lastName, null, null, null, rejectionNote);

    console.log("ASSERT: Rejection workflow completed successfully");
  });

  // done
  test('Probation Portal Thumbnail Count Verification', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Get current grid count (already on Probation Portal with 'New' status)...");
    const gridCount = await probationPortal.getGridRecordCount();

    console.log("STEP 2: Navigate back to Portal Requests dashboard...");
    await probationPortal.navigateToPortalRequestsViaUI();
    await probationPortal.waitForPortalRequestsGridToLoad();

    console.log("STEP 3: Get thumbnail count for Probation Portal...");
    const thumbnailCount = await probationPortal.getThumbnailCount();

    console.log("STEP 4: Verify counts match...");
    expect(thumbnailCount).toBe(gridCount);

    console.log(`ASSERT: Thumbnail count (${thumbnailCount}) matches grid count (${gridCount})`);
  });

  // done
  test('Probation Portal Pagination - Records Per Page Dropdown', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Verify grid is loaded...");
    await expect(probationPortal.probationPortalGrid).toBeVisible({ timeout: 10000 });
    await probationPortal.waitForLoadingSpinnerToComplete();

    console.log("STEP 2: Apply 'Rejected' status filter...");
    await probationPortal.selectStatusFilter('Rejected');
    await probationPortal.clickSearchButton();
    await probationPortal.waitForLoadingSpinnerToComplete();

    console.log("STEP 3: Verify pagination info...");
    const paginationInfo = page.getByText(/\d+ items?/);
    const paginationVisible = await paginationInfo.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (paginationVisible) {
      const paginationText = await paginationInfo.textContent();
      console.log(`ASSERT: Pagination info visible - "${paginationText}"`);
    }

    console.log("STEP 4: Test page size dropdown...");
    const result = await probationPortal.testPageSizeDropdown();
    
    expect(result.found).toBe(true);
    expect(result.changed).toBe(true);

    console.log("ASSERT: Page size dropdown functionality verified");
  });

  // done
  test('Probation Portal Pagination - Next & Previous Page Navigation', async ({ page }) => {
    const probationPortal = new ProbationPortalPage(page);

    console.log("STEP 1: Test pagination for all status filters...");
    const results = await probationPortal.testPaginationForAllStatuses();

    console.log("\nSTEP 2: Validate results for each status...");
    for (const [status, result] of Object.entries(results)) {
      if (!result.skipped) {
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

    console.log("ASSERT: Pagination assertions completed successfully");
  });
});
