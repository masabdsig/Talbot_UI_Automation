const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ClientContactsPage } = require('../pages/ClientContacts');
const { faker } = require('@faker-js/faker');

test.use({ storageState: 'authState.json' });

test.describe('Client Contacts Module Tests', () => {
//done
  test('Verify Client Contacts Tab Navigation and Controls', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    console.log("STEP 1: Navigate to Client Contacts tab...");
    await clientContacts.navigateToClientContactsTab(loginPage);

    console.log("STEP 2: Verify Client Contacts thumbnail is visible with count display...");
    await clientContacts.verifyClientContactsThumbnailVisible();
    const count = await clientContacts.verifyClientContactsCountDisplay();

    console.log("STEP 3: Click on the Client Contacts thumbnail...");
    await clientContacts.clickClientContactsThumbnail();

    console.log("STEP 4: Verify navigation to Client Contacts Section screen...");
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 5: Verify all controls visibility and functionality...");
    await clientContacts.validateAllControlsVisibility();

    console.log("STEP 6: Verify grid columns are displayed...");
    await clientContacts.validateGridColumns();

    await page.waitForTimeout(1000);

    console.log(`ASSERT: Successfully navigated to Client Contacts Section`);
    console.log(`ASSERT: Client Contacts thumbnail shows current count: ${count}`);
    console.log(`ASSERT: All controls and grid columns verified successfully`);
  });
//done
  test('Verify New Request Dialog Opening and Closing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Click New Request button...");
    await clientContacts.clickNewRequestButton();

    console.log("STEP 3: Verify dialog is visible...");
    await clientContacts.verifyDialogVisible();

    console.log("STEP 4: Verify dialog header...");
    const headerText = await clientContacts.verifyDialogHeader();
    expect(headerText).toContain('Client Contact');

    console.log("STEP 5: Verify close button...");
    await clientContacts.verifyCloseButton();

    console.log("STEP 6: Close dialog...");
    await clientContacts.closeDialog();

    console.log("STEP 7: Verify dialog is closed...");
    await clientContacts.verifyDialogClosed();

    console.log("STEP 8: Verify grid is visible...");
    await clientContacts.verifyGridVisible();

    console.log("ASSERT: New Request dialog opens and closes successfully");
  });
//done
  test('Create New Client Contact and Verify in Grid', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    // Generate test data using faker
    const contactData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number('##########'),
      notes: faker.lorem.sentence()
    };

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Get initial grid record count...");
    const initialRecordCount = await clientContacts.getGridRecordCount();

    console.log("STEP 3: Open New Request dialog...");
    await clientContacts.clickNewRequestButton();
    await clientContacts.verifyDialogVisible();

    console.log("STEP 4: Fill Client Contact form...");
    await clientContacts.fillClientContactForm(contactData);

    console.log("STEP 5: Save Client Contact...");
    await clientContacts.clickSaveButton();

    console.log("STEP 6: Verify dialog closed and record saved...");
    await clientContacts.verifyDialogClosed();
    await clientContacts.verifyGridVisible();
    await clientContacts.verifyRecordSavedInGrid(contactData);

    console.log("STEP 7: Verify grid record count increased by one...");
    const finalRecordCount = await clientContacts.getGridRecordCount();
    expect(finalRecordCount).toBe(initialRecordCount + 1);

    console.log("STEP 8: Verify thumbnail count matches records with 'New' status...");
    const { thumbnailCount, newStatusCount } = await clientContacts.verifyThumbnailCountMatchesNewStatusRecords();

    console.log("ASSERT: Client Contact created successfully");
    console.log(`ASSERT: Grid record count increased from ${initialRecordCount} to ${finalRecordCount}`);
    console.log(`ASSERT: Thumbnail count matches New status records (${thumbnailCount})`);
  });
