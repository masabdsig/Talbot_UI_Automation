const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const { LoginPage } = require('../pages/LoginPage');
const { FollowupReferralsPage } = require('../pages/FollowupReferrals');

test.use({ storageState: 'authState.json' });

test.describe('Referrals List Display and Pagination', () => {

  test('TC00: Verify all search, filter, and action controls are loaded and visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
  
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();

    console.log("STEP 3: Verify all controls are visible and clickable...");
    await followupReferrals.verifyAllControlsVisibleAndClickable();

    console.log('\n✔️ [TC00] All controls visibility and clickability test completed successfully');
  });

  test('TC01: Widget, Columns, and Data Validation', async ({ page }) => {
    const followupReferrals = new FollowupReferralsPage(page);
  
    await followupReferrals.navigateToFollowupReferrals();
    await followupReferrals.openWidget();
    await followupReferrals.waitForGridStable();
    await followupReferrals.verifyDynamicCount();
    await followupReferrals.verifyGridStructureAndColumns();
    await followupReferrals.verifyGridDataValidity();
  
    console.log('\n✔️ [TC01] Test completed successfully');
  });

  test('TC02: Verify Grid Data Display and Action Icons', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);

    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();
    
    const recordCount = await followupReferrals.getGridRecordCount();
    expect(recordCount).toBeGreaterThan(0);

    await followupReferrals.verifyGridStructureAndColumns();

    if (recordCount > 0) {
      const hasData = await followupReferrals.verifyGridDataDisplay();
      expect(hasData).toBe(true);
      
      const recordsToCheck = Math.min(recordCount, 3);
      await followupReferrals.verifyGridColumnDataDisplay(recordsToCheck);

      console.log("STEP 7: Verify Action column contains icons for first 3 records...");
      await followupReferrals.verifyActionColumnIcons(recordsToCheck);
    }

    console.log(`\nASSERT: Grid contains ${recordCount} records with all columns visible`);
    console.log(`ASSERT: Action icons verified for first ${Math.min(recordCount, 3)} records`);
    console.log('\n✔️ [TC02] Grid data display and action icons test completed');
  });

  test('TC03: Column sorting functionality with data validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();

    console.log("STEP 3: Verify grid has minimum records for sorting...");
    const recordCount = await followupReferrals.getGridRecordCount();

    if (recordCount < 5) {
      console.log(`SKIP: Only ${recordCount} record(s) available. Data validation sorting requires 5+ records.`);
      test.skip();
      return;
    }

    console.log("Test column sorting with data validation...");
    const columnsToTest = [
      { index: 0, name: 'Patient Id', type: 'numeric' },
      { index: 1, name: 'Patient Name', type: 'string' },
      { index: 2, name: 'Description', type: 'string' },
      { index: 3, name: 'Due Date', type: 'date' },
      { index: 4, name: 'Status', type: 'string' },
      { index: 5, name: 'Phone Number', type: 'string' },
      { index: 6, name: 'Provider', type: 'string' },
    ];

    for (const column of columnsToTest) {
      await followupReferrals.testColumnSorting(column.index, column.name);
    }

    console.log(`\n✅ ASSERTION: Grid contains ${recordCount} records`);
    console.log(`✅ ASSERTION: All ${columnsToTest.length} columns passed sorting validation`);
  });



  test('TC05: Patient Search Filter with First and Last Name', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('\n➡️ [TC05] Testing patient search filter...');
    
    console.log("STEP 1: Navigate to Followup Referrals section...");
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();

    const recordData = await followupReferrals.getFirstRecordData();
    console.log(`STEP: Retrieved test data - Patient: ${recordData.patientName} (ID: ${recordData.patientId}), First Name: ${recordData.firstName}, Last Name: ${recordData.lastName}`);

      // Guard clause for invalid data
    if (!recordData.firstName || !recordData.lastName) {
      console.log('SKIP: First record missing valid name data');
      test.skip();
      return;
    }

    // TEST 1: Search by First Name
    console.log('\n🔍 TEST 1: Testing Search by First Name...');
    console.log(`STEP: Searching for First Name: "${recordData.firstName}"`);
    await followupReferrals.enterSearchByPatient(recordData.firstName);
    await followupReferrals.clickSearchButton();
    const firstNameFilteredCount = await followupReferrals.getGridRecordCountAfterSearch();
    expect(firstNameFilteredCount).toBeGreaterThan(0);
    
    console.log('STEP: Verify searched First Name exists in grid...');
    await followupReferrals.verifyFirstNameInGrid(recordData.firstName);
    console.log(`✔️ Search by First Name works correctly - Found ${firstNameFilteredCount} result(s)`);

    // Reset filters for next test
    console.log('\nSTEP: Resetting filters after TEST 1...');
    await followupReferrals.resetFilters();
    await page.waitForTimeout(500);

    // TEST 2: Search by Last Name
    console.log('\n🔍 TEST 2: Testing Search by Last Name...');
    console.log(`STEP: Searching for Last Name: "${recordData.lastName}"`);
    await followupReferrals.enterSearchByPatient(recordData.lastName);
    await followupReferrals.clickSearchButton();
    const lastNameFilteredCount = await followupReferrals.getGridRecordCountAfterSearch();
    expect(lastNameFilteredCount).toBeGreaterThan(0);
    
    console.log('STEP: Verify searched Last Name exists in grid...');
    await followupReferrals.verifyLastNameInGrid(recordData.lastName);
    console.log(`✔️ Search by Last Name works correctly - Found ${lastNameFilteredCount} result(s)`);

    // Final reset to restore grid to original state
    console.log('\nSTEP: Final reset of filters...');
    await followupReferrals.resetFilters();
    await page.waitForTimeout(500);

    console.log('\n Patient Search Filter with First and Last Name - PASSED');
  }); 

  test('TC06: Providers Dropdown Selection and Reset', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('\n➡️ [TC06] Testing Providers Dropdown Selection...');
    
    console.log("STEP 1: Navigate to Followup Referrals section...");
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();

    // Get provider options and limit to first 5
    console.log('STEP 3: Get available provider options (first 5)...');
    const allProviderOptions = await followupReferrals.getDropdownOptions(followupReferrals.selectProvidersDropdown);
    expect(allProviderOptions.length).toBeGreaterThan(0);
    const providerOptions = allProviderOptions.slice(0, 5);
    console.log(`ASSERT: Retrieved ${providerOptions.length} provider options: ${providerOptions.join(', ')}`);
    
    // Select 2 providers from the first 5
    console.log('STEP 4: Select 2 providers dynamically...');
    const selectedProviders = providerOptions.slice(0, 2);
    await followupReferrals.selectProviders(selectedProviders);
    console.log(`✔️ Selected providers: ${selectedProviders.join(', ')}`);

    // Click search to apply filter
    console.log('STEP 5: Click Search button to apply provider filter...');
    await followupReferrals.clickSearchButton();
    await followupReferrals.waitForGridStable();
    const recordCount = await followupReferrals.getGridRecordCount();
    console.log(`✔️ Search applied - Grid displays ${recordCount} records`);

    // Verify selected providers exist in grid rows
    console.log('STEP 5.5: Verify selected providers are displayed in grid rows...');
    await followupReferrals.verifyProvidersInGridRows(selectedProviders);
    console.log(`✔️ All selected providers verified in grid data`);

    // Reset and verify
    console.log('STEP 6: Click Reset button to clear all selections...');
    await followupReferrals.resetFilters();
    await followupReferrals.waitForGridStable();
    
    console.log('STEP 7: Verify Providers dropdown is reset to default state...');
    await followupReferrals.verifyProvidersDropdownReset();

    console.log('\n✅ [TC06] Providers Dropdown test completed successfully');
  });


  test('TC09: Status Dropdown Selection and Reset', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('\n➡️ [TC09] Testing Status Dropdown Selection...');
    
    console.log("STEP 1: Navigate to Followup Referrals section...");
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();

    // Get status options and limit to first 5
    console.log('STEP 3: Get available status options (first 5)...');
    const allStatusOptions = await followupReferrals.getDropdownOptions(followupReferrals.statusDropdown);
    expect(allStatusOptions.length).toBeGreaterThan(0);
    const statusOptions = allStatusOptions.slice(0, 5);
    console.log(`ASSERT: Retrieved ${statusOptions.length} status options: ${statusOptions.join(', ')}`);
    
    // Select first status
    console.log('STEP 4: Select status dynamically...');
    const selectedStatus = statusOptions[0];
    await followupReferrals.selectReferralStatus(selectedStatus);
    console.log(`✔️ Selected status: ${selectedStatus}`);

    // Click search to apply filter
    console.log('STEP 5: Click Search button to apply status filter...');
    await followupReferrals.clickSearchButton();
    await followupReferrals.waitForGridStable();
    const recordCount = await followupReferrals.getGridRecordCount();
    console.log(`✔️ Search applied - Grid displays ${recordCount} records`);

    // Verify status filter is applied
    console.log('STEP 5.5: Verify status filter is applied in grid...');
    await followupReferrals.verifyStatusInGridRows(selectedStatus);
    console.log(`✔️ Status filter verified in grid data`);

    // Reset and verify
    console.log('STEP 6: Click Reset button to clear all selections...');
    await followupReferrals.resetFilters();
    await followupReferrals.waitForGridStable();
    
    console.log('STEP 7: Verify Status dropdown is reset to default state (Open)...');
    await followupReferrals.verifyStatusDropdownReset();

    console.log('\n✅ [TC09] Status Dropdown test completed successfully');
  });

  test('TC10: Location, Assigned Filters with Search and Reset', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('\n➡️ [TC10] Testing Location and Assigned Filters with Search and Reset...');
    
    console.log("STEP 1: Navigate to Followup Referrals section...");
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();

    // Get location and assigned options
    console.log('STEP 3: Get available location and assigned options (first 5 each)...');
    const allLocationOptions = await followupReferrals.getDropdownOptions(followupReferrals.selectLocationsDropdown);
    const locationOptions = allLocationOptions.slice(0, 5);
    
    const allAssignedOptions = await followupReferrals.getDropdownOptions(followupReferrals.assignedDropdown);
    const assignedOptions = allAssignedOptions.slice(0, 5);
    
    console.log(`ASSERT: Retrieved options - Locations: ${locationOptions.length}, Assigned: ${assignedOptions.length}`);
    
    // Select values from dropdowns
    console.log('STEP 4: Select location and assigned filters...');
    const selectedLocation = locationOptions[0];
    const selectedAssigned = assignedOptions.find(opt => opt !== 'All') || assignedOptions[0];
    
    await followupReferrals.selectLocations([selectedLocation]);
    await followupReferrals.selectAssignedStatus(selectedAssigned);
    
    console.log(`✔️ Selected filters:`);
    console.log(`  - Location: ${selectedLocation}`);
    console.log(`  - Assigned: ${selectedAssigned}`);

    // Add search text
    console.log('STEP 5: Enter search text in Search by Patient field...');
    const searchText = 'test';
    await followupReferrals.enterSearchByPatient(searchText);
    console.log(`✔️ Search text entered: "${searchText}"`);

    // Click search button
    console.log('STEP 6: Click Search button with filters and search text...');
    await followupReferrals.clickSearchButton();
    await followupReferrals.waitForGridStable();
    
    const recordCount = await followupReferrals.getGridRecordCount();
    console.log(`✔️ Search executed - Grid displays ${recordCount} records`);

    // Reset and verify
    console.log('STEP 7: Click Reset button to clear all selections and search...');
    await followupReferrals.resetFilters();
    await followupReferrals.waitForGridStable();
    
    console.log('STEP 8: Verify all filters and search are reset to defaults...');
    await followupReferrals.verifySearchByPatientIsEmpty();
    await followupReferrals.verifyLocationsDropdownReset();
    await followupReferrals.verifyAssignedDropdownReset();
    console.log(`✔️ All filters and search text reset successfully to default state`);

    console.log('\n✅ [TC10] Location, Assigned Filters with Search and Reset test completed successfully');
  });

  test('TC11: Verify Add Followup Referral Popup Display', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('Testing Add Followup Referral Popup Display...');
    
    console.log('STEP 1: Navigate to Followup Referrals screen...');
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();
    
    console.log('STEP 2: Click on the Add Followup Referral button...');
    await followupReferrals.clickAddFollowupReferralButton();
    
    console.log('STEP 3-9: Verify popup content and elements...');
    await followupReferrals.verifyAddFollowupReferralPopupDisplayed();
    
    console.log('Popup Display test completed successfully');
  });

  test('TC12: Verify Close Icon and Cancel Button Functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('Testing Close Icon and Cancel Button Functionality...');
    
    console.log('STEP 1: Navigate to Followup Referrals screen...');
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();
    
    // ========== TEST 1: Close Icon Functionality ==========
    console.log('TEST 1: Verify Close Icon (X) functionality...');
    
    console.log('STEP 2: Click on the Add Followup Referral button...');
    await followupReferrals.clickAddFollowupReferralButton();
    
    console.log('STEP 3: Click on the close icon (X) on the popup header...');
    await followupReferrals.closePopupWithCloseButton();
    
    console.log('STEP 4: Verify popup is closed and user returns to grid...');
    await followupReferrals.verifyUserReturnedToGrid();
    
    console.log('PASSED: Close icon works correctly\n');
    
    // ========== TEST 2: Cancel Button Functionality ==========
    console.log('Verify Cancel Button functionality...');
    
    console.log('STEP 5: Click on the Add Followup Referral button again...');
    await followupReferrals.clickAddFollowupReferralButton();
    
    console.log('STEP 6: Verify popup is displayed again...');
    await expect(followupReferrals.addFollowupReferralPopup).toBeVisible();
    console.log('ASSERT: Add Followup Referral popup is displayed again');
    
    console.log('STEP 7: Click on the Cancel button...');
    await followupReferrals.closePopupWithCancelButton();
    
    console.log('STEP 8: Verify popup is closed and user returns to grid...');
    await followupReferrals.verifyUserReturnedToGrid();
    
    console.log('Cancel button works correctly\n');
    
    console.log('Close Icon and Cancel Button test completed successfully');
  });

  
  test('TC13: Verify Patient Search Functionality in Add Popup', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('\n➡️ [TC13] Testing Patient Search Functionality in Add Popup...');
    
    console.log('STEP 1: Navigate to Followup Referrals section...');
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();
    
    console.log('STEP 2: Get first row patient name from grid for verification...');
    const firstRowData = await followupReferrals.getFirstRecordData();
    const gridPatientName = firstRowData.patientName;
    const gridFirstName = firstRowData.firstName;
    const gridLastName = firstRowData.lastName;
    console.log(`ASSERT: Retrieved first row patient - Name: ${gridPatientName}, First: ${gridFirstName}, Last: ${gridLastName}`);
    
    console.log('STEP 3: Click on the Add Followup Referral button...');
    await followupReferrals.clickAddFollowupReferralButton();
    
    console.log('STEP 4: Verify popup is displayed...');
    await expect(followupReferrals.addFollowupReferralPopup).toBeVisible();
    console.log('ASSERT: Add Followup Referral popup is displayed');
    
    // ========== TEST 1: Search by First Name ==========
    console.log('\n TEST 1: Verify Patient Search by First Name...');
    
    console.log(`STEP 5: Search for patient using first name "${gridFirstName}"...`);
    await followupReferrals.searchAndVerifyPatientInPopup(gridFirstName, gridPatientName);
    
    // ========== TEST 2: Search by Last Name ==========
    console.log('\n TEST 2: Verify Patient Search by Last Name...');
    
    console.log('STEP 6: Clear patient search field...');
    await followupReferrals.clearPatientSearchField();
    
    console.log(`STEP 7: Search for patient using last name "${gridLastName}"...`);
    await followupReferrals.searchAndVerifyPatientInPopup(gridLastName, gridPatientName);
    
    // ========== CLEANUP: Close Popup ==========
    console.log('\nSTEP 8: Close popup with Cancel button...');
    await followupReferrals.closePopupWithCancelButton();
    
    console.log('STEP 9: Verify user returned to grid...');
    await followupReferrals.verifyUserReturnedToGrid();
    
    console.log('\n[TC13] Patient Search Functionality in Add Popup test completed successfully');
  });

  test('TC14: Verify Save Functionality for Valid Data in Add Popup', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('\n➡️ [TC14] Testing Save Functionality for Valid Data in Add Popup...');
    
    // ========== NAVIGATION & SETUP ==========
    console.log('STEP 1: Navigate to Followup Referrals section...');
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();
    
    console.log('STEP 2: Get first row patient data...');
    const firstRowData = await followupReferrals.getFirstRecordData();
    const gridPatientName = firstRowData.patientName;
    console.log(`ASSERT: Retrieved grid patient - ${gridPatientName}`);
    
    // ========== TEST 1: SAVE WITH VALID DATA ==========
    console.log('\n TEST 1: Verify Save Functionality...');
    
    console.log('STEP 3: Click Add Followup Referral button...');
    await followupReferrals.clickAddFollowupReferralButton();
    
    console.log('STEP 4: Verify popup is displayed...');
    await expect(followupReferrals.addFollowupReferralPopup).toBeVisible();
    console.log('ASSERT: Add Followup Referral popup displayed');
    
    console.log('STEP 5: Attempt to save referral with retry logic...');
    const saveResult = await followupReferrals.saveReferralWithRetry(gridPatientName, 3);
    
    expect(saveResult.success).toBe(true);
    console.log(`ASSERT: Referral saved successfully on attempt ${saveResult.attempt}`);
    
    // ========== TEST 2: VERIFY IN GRID ==========
    console.log('\n TEST 2: Verify Saved Referral in Grid...');
    
    console.log('STEP 6: Wait for grid to stabilize...');
    await followupReferrals.waitForGridStable();
    
    console.log('STEP 7: Verify new referral appears in grid...');
    const foundInGrid = await followupReferrals.verifyNewReferralInGrid(gridPatientName, saveResult.description);
    expect(foundInGrid).toBe(true);
    console.log(`ASSERT: New referral verified in grid with patient "${gridPatientName}"`);
    
    console.log('\n[TC14] Save Functionality test completed successfully');
  });

  test('TC15: Verify Save Functionality with Search Character and Multiple Patients', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const followupReferrals = new FollowupReferralsPage(page);
    
    console.log('\n[TC15] Testing Save with Search Character and Multiple Patients...');
    
    // ========== NAVIGATION & SETUP ==========
    console.log('STEP 1: Navigate to Followup Referrals section...');
    await followupReferrals.directNavigateToFollowupReferrals(loginPage);
    await followupReferrals.waitForGridStable();
    
    // ========== TEST 1: SAVE WITH CHARACTER SEARCH ==========
    console.log('\n TEST 1: Verify Save with Character Search...');
    
    console.log('STEP 2: Click Add Followup Referral button...');
    await followupReferrals.clickAddFollowupReferralButton();
    
    console.log('STEP 3: Verify popup is displayed...');
    await expect(followupReferrals.addFollowupReferralPopup).toBeVisible();
    console.log('ASSERT: Add Followup Referral popup displayed');
    
    console.log('STEP 4: Attempt to save referral by searching with character and trying patients...');
    const saveResult = await followupReferrals.saveReferralWithSearchCharacter('a', 5);
    
    if (!saveResult.success) {
      console.log('INFO: Character "a" did not yield results, trying alternative characters...');
      const multiCharResult = await followupReferrals.tryMultipleSearchCharacters(['a', 'e', 'i', 'o', 'p'], 5);
      
      expect(multiCharResult.success).toBe(true);
      console.log(`ASSERT: Referral saved with character "${multiCharResult.searchChar}" on attempt ${multiCharResult.attempt}`);
      
      // ========== TEST 2: VERIFY IN GRID ==========
      console.log('\n TEST 2: Verify Saved Referral in Grid...');
      
      console.log('STEP 5: Wait for grid to stabilize...');
      await followupReferrals.waitForGridStable();
      
      console.log('STEP 6: Verify new referral appears in grid...');
      const foundInGrid = await followupReferrals.verifyNewReferralInGrid(multiCharResult.patient, multiCharResult.description);
      expect(foundInGrid).toBe(true);
      console.log(`ASSERT: New referral verified in grid with patient "${multiCharResult.patient}"`);
    } else {
      console.log(`ASSERT: Referral saved with character "a" on attempt ${saveResult.attempt}`);
      
      // ========== TEST 2: VERIFY IN GRID ==========
      console.log('\n TEST 2: Verify Saved Referral in Grid...');
      
      console.log('STEP 5: Wait for grid to stabilize...');
      await followupReferrals.waitForGridStable();
      
      console.log('STEP 6: Verify new referral appears in grid...');
      const foundInGrid = await followupReferrals.verifyNewReferralInGrid(saveResult.patient, saveResult.description);
      expect(foundInGrid).toBe(true);
      console.log(`ASSERT: New referral verified in grid with patient "${saveResult.patient}"`);
    }
    
    console.log('\n[TC15] Save with Search Character test completed successfully');
  });

});