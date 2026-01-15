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

    console.log("STEP 2: Get initial record count...");
    const initialCount = await patientReferral.getGridRecordCountAfterSearch();
    expect(initialCount).toBeGreaterThan(0);

    console.log("STEP 3: Get real data from first record...");
    const recordData = await patientReferral.getFirstRecordData();
    const { firstName, lastName } = recordData;

    console.log("STEP 4: Search by Client First Name...");
    await patientReferral.searchByClientName(firstName);
    await patientReferral.clickSearchButton();
    const firstNameFilteredCount = await patientReferral.getGridRecordCountAfterSearch();
    expect(firstNameFilteredCount).toBeGreaterThan(0);
    expect(firstNameFilteredCount).toBeLessThanOrEqual(initialCount);

    console.log("STEP 5: Clear search and search by Client Last Name...");
    await patientReferral.clearSearchField();
    await patientReferral.searchByClientName(lastName);
    await patientReferral.clickSearchButton();
    const lastNameFilteredCount = await patientReferral.getGridRecordCountAfterSearch();
    expect(lastNameFilteredCount).toBeGreaterThan(0);
    expect(lastNameFilteredCount).toBeLessThanOrEqual(initialCount);

    console.log("STEP 6: Verify Reset button functionality...");
    await patientReferral.clickResetButton();
    const resetCount = await patientReferral.getGridRecordCount();
    expect(resetCount).toBe(initialCount);
    await expect(patientReferral.searchTextbox).toHaveValue('');

    console.log(`ASSERT: Search by First Name ("${firstName}"): ${firstNameFilteredCount} records`);
    console.log(`ASSERT: Search by Last Name ("${lastName}"): ${lastNameFilteredCount} records`);
    console.log(`ASSERT: After reset, record count restored to ${resetCount}`);
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

    console.log("STEP 3: Capture initial grid data for 'New' status...");
    const newStatusData = await patientReferral.getMultipleGridRows(4);

    console.log("STEP 4: Get available status options...");
    const availableStatuses = await patientReferral.getAvailableStatusOptions();
    const statusesToTest = availableStatuses.slice(1);

    console.log("STEP 5: Test each status filter...");
    for (const status of statusesToTest) {
      await patientReferral.selectStatusFromDropdown(status);
      await patientReferral.clickSearchButton();
      const filteredStatusData = await patientReferral.getMultipleGridRows(4);
      
      let matchingRecords = 0;
      for (const newRecord of newStatusData) {
        for (const filteredRecord of filteredStatusData) {
          if (newRecord.firstName === filteredRecord.firstName && 
              newRecord.lastName === filteredRecord.lastName) {
            matchingRecords++;
          }
        }
      }
      expect(matchingRecords).not.toBe(newStatusData.length);
    }

    console.log("STEP 6: Reset to default 'New' status...");
    await patientReferral.selectStatusFromDropdown('New');
    await patientReferral.clickSearchButton();

    console.log(`ASSERT: Status dropdown functionality verified with ${availableStatuses.length} status options`);
  });

  test('Verify Grid Column Information Display', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();

    console.log("STEP 2: Verify all grid column headers are visible...");
    await patientReferral.validateGridColumns();

    console.log("STEP 3: Get grid record count...");
    const recordCount = await patientReferral.getGridRecordCount();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 4: Verify grid column data is properly displayed...");
    await patientReferral.verifyGridColumnDataDisplay(3);

    console.log("STEP 5: Verify Action column contains action icons...");
    await patientReferral.verifyActionColumnIcons();

    console.log(`ASSERT: Grid contains ${recordCount} records with all columns visible and formatted`);
  });

  test('Action Icons Visibility and Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    await patientReferral.navigateToPatientReferralTab(loginPage);
    await patientReferral.clickPatientReferralThumbnail();
    await patientReferral.verifyNavigationToPatientReferralSection();
    
    console.log("STEP 2: Get grid record count...");
    const recordCount = await patientReferral.getGridRecordCount();
    
    if (recordCount === 0) {
      console.log("SKIP: No records available for action icon verification");
      test.skip();
      return;
    }

    console.log("STEP 3: Verify Approve and Reject icons are visible and clickable...");
    const iconsVerified = await patientReferral.verifyAndTestActionIcons(page);
    
    expect(iconsVerified).toBeGreaterThan(0);
    console.log(`ASSERT: Action icons verified and functional in ${iconsVerified} record(s)`);
  });

  test('Reset Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    const result = await patientReferral.performCompleteResetFunctionalityTest(loginPage);

    if (result.skipped) {
      console.log(`SKIP: ${result.reason}`);
      test.skip();
      return;
    }
    
    console.log(`ASSERT: Initial grid state: ${result.initialRecordCount} records with "New" status`);
    console.log(`ASSERT: Applied filter: Changed status to "${result.selectedStatus}"`);
    console.log(`ASSERT: Filtered grid result: ${result.filteredRecordCount} records`);
    console.log(`ASSERT: Reset applied and verified`);
    console.log(`ASSERT: Grid restored to: ${result.resetRecordCount} records with "New" status`);
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
  // APPROVAL ACTION WORKFLOW TEST SUITE (REFACTORED INTO FOCUSED TESTS)
  // ==================================================================================

  test('Verify Approval Dialog Controls, Close and Reopen Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    const setupResult = await patientReferral.setupApprovalWorkflowTest(loginPage);
    
    if (setupResult.skipped) {
      console.log(`SKIP: ${setupResult.reason}`);
      test.skip();
      return;
    }

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
    const setupResult = await patientReferral.setupApprovalWorkflowTest(loginPage);
    
    if (setupResult.skipped) {
      console.log(`SKIP: ${setupResult.reason}`);
      test.skip();
      return;
    }

    console.log("STEP 2: Click Approve icon and open approval dialog...");
    await patientReferral.clickApproveAndOpenDialog();

    console.log("STEP 3: Verify and test status dropdown...");
    await patientReferral.verifyAndTestStatusDropdown();

    console.log("ASSERT: Status dropdown validation verified");
  });

  test('Verify Add Note Textarea, Faker Content, and Complete Data Persistence', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patientReferral = new PatientReferralPage(page);

    console.log("STEP 1: Navigate to Patient Referral Section...");
    const setupResult = await patientReferral.setupApprovalWorkflowTest(loginPage);
    if (setupResult.skipped) {
      console.log(`SKIP: ${setupResult.reason}`);
      test.skip();
      return;
    }

    console.log("STEP 2: Capture record name...");
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

});