//done
  test('Probation Portal Search Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await clientContacts.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Get first record data from grid for testing search...");
    const recordData = await clientContacts.getFirstRecordData();
    console.log(`STEP: Retrieved test data from first grid record - ${recordData.firstName} ${recordData.lastName}`);

    // TEST 1: Search by First Name
    console.log('\n🔍 TEST 1: Testing Search by First Name...');
    console.log(`STEP: Searching for First Name: "${recordData.firstName}"`);
    await clientContacts.searchByClientName(recordData.firstName);
    await clientContacts.clickSearchButton();
    const firstNameFilteredCount = await clientContacts.getGridRecordCountAfterSearch();
    expect(firstNameFilteredCount).toBeGreaterThan(0);
    
    console.log('STEP: Verify searched First Name exists in grid...');
    await clientContacts.verifyFirstNameInGrid(recordData.firstName);
    console.log(`✔️ Search by First Name works correctly - Found ${firstNameFilteredCount} result(s)`);

    // Reset filters for next test
    console.log('\nSTEP: Resetting filters after TEST 1...');
    await clientContacts.clickResetButton();
    await page.waitForTimeout(500);

    // TEST 2: Search by Last Name
    console.log('\n🔍 TEST 2: Testing Search by Last Name...');
    console.log(`STEP: Searching for Last Name: "${recordData.lastName}"`);
    await clientContacts.searchByClientName(recordData.lastName);
    await clientContacts.clickSearchButton();
    const lastNameFilteredCount = await clientContacts.getGridRecordCountAfterSearch();
    expect(lastNameFilteredCount).toBeGreaterThan(0);
    
    console.log('STEP: Verify searched Last Name exists in grid...');
    await clientContacts.verifyLastNameInGrid(recordData.lastName);
    console.log(`✔️ Search by Last Name works correctly - Found ${lastNameFilteredCount} result(s)`);

    // Final reset to restore grid to original state
    console.log('\nSTEP: Final reset of filters...');
    await clientContacts.clickResetButton();
    await page.waitForTimeout(500);

    console.log('\n✅ Probation Portal Search Functionality - PASSED');
  });
//done
  test('Verify Status Dropdown Functionality in Main Grid', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.resetStatusDropdownToNew(); 
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Verify default status selection...");
    await clientContacts.verifyDefaultStatusSelection();

    console.log("STEP 3: Ensure at least one record with New status exists...");
    const recordCount = await clientContacts.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 4: Store first 3 records from initial grid...");
    const initialRecords = await clientContacts.storeInitialRecords(3);

    console.log("STEP 5: Get available status options...");
    const availableStatuses = await clientContacts.getAvailableStatusOptions();
    expect(availableStatuses.length).toBeGreaterThan(0);
    expect(availableStatuses).toContain('New');

    console.log("STEP 6: Test each non-New status filter and verify grid records changed...");
    const statusesToTest = availableStatuses.filter(s => s !== 'New').slice(0, 2);
    for (const status of statusesToTest) {
      await clientContacts.verifyStatusFilterChangesGrid(status, initialRecords);
    }

    console.log("STEP 7: Reset to default 'New' status...");
    await clientContacts.selectStatusFromDropdown('New');
    await clientContacts.clickSearchButton();

    console.log("STEP 8: Verify initial grid records are restored after reset...");
    await clientContacts.verifyRecordsRestoredAfterReset(initialRecords);

    console.log(`\nASSERT: Status dropdown functionality verified with ${availableStatuses.length} status options`);
    console.log(`ASSERT: Grid records correctly changed when status filters applied`);
    console.log(`ASSERT: Initial records NOT found in filtered results (grid properly filtered)`);
    console.log(`ASSERT: All ${initialRecords.length} initial records restored after reset to 'New' status`);
  });
