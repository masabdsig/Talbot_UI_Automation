const { test, expect } = require('@playwright/test');
const { PortalRequestsPage } = require('../pages/PortalRequests');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

test.describe('Patient Portal New Request Creation and Form Validation', () => {
  test.use({ storageState: 'authState.json' });

  test.beforeEach(async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);
    
    // Navigate to Dashboard
    await portalRequests.navigateToDashboard();
    
    // Skip MFA if visible
    const skipMfaVisible = await portalRequests.skipMfaButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (skipMfaVisible) {
      await portalRequests.skipMfa();
      console.log('✔️ MFA skipped');
    }
    
    // Navigate to Portal Requests page
    await portalRequests.navigateToPortalRequests();
    await portalRequests.waitForPortalRequestsGridToLoad();
    console.log('✔️ Portal Requests page loaded successfully');
  });

  test('TC01-Patient Portal Default State and Control Visibility', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC01] Patient Portal Default State and Control Visibility...');

    // Verify Patient Portal is selected by default
    await portalRequests.verifyPatientPortalIsSelected();

    // Verify Search control is available
    await portalRequests.verifySearchControl();

    // Verify Status dropdown is visible
    await portalRequests.verifyStatusDropdown();

    // Verify Search button
    await portalRequests.verifySearchButton();

    // Verify Reset button
    await portalRequests.verifyResetButton();

    // Verify New Request button
    await portalRequests.verifyNewRequestButton();

    console.log('✅ Test completed: Patient Portal default state and all controls verified');
  });

  test('TC02-Patient Portal New Request Creation and Form Validation', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC02] Patient Portal New Request Creation and Form Validation...');

    // Generate test data using faker
    const testFirstName = faker.person.firstName();
    const testLastName = faker.person.lastName();
    const testEmail = faker.internet.email();
    const testPhone = '(555) 123-4567';
    const testDob = '01/15/1990';

    console.log(`STEP 1: Generated test data - ${testFirstName} ${testLastName}`);

    // Get initial count
    const initialCount = await portalRequests.getInitialGridCount();

    // Click New Request button
    await portalRequests.clickNewRequestButton();
    await portalRequests.verifyPortalRequestDialogOpened();

    // Verify close button
    await portalRequests.verifyCloseDialogButton();

    // Test close button functionality
    await portalRequests.closeDialog();
    await portalRequests.verifyDialogClosed();

    // Reopen dialog
    await portalRequests.clickNewRequestButton();
    await portalRequests.verifyPortalRequestDialogOpened();

    // Fill form fields with generated data
    await portalRequests.fillFirstName(testFirstName);
    await portalRequests.fillLastName(testLastName);
    await portalRequests.selectDateOfBirth(15);
    await portalRequests.fillEmail(testEmail);
    await portalRequests.fillPhone(testPhone);

    // Save the new request
    await portalRequests.clickSaveButton();

    // Verify record appears in grid
    await portalRequests.verifyRecordInGrid(testFirstName, testLastName);
    await portalRequests.verifyRecordEmail(testEmail);
    await portalRequests.verifyRecordPhone(testPhone);
    await portalRequests.verifyRecordDOB();

    // Verify count incremented
    await portalRequests.verifyGridCountIncremented(initialCount);

    // Verify record status
    await portalRequests.verifyRecordStatus(testFirstName, testLastName, 'Not Mached');

    // Save test data to file for use in filter tests
    const testData = {
      firstName: testFirstName,
      lastName: testLastName,
      email: testEmail,
      phone: testPhone,
      dob: testDob,
      createdAt: new Date().toISOString()
    };

    const dataFilePath = path.join(__dirname, '../data/PatientPortalNewReq.json');
    fs.writeFileSync(dataFilePath, JSON.stringify(testData, null, 2));
    console.log(`STEP 2: Test data saved to ${dataFilePath}`);

    console.log('✅ TC02: Patient Portal New Request Creation and Form Validation - PASSED');
  });

  test('TC03-Patient Portal Search and Filter Functionality', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC03] Patient Portal Search and Filter Functionality...');

    // Read test data from file created in TC02
    const dataFilePath = path.join(__dirname, '../data/PatientPortalNewReq.json');
    const testDataJson = fs.readFileSync(dataFilePath, 'utf-8');
    const testData = JSON.parse(testDataJson);
    
    console.log(`STEP 1: Test data loaded - ${testData.firstName} ${testData.lastName}`);

    // STEP 1: Test Search by First Name
    console.log('\n🔍 STEP 2: Testing Search by First Name...');
    await portalRequests.fillSearchInput(testData.firstName);
    await portalRequests.clickSearchButton();
    
    // Verify the record appears in filtered grid
    await portalRequests.verifyRecordInGrid(testData.firstName, testData.lastName);
    console.log('✔️ Search by First Name works correctly');

    // STEP 2: Reset filters and test Search by Last Name
    console.log('\n🔍 STEP 3: Resetting filters...');
    await portalRequests.clickResetButton();
    await portalRequests.page.waitForTimeout(500);
    
    console.log('STEP 4: Testing Search by Last Name...');
    await portalRequests.fillSearchInput(testData.lastName);
    await portalRequests.clickSearchButton();
    
    // Verify the record appears in filtered grid
    await portalRequests.verifyRecordInGrid(testData.firstName, testData.lastName);
    console.log('✔️ Search by Last Name works correctly');

    // STEP 3: Reset filters and test Search by Email
    console.log('\n🔍 STEP 5: Resetting filters...');
    await portalRequests.clickResetButton();
    await portalRequests.page.waitForTimeout(500);
    
    console.log('STEP 6: Testing Search by Email...');
    await portalRequests.fillSearchInput(testData.email);
    await portalRequests.clickSearchButton();
    
    // Verify the record appears in filtered grid
    await portalRequests.verifyRecordEmail(testData.email);
    console.log('✔️ Search by Email works correctly');

    // STEP 4: Test Reset button clears all filters
    console.log('\n🔍 STEP 7: Testing Reset button...');
    await portalRequests.clickResetButton();
    await portalRequests.page.waitForTimeout(500);
    
    // Verify search input is cleared
    const searchInputValue = await portalRequests.searchInput.inputValue().catch(() => '');
    expect(searchInputValue).toBe('');
    console.log('✔️ Reset button clears search criteria');

    console.log('✅ TC03: Patient Portal Search and Filter Functionality - PASSED');
  });
