const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PatientReferralPage } = require('../pages/patientReferral');
const { faker } = require('@faker-js/faker');

test.use({ storageState: 'authState.json' });

test.describe('Patient Referral Module Tests', () => {

  test('Verify Patient Referral Tab Navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral tab...");
    await patientReferral.navigateToPatientReferralTab(loginPage);

    console.log("STEP 2: Verify Patient Referral thumbnail is visible with count display...");
    await patientReferral.verifyPatientReferralThumbnailVisible();
    const count = await patientReferral.verifyPatientReferralCountDisplay();

    console.log("STEP 3: Click on the Patient Referral thumbnail...");
    await patientReferral.clickPatientReferralThumbnail();

    console.log("STEP 4: Verify navigation to Patient Referral Section screen...");
    await patientReferral.verifyNavigationToPatientReferralSection();

    await page.waitForTimeout(1000);

    console.log(`ASSERT: Patient successfully navigates to Patient Referral Section`);
    console.log(`ASSERT: Patient Referral thumbnail shows current count: ${count}`);
  });

  test('Verify Patient Referral Section Controls Visibility', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Verify all controls visibility and functionality...");
    await patientReferral.validateAllControlsVisibility();

    console.log("STEP 3: Verify grid columns are displayed...");
    await patientReferral.validateGridColumns();

    await page.waitForTimeout(1000);

    console.log("ASSERT: All Patient Referral controls verified successfully");
  });

  test('Verify New Request Dialog Opening and Closing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Click New Request button...");
    await patientReferral.clickNewRequestButton();

    console.log("STEP 3: Verify dialog is visible...");
    await patientReferral.verifyDialogVisible();

    console.log("STEP 4: Verify dialog header...");
    await patientReferral.verifyDialogHeader();

    console.log("STEP 5: Verify close button...");
    await patientReferral.verifyCloseButton();

    console.log("STEP 6: Close dialog...");
    await patientReferral.closeDialog();

    console.log("STEP 7: Verify dialog is closed...");
    await patientReferral.verifyDialogClosed();

    console.log("STEP 8: Verify grid is visible...");
    await patientReferral.verifyGridVisible();

    console.log("ASSERT: New Request dialog opens and closes successfully");
  });
  test('Create New Patient Referral with Client and Provider Information', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    // Generate test data using faker
    const clientData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number('##########')
    };

    const providerData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number('##########')
    };

    const notes = faker.lorem.sentence();

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Get initial grid record count...");
    const initialRecordCount = await patientReferral.getGridRecordCount();

    console.log("STEP 3: Open New Request dialog...");
    await patientReferral.clickNewRequestButton();
    await patientReferral.verifyDialogVisible();

    console.log("STEP 4: Fill Client Information...");
    await patientReferral.fillClientInformation(clientData);

    console.log("STEP 5: Fill Provider Information...");
    await patientReferral.fillProviderInformation(providerData);

    console.log("STEP 6: Fill Additional Notes...");
    await patientReferral.fillAdditionalNotes(notes);

    console.log("STEP 7: Save Patient Referral...");
    await patientReferral.clickSaveButton();

    console.log("STEP 8: Verify dialog closed and record saved...");
    await patientReferral.verifyDialogClosed();
    await patientReferral.verifyGridVisible();
    await patientReferral.verifyRecordSavedInGrid(clientData);

    console.log("STEP 9: Verify grid record count increased by one...");
    const finalRecordCount = await patientReferral.getGridRecordCount();
    expect(finalRecordCount).toBe(initialRecordCount + 1);

    console.log("STEP 10: Verify thumbnail count matches records with 'New' status...");
    const { thumbnailCount, newStatusCount } = await patientReferral.verifyThumbnailCountMatchesNewStatusRecords();

    console.log("ASSERT: Client Information created successfully");
    console.log(`ASSERT: Grid record count increased from ${initialRecordCount} to ${finalRecordCount}`);
    console.log(`ASSERT: Thumbnail count matches New status records (${thumbnailCount})`);
  });

  test('Verify Search by Client Name', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Get first record data from grid for testing search...");
    const recordData = await patientReferral.getFirstRecordData();
    console.log(`STEP: Retrieved test data from first grid record - ${recordData.firstName} ${recordData.lastName}`);

    // TEST 1: Search by First Name
    console.log('\n🔍 TEST 1: Testing Search by First Name...');
    console.log(`STEP: Searching for First Name: "${recordData.firstName}"`);
    await patientReferral.searchByClientName(recordData.firstName);
    await patientReferral.clickSearchButton();
    const firstNameFilteredCount = await patientReferral.getGridRecordCountAfterSearch();
    expect(firstNameFilteredCount).toBeGreaterThan(0);
    
    console.log('STEP: Verify searched First Name exists in grid...');
    await patientReferral.verifyFirstNameInGrid(recordData.firstName);
    console.log(`✔️ Search by First Name works correctly - Found ${firstNameFilteredCount} result(s)`);

    // Reset filters for next test
    console.log('\nSTEP: Resetting filters after TEST 1...');
    await patientReferral.clickResetButton();
    await page.waitForTimeout(500);

    // TEST 2: Search by Last Name
    console.log('\n🔍 TEST 2: Testing Search by Last Name...');
    console.log(`STEP: Searching for Last Name: "${recordData.lastName}"`);
    await patientReferral.searchByClientName(recordData.lastName);
    await patientReferral.clickSearchButton();
    const lastNameFilteredCount = await patientReferral.getGridRecordCountAfterSearch();
    expect(lastNameFilteredCount).toBeGreaterThan(0);
    
    console.log('STEP: Verify searched Last Name exists in grid...');
    await patientReferral.verifyLastNameInGrid(recordData.lastName);
    console.log(`✔️ Search by Last Name works correctly - Found ${lastNameFilteredCount} result(s)`);

    // Final reset to restore grid to original state
    console.log('\nSTEP: Final reset of filters...');
    await patientReferral.clickResetButton();
    await page.waitForTimeout(500);

    console.log('\n✅ Patient Referral Search Functionality - PASSED');
  });

  test('Verify Status Dropdown Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Verify default status selection...");
    await patientReferral.verifyDefaultStatusSelection();

    console.log("STEP 3: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 4: Store first 3 records from initial grid...");
    const initialRecords = await patientReferral.storeInitialRecords(3);

    console.log("STEP 5: Get available status options...");
    const availableStatuses = await patientReferral.getAvailableStatusOptions();
    expect(availableStatuses.length).toBeGreaterThan(0);
    expect(availableStatuses).toContain('New');

    console.log("STEP 6: Test each non-New status filter and verify grid records changed...");
    const statusesToTest = availableStatuses.filter(s => s !== 'New').slice(0, 2);
    for (const status of statusesToTest) {
      await patientReferral.verifyStatusFilterChangesGrid(status, initialRecords);
    }

    console.log("STEP 7: Reset to default 'New' status...");
    await patientReferral.selectStatusFromDropdown('New');
    await patientReferral.clickSearchButton();

    console.log("STEP 8: Verify initial grid records are restored after reset...");
    await patientReferral.verifyRecordsRestoredAfterReset(initialRecords);

    console.log(`\nASSERT: Status dropdown functionality verified with ${availableStatuses.length} status options`);
    console.log(`ASSERT: Grid records correctly changed when status filters applied`);
    console.log(`ASSERT: Initial records NOT found in filtered results (grid properly filtered)`);
    console.log(`ASSERT: All ${initialRecords.length} initial records restored after reset to 'New' status`);
  });

  test('Verify Grid Column Information Display', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Verify all grid column headers are visible...");
    await patientReferral.validateGridColumns();

    console.log("STEP 4: Verify grid column data is properly displayed...");
    await patientReferral.verifyGridColumnDataDisplay(3);

    console.log("STEP 5: Verify Action column contains action icons...");
    await patientReferral.verifyActionColumnIcons(3);

    console.log(`ASSERT: Grid contains ${recordCount} records with all columns visible and formatted`);
  });

  test('Action Icons Visibility and Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();
    
    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Verify Approve and Reject icons are visible and clickable...");
    const iconsVerified = await patientReferral.verifyAndTestActionIcons(page);
    
    expect(iconsVerified).toBeGreaterThan(0);
    console.log(`ASSERT: Action icons verified and functional in ${iconsVerified} record(s)`);
  });

  test('Reset Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Store first 3 records data before applying filters...");
    const recordsToVerify = [];
    const recordsToStore = Math.min(3, recordCount);
    for (let i = 0; i < recordsToStore; i++) {
      const recordData = await patientReferral.getRecordDataByIndex(i);
      recordsToVerify.push(recordData);
      console.log(`DEBUG: Stored record ${i + 1}: ${recordData.firstName} ${recordData.lastName}`);
    }

    console.log("STEP 4: Performing complete reset functionality test...");
    const result = await patientReferral.performCompleteResetFunctionalityTest(loginPage);
    
    console.log(`ASSERT: Initial grid state: ${result.initialRecordCount} records with "New" status`);
    console.log(`ASSERT: Applied filter: Changed status to "${result.selectedStatus}"`);
    console.log(`ASSERT: Filtered grid result: ${result.filteredRecordCount} records`);
    console.log(`ASSERT: Reset applied and verified - count restored to ${result.resetRecordCount}`);
    console.log(`ASSERT: Search field and status dropdown reset to defaults`);

    console.log("STEP 5: Verify stored records exist in grid after reset...");
    for (let i = 0; i < recordsToVerify.length; i++) {
      const record = recordsToVerify[i];
      console.log(`STEP 5.${i + 1}: Verifying record ${i + 1}: "${record.firstName} ${record.lastName}"...`);
      await patientReferral.verifyRecordInGrid(record.firstName, record.lastName);
    }

    console.log("ASSERT: Reset Functionality test passed - All stored records verified in grid after reset");
  });
  test('Column Sorting Validation', async ({ page }) => {
    const patientReferral = new PatientReferralPage(page);
    const loginPage = new LoginPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Verify grid has minimum records for sorting...");
    const recordCount = await patientReferral.getGridRecordCount();

    if (recordCount < 2) {
      console.log(`SKIP: Only ${recordCount} record(s) available. Sorting requires 2+ records.`);
      test.skip();
      return;
    }

    console.log("STEP 3: Test column sorting for all columns...");
    const columnsToTest = [
      { index: 0, name: 'First Name' },
      { index: 1, name: 'Last Name' },
      { index: 2, name: 'Email' },
      { index: 3, name: 'Phone' },
      { index: 4, name: 'Reason' },
      { index: 5, name: 'Ref Provider' },
      { index: 6, name: 'Provider Email' }
    ];

    for (const column of columnsToTest) {
      await patientReferral.testColumnDualClickSorting(column.index, column.name);
    }

    console.log(`ASSERT: Grid contains ${recordCount} records for sorting validation`);
    console.log(`ASSERT: All ${columnsToTest.length} columns tested for dual-click sorting`);
  });

  // ==================================================================================
  // APPROVAL ACTION WORKFLOW TEST SUITE
  // ==================================================================================

  test('Verify Approval Dialog Controls, Close and Reopen Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);
    
    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 2: Click Approve icon and open approval dialog...");
    await patientReferral.clickApproveAndOpenDialog();

    console.log("STEP 3: Verify all approval dialog controls...");
    await patientReferral.verifyApprovalDialogControls();

    console.log("STEP 4: Close the dialog via close button...");
    await patientReferral.closeApprovalDialog();

    console.log("STEP 5: Verify dialog closed and grid remains visible...");
    await patientReferral.verifyApprovalDialogClosedAndGridVisible();

    console.log("STEP 6: Reopen the approval dialog...");
    await patientReferral.reopenApprovalDialog();

    console.log("ASSERT: Dialog controls verified and close/reopen functionality works");
  });

  test('Verify Status Dropdown Default Value and Selection in Approve Dialog', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Click Approve icon and open approval dialog...");
    await patientReferral.clickApproveAndOpenDialog();

    console.log("STEP 4: Verify and test status dropdown...");
    await patientReferral.verifyAndTestStatusDropdown();

    console.log("ASSERT: Status dropdown validation verified");
  });

  test('Verify Add Note Textarea, Faker Content, and Complete Data Persistence', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Capture record name...");
    const recordName = await patientReferral.getFirstRecordNameOnly();

    console.log("STEP 3: Open approval dialog...");
    await patientReferral.clickApproveAndOpenDialog();

    console.log("STEP 4: Add note with faker...");
    const uniqueSentence = await patientReferral.fillApprovalNoteWithFaker();

    console.log("STEP 5: Change status...");
    const selectedStatus = await patientReferral.selectStatusAndChangeInDialog();

    console.log("STEP 6: Save approval...");
    await patientReferral.saveApprovalAndWaitForCompletion();

    console.log("STEP 7: Verify success message...");
    await patientReferral.verifySuccessMessage();

    console.log("STEP 8: Verify dialog closed...");
    await patientReferral.verifyDialogClosedAfterSave();

    console.log("STEP 9: Verify record in filtered grid...");
    await patientReferral.verifyRecordInFilteredGrid(recordName, selectedStatus, uniqueSentence);

    console.log(`ASSERT: Approval workflow completed for ${recordName.firstName} ${recordName.lastName}`);
    console.log(`ASSERT: Status changed to ${selectedStatus} with notes persisted`);
  });

  test('Verify Reject Workflow with Add Note Dialog and Data Persistence', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await patientReferral.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 2: Capture first record name...");
    const recordName = await patientReferral.getFirstRecordNameOnly();

    console.log("STEP 3: Click Reject icon and verify dialog opens...");
    await patientReferral.clickRejectAndOpenDialog();

    console.log("STEP 4: Verify reject dialog controls...");
    await patientReferral.verifyApprovalDialogControls();

    console.log("STEP 5: Close dialog and verify closure...");
    await patientReferral.closeApprovalDialog();
    await patientReferral.verifyApprovalDialogClosedAndGridVisible();

    console.log("STEP 6: Reopen reject dialog...");
    await patientReferral.reopenRejectDialog();

    console.log("STEP 7: Fill rejection note with faker...");
    const uniqueSentence = await patientReferral.fillApprovalNoteWithFaker();

    console.log("STEP 8: Save rejection...");
    await patientReferral.saveApprovalAndWaitForCompletion();

    console.log("STEP 9: Verify rejection success message...");
    await patientReferral.verifySuccessMessage();

    console.log("STEP 10: Verify dialog closed...");
    await patientReferral.verifyDialogClosedAfterSave();

    console.log("STEP 11: Verify record in rejected grid with status and notes...");
    await patientReferral.verifyRecordInRejectedGrid(recordName, uniqueSentence);

    console.log(`ASSERT: Rejection workflow completed for ${recordName.firstName} ${recordName.lastName}`);
    console.log(`ASSERT: Record status changed to 'Rejected' with notes persisted`);
  });

});