//Done
  test('Complete Client Contact Action Approval Flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.resetStatusDropdownToNew(); 
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await clientContacts.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Get first record data before completing...");
    let firstRecordData;
    try {
      firstRecordData = await clientContacts.getFirstRecordData();
    } catch (error) {
      console.log(`SKIP: Could not retrieve first record data: ${error.message}`);
      test.skip();
      return;
    }

    console.log("STEP 4: Click Complete icon on first record...");
    await clientContacts.clickCompleteIcon(0);

    console.log("STEP 5: Verify Add Note dialog is visible...");
    await clientContacts.verifyAddNoteDialogVisible();
    await clientContacts.verifyAddNoteDialogHeader();

    console.log("STEP 5a: Verify close button (cross mark icon) is visible and clickable...");
    await clientContacts.verifyAddNoteDialogCloseButton();

    console.log("STEP 5b: Test close button functionality - click to close the dialog...");
    await clientContacts.verifyAddNoteDialogCloseButtonAndClose();

    console.log("STEP 5c: Verify grid is visible after dialog closed...");
    await clientContacts.verifyGridVisible();

    console.log("STEP 5d: Click Complete icon again to reopen the Add Note dialog...");
    await clientContacts.clickCompleteIcon(0);

    console.log("STEP 5e: Verify Add Note dialog reopened...");
    await clientContacts.verifyAddNoteDialogVisible();
    await clientContacts.verifyAddNoteDialogHeader();

    console.log("STEP 5f: Verify Status dropdown is set to 'New' by default in dialog...");
    await clientContacts.verifyDefaultStatusInDialog();

    console.log("STEP 6: Fill note and select status...");
    const note = faker.lorem.sentence();
    const savedStatus = 'Completed-Appointment Scheduled';
    await clientContacts.fillAddReasonNote(note);
    await clientContacts.selectStatusInDialog(savedStatus);

    console.log("STEP 7: Save and verify success message...");
    await clientContacts.clickSaveInDialog();
    await clientContacts.verifySuccessMessage();

    console.log("STEP 8: Change status filter to saved status and verify record in grid...");
    await clientContacts.selectStatusFromDropdown(savedStatus);
    await clientContacts.clickSearchButton();
    
    console.log("STEP 9: Verify record is visible in grid with saved first name, last name and action notes...");
    await clientContacts.verifyRecordInGrid(firstRecordData.firstName, firstRecordData.lastName, note);

    console.log("ASSERT: Complete action executed successfully");
    console.log(`ASSERT: Record saved with status "${savedStatus}"`);
    console.log(`ASSERT: Record visible in grid with First Name: "${firstRecordData.firstName}", Last Name: "${firstRecordData.lastName}"`);
    console.log(`ASSERT: Action notes visible in grid: "${note.substring(0, 50)}..."`);
  });
//Done
  test('Reject Client Contact Action', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await clientContacts.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Get first record data before rejecting...");
    let firstRecordData;
    try {
      firstRecordData = await clientContacts.getFirstRecordData();
    } catch (error) {
      console.log(`SKIP: Could not retrieve first record data: ${error.message}`);
      test.skip();
      return;
    }

    console.log("STEP 4: Click Reject icon on first record...");
    await clientContacts.clickRejectIcon(0);

    console.log("STEP 5: Verify Add Note dialog is visible...");
    await clientContacts.verifyAddNoteDialogVisible();
    await clientContacts.verifyAddNoteDialogHeader();

    console.log("STEP 5a: Verify close button (cross mark icon) is visible and clickable...");
    await clientContacts.verifyAddNoteDialogCloseButton();

    console.log("STEP 5b: Test close button functionality - click to close the dialog...");
    await clientContacts.verifyAddNoteDialogCloseButtonAndClose();

    console.log("STEP 5c: Verify grid is visible after dialog closed...");
    await clientContacts.verifyGridVisible();

    console.log("STEP 5d: Click Reject icon again to reopen the Add Note dialog...");
    await clientContacts.clickRejectIcon(0);

    console.log("STEP 5e: Verify Add Note dialog reopened...");
    await clientContacts.verifyAddNoteDialogVisible();
    await clientContacts.verifyAddNoteDialogHeader();

    console.log("STEP 6: Fill rejection note...");
    const rejectionNote = `Rejected: ${faker.lorem.sentence()}`;
    await clientContacts.fillAddReasonNote(rejectionNote);

    console.log("STEP 7: Save rejection and verify success message...");
    await clientContacts.clickSaveInDialog();
    await clientContacts.verifyRejectSuccessMessage();

    console.log("STEP 8: Change status filter to Rejected and verify record in grid...");
    await clientContacts.selectStatusFromDropdown('Rejected');
    await clientContacts.clickSearchButton();

    console.log("STEP 9: Verify first record contains the rejected first name, last name and rejection notes...");
    await clientContacts.verifyRecordInGrid(firstRecordData.firstName, firstRecordData.lastName, rejectionNote);

    console.log("ASSERT: Reject action executed successfully");
    console.log(`ASSERT: Record found with status "Rejected"`);
    console.log(`ASSERT: Record visible in grid with First Name: "${firstRecordData.firstName}", Last Name: "${firstRecordData.lastName}"`);
    console.log(`ASSERT: Rejection notes visible in grid: "${rejectionNote.substring(0, 50)}..."`);
  });