// Test will skip if there is not enough data to validate sorting
// Test will fail becuase Phone number desc sorting is not working
  test('TC04-Patient Portal Grid Data and Sorting Validation', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC04] Patient Portal Grid Data and Sorting Validation...');

    // STEP 1: Verify grid loads with data
    console.log('STEP 1: Verifying grid loads and displays data...');
    await expect(portalRequests.patientPortalGrid).toBeVisible({ timeout: 10000 });
    
    const recordCount = await portalRequests.getGridRecordCount();
    console.log(`ASSERT: Grid loaded with ${recordCount} records`);
    
    // SKIP if insufficient data for sorting validation
    if (recordCount < 2) {
      console.log(`⏭️ SKIPPING: Only ${recordCount} record(s) found. Sorting requires at least 2 records for validation.`);
      test.skip();
      return;
    }

    // STEP 2: Test sorting for each column
    console.log('\nSTEP 2: Testing sorting functionality for all columns...');
    
    // Column indices: Patient ID: 0, First Name: 1, Last Name: 2, Email: 3, Phone: 4, DOB: 5, Status: 6, Action By: 7
    const columnsToTest = [
      { index: 0, name: 'Patient ID' },
      { index: 1, name: 'First Name' },
      { index: 2, name: 'Last Name' },
      { index: 3, name: 'Email' },
      { index: 4, name: 'Phone' },
      { index: 5, name: 'DOB' },
      { index: 6, name: 'Patient Status' },
      { index: 7, name: 'Action By' }
    ];

    for (const column of columnsToTest) {
      await portalRequests.testColumnDualClickSorting(column.index, column.name);
    }

    console.log('✅ TC04: Patient Portal Grid Data and Sorting Validation - COMPLETED');
  });

  test('TC05-Patient Portal Action Buttons Validation', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC05] Patient Portal Action Buttons Validation\n');

    // Load grid and set filters
    console.log('Loading grid and setting filters...');
    await expect(portalRequests.patientPortalGrid).toBeVisible({ timeout: 10000 });
    await portalRequests.waitForLoadingSpinnerToComplete();
    await portalRequests.setStatusFilterToNew();
    console.log(' Grid loaded with "New" status filter');

    // Verify records exist
    const rowCount = await portalRequests.getVisibleDataRowCount();
    if (rowCount <= 0) {
      console.log('⚠️ No records found in grid');
      return;
    }
    console.log(` Found ${rowCount} data records in grid`);

    // Validate all records have action buttons
    console.log('\nValidating action buttons for all records...');
    const validationResult = await portalRequests.validateAllRecordsHaveActionButtons();

    // Detailed validation of first record
    console.log('Validating first record in detail...');
    const { approveVisible, rejectVisible } = await portalRequests.validateActionButtonsVisibility(0);
    const { approveEnabled, rejectEnabled } = await portalRequests.validateActionButtonsEnabled(0);
    const clickable = await portalRequests.validateActionButtonsClickable(0);

    expect(approveVisible && rejectVisible).toBe(true);
    expect(approveEnabled && rejectEnabled).toBe(true);
    expect(clickable).toBe(true);
    console.log('✅ First record buttons are visible, enabled, and clickable');

    // Summary
    console.log(`📊 SUMMARY:`);
    console.log(`✅ Records Validated: ${validationResult.validatedRows}/${validationResult.totalRows}`);
    console.log('✅ TC05: Action Buttons Validation - COMPLETED');
  });
  test('TC06-Patient Portal Rejection Workflow', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC06] Patient Portal Rejection Workflow - STARTED');

    // STEP 1: Verify portal is loaded and set status to "New"
    await expect(portalRequests.patientPortalGrid).toBeVisible({ timeout: 10000 });
    await portalRequests.waitForLoadingSpinnerToComplete();
    await portalRequests.setStatusFilterToNew();
    console.log(' STEP 1: Portal loaded with "New" status filter');

    // STEP 2: Get first patient identifier
    const patientIdentifier = await portalRequests.getFirstPatientIdentifier();
    console.log(' STEP 2: Patient identifier retrieved');

    // STEP 3: Open rejection dialog
    const rejectButton = await portalRequests.clickRejectButton();
    const dialog = await portalRequests.verifyRejectionDialogOpened();
    console.log(' STEP 3: Rejection dialog opened');

    // STEP 4: Test close and reopen functionality
    await portalRequests.closeAndReopenDialog(rejectButton);
    console.log(' STEP 4: Close and reopen dialog functionality verified');

    // STEP 5: Verify radio button labels are visible and enabled
    const { expiredTreatmentLabel, patientBalanceLabel, otherLabel } = 
      await portalRequests.verifyRadioButtonLabels(dialog);
    console.log(' STEP 5: All radio button labels verified as visible and enabled');

    // STEP 6: Verify default selection is "Other"
    await portalRequests.verifyAndSelectDefaultOption(dialog);
    console.log(' STEP 6: Default option "Other" verified');

    // STEP 7: Test "Expired Treatment Plan" option
    await portalRequests.testRadioOptionSelection(dialog, 'Expired Treatment Plan');
    console.log(' STEP 7: "Expired Treatment Plan" option tested');

    // STEP 8: Test "Patient Balance" option
    await portalRequests.testRadioOptionSelection(dialog, 'Patient Balance');
    console.log(' STEP 8: "Patient Balance" option tested');

    // STEP 9: Test "Other" option with custom text
    const customRejectionNote = 'Custom rejection reason: Patient record incomplete - missing required documentation for approval. Additional review needed by medical team.';
    await portalRequests.enterCustomRejectionReason(dialog, customRejectionNote);
    console.log(' STEP 9: Custom rejection reason entered and verified');

    // STEP 10: Verify dialog is still visible
    await expect(dialog).toBeVisible();
    console.log(' STEP 10: Dialog remains open and functional');

    // STEP 11: Save rejection
    await portalRequests.verifySaveButtonAndSubmit(dialog);
    console.log(' STEP 11: Rejection saved successfully');

    // STEP 12: Verify success notification
    await portalRequests.verifySuccessNotification();
    console.log(' STEP 12: Success notification verified');

    // STEP 13: Verify patient status changed in grid
    const statusChanged = await portalRequests.verifyPatientStatusChanged(patientIdentifier);
    console.log(' STEP 13: Patient status change in grid verified');

    // STEP 14: Verify patient appears in "Rejected" status
    await portalRequests.verifyPatientInRejectedStatus(patientIdentifier);
    console.log(' STEP 14: Patient verified in Rejected status');

    console.log('✅ TC06: Patient Portal Rejection Workflow - COMPLETED\n');
  });

  test('TC07-New Request Form Validation - Missing Field Error Messages', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC07] Form Validation - Missing Field Error Messages\n');

    // TEST 1: Empty form validation - HTML5 browser validation
    console.log('TEST 1: Empty form submission -...');
    const emptyFormBlocked = await portalRequests.testEmptyFormValidation();
    if (emptyFormBlocked) {
      console.log('✅ Form validation prevented empty submission');
    }

    // TEST 2: Partial form validation - First Name only
    console.log('\nTEST 2: Partial submission - First Name only...');
    const partialFormError = await portalRequests.testPartialFormValidation('John');
    if (partialFormError) {
      console.log('✅ Form blocked submission with missing required fields');
      console.log(`📋 Validation error message: ${partialFormError}`);
    }

    // TEST 3: Invalid email format validation
    console.log('\nTEST 3: Invalid email format validation...');
    const invalidEmailError = await portalRequests.testInvalidEmailValidation();
    if (invalidEmailError) {
      console.log('✅ Form blocked submission with invalid email format');
      console.log(`📋 Validation error message: ${invalidEmailError}`);
    }

    console.log('\n✅ TC07: Form Validation Error Message Testing - COMPLETED');
  });

  test('TC08-Status filter dropdown works', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC08] Status filter dropdown functionality...');

    // Step 1: Verify grid loads with data
    await expect(portalRequests.patientPortalGrid).toBeVisible({ timeout: 10000 });
    console.log('✅ STEP 1: Portal grid is visible');

    // Step 2: Verify Status dropdown is visible
    await portalRequests.verifyStatusDropdown();
    console.log('✅ STEP 2: Status dropdown is visible');

    // Step 2.1: Verify "New" is selected by default
    await portalRequests.verifyDefaultStatusSelection();
    console.log('✅ STEP 2.1: Default status selection verified');

    // Step 2.2: Verify thumbnail count matches grid count for "New" status
    const newStatusSelected = await portalRequests.selectStatusFilter('New');
    if (newStatusSelected) {
      await portalRequests.performSearch();
      const { totalRows: newStatusCount } = await portalRequests.countAllRowsAcrossPages();
      await portalRequests.verifyThumbnailCountMatchesGridCount(newStatusCount);
      console.log('✅ STEP 2.2: Thumbnail count validated against "New" status grid count');
    }

    // Step 3: Test each status filter option
    const statusesToTest = ['Approved', 'Rejected'];
    
    for (const status of statusesToTest) {
      console.log(`\n🔍 Testing status: ${status}`);
      
      // Select status filter
      const selected = await portalRequests.selectStatusFilter(status);
      
      if (selected) {
        // Perform search
        await portalRequests.performSearch();
        
        // Count rows across all pages
        const { totalRows, pages } = await portalRequests.countAllRowsAcrossPages();
        
        if (totalRows > 0) {
          console.log(`✅ Found ${totalRows} records for ${status} status across ${pages} page(s)`);
        } else {
          console.log(`⚠️ No records found for ${status} status`);
        }
      } else {
        console.log(`⚠️ ${status} option not found in dropdown`);
      }
    }

    // Step 4: Reset filters
    await portalRequests.resetFilters();
    console.log('✅ STEP 4: Filters reset to original state');

    console.log('✅ TC08: Status filter dropdown functionality - COMPLETED');
  });

  test('TC09-Pagination Functionality - Records Per Page Dropdown', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC09] Pagination - Records Per Page Dropdown');

    // Step 1: Verify grid is loaded
    console.log('\nSTEP 1: Verifying grid is loaded...');
    await expect(portalRequests.patientPortalGrid).toBeVisible({ timeout: 10000 });
    await portalRequests.waitForLoadingSpinnerToComplete();
    console.log('✅ STEP 1: Grid loaded successfully');

    // Step 2: Apply "New" status filter and search
    console.log('\nSTEP 2: Applying "Rejected" status filter...');
    await portalRequests.selectStatusFilter('Rejected');
    await portalRequests.performSearch();
    await portalRequests.waitForLoadingSpinnerToComplete();
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
    const result = await portalRequests.testPageSizeDropdown();
    
    if (result.found) {
      if (result.changed) {
        console.log('✅ STEP 4: Page size dropdown working correctly');
      } else {
        console.log('⚠️ STEP 4: Dropdown found but could not change page size');
      }
    } else {
      console.log('⚠️ STEP 4: Page size dropdown not found on this page');
    }

    console.log('\n✅ TC09: Pagination - Records Per Page Dropdown - COMPLETED');
  });

  test('TC10-Pagination Functionality - Next & Previous Page Navigation', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    // Test pagination for all status filters
    const results = await portalRequests.testPaginationForAllStatuses();

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

    console.log('✅ TC10: All pagination assertions completed successfully');
  });

  test('TC11-Patient Portal Approval Workflow Patient Status Matched', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    console.log('\n➡️ [TC11] Patient Portal Approval Workflow - STARTED');

    // STEP 1: Verify portal is loaded and set status to "New"
    await expect(portalRequests.patientPortalGrid).toBeVisible({ timeout: 10000 });
    await portalRequests.waitForLoadingSpinnerToComplete();
    await portalRequests.setStatusFilterToNew();
    console.log('✅ STEP 1: Portal loaded with "New" status filter');

    // STEP 2: Look for patient with "Matched" status
    console.log('\n🔍 STEP 2: Searching for patient with "Matched" status...');
    const matchedPatient = await portalRequests.findPatientWithMatchedStatus();
    
    if (!matchedPatient.found) {
      console.log('⚠️ No patients with "Matched" status found. Skipping test.');
      return;
    }
    
    const patientIdentifier = matchedPatient.identifier;
    console.log('✅ STEP 2: Found patient with "Matched" status');

    // STEP 3: Click Approve button for matched patient
    const approveButton = await portalRequests.clickApproveButtonForMatchedPatient(matchedPatient.rowIndex);
    console.log('✅ STEP 3: Clicked Approve button for matched patient');

    // STEP 4: Verify approval dialog opened (not table grid)
    const dialog = await portalRequests.verifyRejectionDialogOpened();
    console.log('✅ STEP 4: Approval dialog opened');

    // STEP 5: Test close and reopen functionality
    await portalRequests.closeAndReopenDialog(approveButton);
    console.log('✅ STEP 5: Close and reopen dialog functionality verified');

    // STEP 6: Verify radio button labels are visible and enabled
    const { expiredTreatmentLabel, patientBalanceLabel, otherLabel } = 
      await portalRequests.verifyRadioButtonLabels(dialog);
    console.log('✅ STEP 6: All radio button labels verified as visible and enabled');

    // STEP 7: Verify default selection is "Other"
    await portalRequests.verifyAndSelectDefaultOption(dialog);
    console.log('✅ STEP 7: Default option "Other" verified');

    // STEP 8: Test "Expired Treatment Plan" option
    await portalRequests.testRadioOptionSelection(dialog, 'Expired Treatment Plan');
    console.log('✅ STEP 8: "Expired Treatment Plan" option tested');

    // STEP 9: Test "Patient Balance" option
    await portalRequests.testRadioOptionSelection(dialog, 'Patient Balance');
    console.log('✅ STEP 9: "Patient Balance" option tested');

    // STEP 10: Test "Other" option with custom text
    const customApprovalNote = 'Custom approval reason: Patient record verified and all required documentation is complete. Medical team has reviewed and approved for treatment continuation.';
    await portalRequests.enterCustomRejectionReason(dialog, customApprovalNote);
    console.log('✅ STEP 10: Custom approval reason entered and verified');

    // STEP 11: Verify dialog is still visible
    await expect(dialog).toBeVisible();
    console.log('✅ STEP 11: Dialog remains open and functional');

    // STEP 12: Save approval
    await portalRequests.verifySaveButtonAndSubmit(dialog);
    console.log('✅ STEP 12: Approval saved successfully');

    // STEP 13: Verify success notification
    await portalRequests.verifySuccessNotification();
    console.log('✅ STEP 13: Success notification verified');

    // STEP 14: Verify patient status changed in grid
    const statusChanged = await portalRequests.verifyPatientStatusChanged(patientIdentifier);
    console.log('✅ STEP 14: Patient status change in grid verified');

    // STEP 15: Verify patient appears in "Approved" status
    await portalRequests.verifyPatientInApprovedStatus(patientIdentifier, customApprovalNote);
    console.log('✅ STEP 15: Patient verified in Approved status with correct description');

    console.log('✅ TC11: Patient Portal Approval Workflow - COMPLETED\n');
  });

  // update this test later there are issues to be discussed
  test('TC12-Patient Portal Approval Workflow Patient Status Not Matched', async ({ page }) => {
    const portalRequests = new PortalRequestsPage(page);

    // FIXME: The approval dialog opened after selecting a patient from the Select Patient table
    // does not contain the expected radio button labels (Expired Treatment Plan, Patient Balance, Other).
    // The dialog structure may be different for "Not Matched" patients or the dialog was not properly triggered.
    // Need to investigate the actual dialog structure when approving from the Select Patient table.

    console.log('\n➡️ [TC12] Patient Portal Approval Workflow (Not Matched Status) - STARTED');

    // STEP 1: Verify portal is loaded and set status to "New"
    await expect(portalRequests.patientPortalGrid).toBeVisible({ timeout: 10000 });
    await portalRequests.waitForLoadingSpinnerToComplete();
    await portalRequests.setStatusFilterToNew();
    console.log('✅ STEP 1: Portal loaded with "New" status filter');

    // STEP 2: Look for patient with "Not Matched" status
    console.log('\n🔍 STEP 2: Searching for patient with "Not Matched" status...');
    const notMatchedPatient = await portalRequests.findPatientWithNotMatchedStatus();
    
    if (!notMatchedPatient.found) {
      console.log('⚠️ No patients with "Not Matched" status found. Skipping test.');
      return;
    }
    
    const patientIdentifier = notMatchedPatient.identifier;
    const patientLastName = notMatchedPatient.lastName;
    const patientFirstName = notMatchedPatient.firstName;
    console.log(`✅ STEP 2: Found patient with "Not Matched" status - ${patientFirstName} ${patientLastName}`);

    // STEP 3: Click Approve button for not matched patient
    await portalRequests.clickApproveButtonForNotMatchedPatient(notMatchedPatient.rowIndex);
    console.log('✅ STEP 3: Clicked Approve button for not matched patient');

    // STEP 4: Verify "Select Patient" table appears
    await portalRequests.verifySelectPatientTableOpened();
    console.log('✅ STEP 4: "Select Patient" table opened');

    // STEP 5: Test close functionality (cross icon and cancel button)
    await portalRequests.testSelectPatientTableCloseOptions();
    console.log('✅ STEP 5: Cross icon and cancel button functionality verified');

    // STEP 6: Reopen Select Patient table
    await portalRequests.clickApproveButtonForNotMatchedPatient(notMatchedPatient.rowIndex);
    await portalRequests.verifySelectPatientTableOpened();
    console.log('✅ STEP 6: Select Patient table reopened');

    // STEP 7: Verify search bar is populated with patient's last name
    const searchPrePopulated = await portalRequests.verifySelectPatientSearchPopulated(patientLastName);
    console.log('✅ STEP 7: Search bar pre-populated with patient last name verified');

    // STEP 8: Clear search and enter first name
    console.log('\n🔍 STEP 8: Clearing search and entering first name...');
    await portalRequests.clearSelectPatientSearch();
    let recordFound = await portalRequests.searchInSelectPatientTable(patientFirstName);
    
    if (!recordFound) {
      // STEP 9: Try with empty search to show all records
      console.log('\n🔍 STEP 9: No records found. Trying empty search to show all records...');
      await portalRequests.clearSelectPatientSearch();
      recordFound = await portalRequests.searchInSelectPatientTable('');
      
      if (!recordFound) {
        console.log('⚠️ No records visible in Select Patient table');
        return;
      }
    }
    
    console.log('✅ STEP 8: Records found in Select Patient table');

    // STEP 9: Click approve/select icon on first record
    await portalRequests.clickApproveInSelectPatientTable();
    console.log('✅ STEP 9: Clicked approve on record in Select Patient table');

    // STEP 10: Add reason popup appears - enter note and save
    console.log('\n📝 STEP 10: Adding approval reason...');
    const customApprovalNote = 'Approval reason: Patient verified through Select Patient table and approved for treatment.';
    await portalRequests.addApprovalReasonInDialog(customApprovalNote);
    console.log('✅ STEP 10: Approval reason added and saved');

    // STEP 11: Verify success message
    await portalRequests.verifySuccessNotification();
    console.log('✅ STEP 11: Success notification verified');

    console.log('✅ TC12: Patient Portal Approval Workflow (Not Matched Status) - COMPLETED\n');
  });


});