//Done
  test('Reset Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await clientContacts.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Store first 3 records data before applying filters...");
    const recordsToVerify = [];
    const recordsToStore = Math.min(3, recordCount);
    for (let i = 0; i < recordsToStore; i++) {
      const recordData = await clientContacts.getRecordDataByIndex(i);
      recordsToVerify.push(recordData);
      console.log(`DEBUG: Stored record ${i + 1}: ${recordData.firstName} ${recordData.lastName}`);
    }

    console.log("STEP 4: Performing complete reset functionality test...");
    const result = await clientContacts.performCompleteResetFunctionalityTest(loginPage);
    
    console.log(`ASSERT: Initial grid state: ${result.initialRecordCount} records with "New" status`);
    console.log(`ASSERT: Applied filter: Changed status to "${result.selectedStatus}"`);
    console.log(`ASSERT: Filtered grid result: ${result.filteredRecordCount} records`);
    console.log(`ASSERT: Reset applied and verified - count restored to ${result.resetRecordCount}`);
    console.log(`ASSERT: Search field and status dropdown reset to defaults`);

    console.log("STEP 5: Verify stored records exist in grid after reset...");
    for (let i = 0; i < recordsToVerify.length; i++) {
      const record = recordsToVerify[i];
      console.log(`STEP 5.${i + 1}: Verifying record ${i + 1}: "${record.firstName} ${record.lastName}"...`);
      await clientContacts.verifyRecordInGrid(record.firstName, record.lastName);
    }

    console.log("ASSERT: Reset Functionality test passed - All stored records verified in grid after reset");
  });

  test('Verify Grid Data Display and Action Icons', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const clientContacts = new ClientContactsPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await clientContacts.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Verify all grid column headers are visible...");
    await clientContacts.validateGridColumns();

    if (recordCount > 0) {
      console.log("STEP 5: Verify grid has data...");
      const hasData = await clientContacts.verifyGridDataDisplay();
      expect(hasData).toBe(true);

      console.log("STEP 6: Verify grid column data is displayed for first 3 records...");
      const recordsToCheck = Math.min(recordCount, 3);
      await clientContacts.verifyGridColumnDataDisplay(recordsToCheck);
      console.log(`DEBUG: Verified grid column data for ${recordsToCheck} records`);

      console.log("STEP 7: Verify Action column contains Complete and Reject icons for first 3 records...");
      await clientContacts.verifyActionColumnIcons(recordsToCheck);
      console.log(`DEBUG: Verified action icons for ${recordsToCheck} records`);
    }

    console.log(`ASSERT: Grid contains ${recordCount} records with all columns visible`);
    console.log(`ASSERT: Complete and Reject action icons verified for first ${Math.min(recordCount, 3)} records`);
  });
//This will fail bcz of phone number sorting not working.
  test('Column Sorting Validation', async ({ page }) => {
    const clientContacts = new ClientContactsPage(page);
    const loginPage = new LoginPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Verify grid has minimum records for sorting...");
    const recordCount = await clientContacts.getGridRecordCount();

    if (recordCount < 2) {
      console.log(`SKIP: Only ${recordCount} record(s) available. Sorting requires 2+ records.`);
      test.skip();
      return;
    }

    console.log("STEP 3: Ensure at least one record with New status exists...");
    await clientContacts.ensureRecordWithNewStatusExists();

    console.log("STEP 4: Test column sorting with multi-click validation...");
    const columnsToTest = [
      { index: 0, name: 'First Name' },
      { index: 1, name: 'Last Name' },
      { index: 2, name: 'Email' },
      { index: 3, name: 'Phone Number' },
      { index: 4, name: 'Client Notes'},
      { index: 5, name: 'Action Notes' },
    ];

    for (const column of columnsToTest) {
      console.log(`\n🧪 Testing Column: ${column.name} (Index: ${column.index})`);
      try {
        await clientContacts.testColumnSorting(column.index, column.name);
      } catch (error) {
        console.error(`❌ ERROR testing ${column.name}: ${error.message}`);
        throw error;
      }
    }

    console.log(`\n✅ ASSERTION: Grid contains ${recordCount} records for sorting validation`);
    console.log(`✅ ASSERTION: All ${columnsToTest.length} columns tested successfully`);
    console.log(`✅ ASSERTION: Each column tested for:`);
    console.log(`   - Ascending order (1st click)`);
    console.log(`   - Descending order (2nd click)`);
    console.log(`   - Reset to original order (3rd click)`);
  });

  test('Verify Grid Columns Display Information Against Each Record', async ({ page }) => {
    const clientContacts = new ClientContactsPage(page);
    const loginPage = new LoginPage(page);

    console.log("STEP 1: Navigate to Client Contacts Section...");
    await clientContacts.navigateToClientContactsTab(loginPage);
    await clientContacts.clickClientContactsThumbnail();
    await clientContacts.verifyNavigationToClientContactsSection();

    console.log("STEP 2: Ensure at least one record with New status exists...");
    const recordCount = await clientContacts.ensureRecordWithNewStatusExists();
    expect(recordCount).toBeGreaterThan(0);

    console.log("STEP 3: Verify all grid columns are visible...");
    await clientContacts.validateGridColumns();

    console.log("STEP 4: Verify grid columns display data for records...");
    const columnsToValidate = [
      { index: 0, name: 'First Name' },
      { index: 1, name: 'Last Name' },
      { index: 2, name: 'Email' },
      { index: 3, name: 'Phone Number' },
      { index: 4, name: 'Client Notes' }
    ];

    // Get data for first 5 records to validate columns
    const recordsToCheck = Math.min(recordCount, 5);
    console.log(`STEP 5: Checking data display in ${columnsToValidate.length} column(s) for first ${recordsToCheck} record(s)...`);

    for (let recordIdx = 0; recordIdx < recordsToCheck; recordIdx++) {
      const recordData = await clientContacts.getRecordDataByIndex(recordIdx);
      console.log(`\nRecord ${recordIdx + 1}: ${recordData.firstName} ${recordData.lastName}`);
      
      // Verify each field is populated using dedicated methods
      await clientContacts.verifyRecordFirstNamePopulated(recordData);
      await clientContacts.verifyRecordLastNamePopulated(recordData);
      await clientContacts.verifyRecordEmailPopulated(recordData);
      await clientContacts.verifyRecordPhonePopulated(recordData);
      await clientContacts.verifyRecordClientNotesPopulated(recordData);
    }

    console.log(`\n✅ ASSERTION: All ${columnsToValidate.length} columns display information correctly`);
    console.log(`✅ ASSERTION: First Name, Last Name, Email, Phone Number are populated for all ${recordsToCheck} record(s)`);
    console.log(`✅ ASSERTION: Grid columns verified: First Name, Last Name, Email, Phone Number, Client Notes, Action By, Action Notes`);
  });

});
