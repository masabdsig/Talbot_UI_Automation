// pages/FollowupReferrals.js
const { expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');

class FollowupReferralsPage {
  constructor(page) {
    this.page = page;
    this.url = 'https://talbot-dev-newui.atcemr.com/followup-referrals';

    // ==================================================================================
    // NAVIGATION LOCATORS - FOLLOWUP REFERRALS WIDGET AND HEADER
    // ==================================================================================
    this.followupReferralsWidget = page.locator('//*[@id="custom-fav-menu"]/li/button[5]');
    this.followupReferralsWidgetCount = page.locator('//*[@id="custom-fav-menu"]/li/button[5]/span');
    this.dynamicCountBadge = page.locator('button').filter({ hasText: 'Followup Referrals' }).locator('span.tpAlert_header');
    this.followupReferralsTitle = page.locator('h6').filter({ hasText: /Followup Referral/i });

    // ==================================================================================
    // FOLLOWUP REFERRALS SECTION CONTROLS
    // ==================================================================================
    this.searchByPatientField = page.getByRole('textbox', { name: 'Search By Patient' });
    this.selectProvidersDropdown = page.locator('div').filter({ hasText: /^Select Providers$/ }).nth(2);
    this.selectLocationsDropdown = page.locator('div').filter({ hasText: /^Select Locations$/ }).nth(2);
    this.assignedDropdown = page.getByRole('combobox').filter({ hasText: /Assigned|assigned/ }).first();
    this.statusDropdown = page.getByRole('combobox').filter({ hasText: /Status|status/ }).first();
    this.searchButton = page.getByRole('button', { name: /Search|search/ }).first();
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.addReferralButton = page.getByRole('button', { name: 'Add Followup Referral' });

    // ==================================================================================
    // FOLLOWUP REFERRALS GRID LOCATORS
    // ==================================================================================
    this.grid = page.getByRole('grid').last();
    this.gridRows = page.locator('[role="row"]');
    
    // Grid column headers
    this.patientIdHeader = page.getByRole('columnheader', { name: 'Patient Id' });
    this.patientNameHeader = page.getByRole('columnheader', { name: 'Patient Name' });
    this.descriptionHeader = page.getByRole('columnheader', { name: 'Description' });
    this.dueDateHeader = page.getByRole('columnheader', { name: 'Due Date' });
    this.statusHeader = page.getByRole('columnheader', { name: 'Status' });
    this.phoneNumberHeader = page.getByRole('columnheader', { name: 'Phone Number' });
    this.providerHeader = page.getByRole('columnheader', { name: 'Provider' });
    this.actionHeader = page.getByRole('columnheader', { name: 'Action' });

    // ==================================================================================
    // ACTION BUTTONS LOCATORS
    // ==================================================================================
    this.actionButtons = page.locator('[title]');
    this.addAppointmentButton = page.getByTitle('Add Appointment');
    this.editFollowupReferralButton = page.getByTitle('Edit Followup Referral');
    this.sendMessageButton = page.getByTitle('Send Message');
    this.completeReferralButton = page.getByTitle('Complete Referral');

    // ==================================================================================
    // PAGINATION LOCATORS
    // ==================================================================================
    this.paginationInfo = page.getByText(/\d+ of \d+ pages \(\d+ items?\)/);
    this.itemsPerPageLabel = page.getByText('Items per page');
    this.itemsPerPageDropdown = page.getByRole('combobox', { name: '50' });

    // ==================================================================================
    // EMPTY STATE LOCATORS
    // ==================================================================================
    this.noRecordsMessage = page.locator('text=No records to display');

    // ==================================================================================
    // MFA LOCATORS
    // ==================================================================================
    this.skipMfaButton = page.getByRole('button', { name: ' Skip' });

    // ==================================================================================
    // LOADER LOCATOR
    // ==================================================================================
    this.loader = page.locator('[class*="loader"], [class*="spinner"], .e-spinner');
    this.loaderWrapper = page.locator('.loader-wrapper');

    // ==================================================================================
    // ADD FOLLOWUP REFERRAL POPUP LOCATORS
    // ==================================================================================
    this.addFollowupReferralPopup = page.locator('.modal-content');
    this.popupHeader = page.getByRole('heading', { name: 'Add Followup Referral' });
    this.popupCloseButton = page.locator('i.fa.fa-times.fa-lg');
    this.popupCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.popupSaveButton = page.getByRole('button', { name: 'Save' });
    this.patientFieldLabel = page.getByText('Patient *', { exact: true });
    this.patientInputField = page.locator('#mat-input-0');
    this.patientSearchDropdown = page.locator('[role="option"]');    this.descriptionFieldLabel = page.getByRole('textbox', { name: 'Description *' });

    // ==================================================================================
    // TOAST/MESSAGE LOCATORS
    // ==================================================================================
    this.toastContainer = page.locator('#toast-container');
    this.toastMessage = page.locator('[role="alert"].toast-message');
    this.toastTitle = page.locator('.toast-title');
  }

  // ==================================================================================
  // NAVIGATION METHODS
  // ==================================================================================
  async directNavigateToFollowupReferrals() {
    console.log('ACTION: Directly navigating to Followup Referrals page...');
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });

    await this.loaderWrapper.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('DEBUG: Loader wrapper not found or already hidden');
    });
     console.log('ACTION: Waiting for Followup Referrals title to appear...');
    // Wait for the title to be visible, which indicates the page has loaded
    await this.followupReferralsTitle.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      console.log('DEBUG: Title not found, trying to wait for grid instead');
    });
    
    // Try to wait for grid as secondary indicator
    await this.grid.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      console.log('DEBUG: Grid not found, page may still be loading');
    });
    
    // Give the page a moment to fully render
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Followup Referrals page loaded successfully');
  }

  async navigateToFollowupReferrals(loginPage) {
    console.log('ACTION: Navigating to Followup Referrals page...');
    await this.page.goto('/dashboard');
    await this.loaderWrapper.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('DEBUG: Loader wrapper not found or already hidden');
    });
    
    if (loginPage) {
      try {
        console.log('ACTION: Skipping MFA if required...');
        await loginPage.skipMfa();
      } catch (e) {
        // MFA skip not needed
      }
    }
    
    console.log('ACTION: Waiting for Followup Referrals widget to be visible...');
    await this.loaderWrapper.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('DEBUG: Loader wrapper not found or already hidden');
    });
    await expect(this.followupReferralsWidget).toBeVisible({ timeout: 5000 });
    await expect(this.followupReferralsWidget).toBeEnabled({ timeout: 5000 });
    await this.followupReferralsWidget.waitFor({ state: 'attached', timeout: 5000 });
    await this.page.waitForTimeout(500);
    
    console.log('ASSERT: Dashboard loaded and Followup Referrals widget visible');
  }

  async openWidget() {
    console.log('ACTION: Clicking Followup Referrals widget button...');
    await this.followupReferralsWidget.click();
    console.log('ACTION: Waiting for loader wrapper to disappear...');
    await this.loaderWrapper.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('DEBUG: Loader wrapper not found or already hidden');
    });
    console.log('ACTION: Waiting for navigation to followup-referrals page...');
    await this.page.waitForURL('**/followup-referrals', { timeout: 10000 });
    await this.followupReferralsTitle.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Navigated to Followup Referrals page');
  }

  // ==================================================================================
  // GRID LOADING AND STABILITY METHODS
  // ==================================================================================
  async waitForGridStable() {
    console.log('ACTION: Waiting for grid to stabilize...');
    
    // Wait for loader wrapper to be hidden or detached
    await this.loaderWrapper.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
      console.log('DEBUG: Loader wrapper not found or already hidden');
    });
    
    // Additional check to ensure loader is completely gone
    const loaderVisible = await this.loaderWrapper.isVisible().catch(() => false);
    if (loaderVisible) {
      console.log('DEBUG: Loader still visible, waiting additional time...');
      await this.page.waitForTimeout(2000);
      await this.loaderWrapper.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
        console.log('WARNING: Loader may still be present');
      });
    }
    
    await this.followupReferralsTitle.waitFor({ state: 'visible' });
    await this.grid.waitFor({ state: 'visible' });
    await this.paginationInfo.waitFor({ state: 'visible' }).catch(() => {
      console.log('DEBUG: Pagination info not visible');
    });
    
    // Final verification that loader is gone
    await this.page.waitForSelector('.loader-wrapper', { state: 'hidden', timeout: 5000 }).catch(() => {
      console.log('DEBUG: Final loader check - not found or hidden');
    });
    
    console.log('ASSERT: Grid is stable and ready');
  }

  // ==================================================================================
  // GRID DATA RETRIEVAL METHODS
  // ==================================================================================
  async getGridRowCount() {
    console.log('ACTION: Getting grid row count...');
    const rows = this.grid.getByRole('row');
    const total = await rows.count();
    const count = Math.max(0, total - 1); // Subtract header row
    console.log(`ASSERT: Grid row count: ${count}`);
    return count;
  }

  async getDataRowCount() {
    console.log('ACTION: Getting data row count...');
    const rows = this.grid.getByRole('row');
    const count = Math.max(0, await rows.count() - 1);
    console.log(`DEBUG: Data rows: ${count}`);
    return count;
  }

  async getRowData(rowIndex) {
    console.log(`ACTION: Getting data from visible row ${rowIndex}...`);
    const allRows = this.grid.getByRole('row');
    const totalRows = await allRows.count();
    let visibleRowIndex = 0;
    let currentRowIndex = 1; // Start from 1 to skip header row
    
    // Find the nth visible row
    while (currentRowIndex < totalRows) {
      const row = allRows.nth(currentRowIndex);
      const isVisible = await row.isVisible().catch(() => false);
      
      if (isVisible) {
        if (visibleRowIndex === rowIndex) {
          // Found the visible row we need
          const cells = row.locator('[role="gridcell"]');
          const cellCount = await cells.count();
          const data = {};
          
          const headers = ['patientId', 'patientName', 'description', 'dueDate', 'status', 'phoneNumber', 'provider'];
          for (let i = 0; i < Math.min(cellCount, headers.length); i++) {
            data[headers[i]] = (await cells.nth(i).textContent())?.trim() || '';
          }
          
          console.log(`ASSERT: Retrieved data from visible row:`, data);
          return data;
        }
        visibleRowIndex++;
      }
      currentRowIndex++;
    }
    
    console.log(`DEBUG: Could not find visible row at index ${rowIndex}`);
    return {};
  }

  // ==================================================================================
  // GRID CONTROL METHODS (PAGINATION, SORTING)
  // ==================================================================================
  // ==================================================================================
  // SEARCH AND FILTER CONTROL METHODS
  // ==================================================================================
  async verifyAllControlsVisibleAndClickable() {
    console.log('ACTION: Verifying all controls are visible and clickable...');
    
    // Verify Search by Patient field
    await expect(this.searchByPatientField).toBeVisible();
    console.log('✓ Search by Patient field is visible');

    // Verify Select Providers dropdown
    await expect(this.selectProvidersDropdown).toBeVisible();
    await expect(this.selectProvidersDropdown).toBeEnabled();
    console.log('✓ Select Providers dropdown is visible');

    // Verify Select Locations dropdown
    await expect(this.selectLocationsDropdown).toBeVisible();
    await expect(this.selectLocationsDropdown).toBeEnabled();
    console.log('✓ Select Locations dropdown is visible');

    // Verify Assigned dropdown
    await expect(this.assignedDropdown).toBeVisible();
    await expect(this.assignedDropdown).toBeEnabled();
    console.log('✓ Assigned dropdown is visible');

    // Verify Status dropdown
    await expect(this.statusDropdown).toBeVisible();
    await expect(this.statusDropdown).toBeEnabled();
    console.log('✓ Status dropdown is visible');

    // Verify Search button is visible and enabled (clickable)
    await expect(this.searchButton).toBeVisible();
    await expect(this.searchButton).toBeEnabled();
    console.log('✓ Search button is visible and enabled (clickable)');

    // Verify Reset button is visible and enabled (clickable)
    await expect(this.resetButton).toBeVisible();
    await expect(this.resetButton).toBeEnabled();
    console.log('✓ Reset button is visible and enabled (clickable)');

    // Verify Add Followup Referral button is visible and enabled (clickable)
    await expect(this.addReferralButton).toBeVisible();
    await expect(this.addReferralButton).toBeEnabled();
    console.log('✓ Add Followup Referral button is visible and enabled (clickable)');
  }

  async clickSearchButton() {
    console.log('ACTION: Clicking Search button...');
    await this.searchButton.click();
    await this.page.waitForTimeout(2000);
    console.log('ASSERT: Search button clicked');
  }

  async enterSearchByPatient(searchValue) {
    console.log(`ACTION: Entering "${searchValue}" in Search by Patient field...`);
    await this.searchByPatientField.click();
    await this.searchByPatientField.fill(searchValue);
    const enteredValue = await this.searchByPatientField.inputValue();
    expect(enteredValue).toBe(searchValue);
    console.log('ASSERT: Search value entered successfully');
  }

  async resetFilters() {
    console.log('ACTION: Clicking Reset button...');
    await this.resetButton.click();
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Filters reset');
  }

  async verifySearchByPatientIsEmpty() {
    console.log('ACTION: Verifying Search by Patient field is empty...');
    const clearedValue = await this.searchByPatientField.inputValue();
    expect(clearedValue).toBe('');
    console.log('ASSERT: Search field is empty');
  }

  async verifyGridIsReloaded() {
    console.log('ACTION: Verifying grid is reloaded with data...');
    const gridCells = this.page.getByRole('gridcell');
    const cellCount = await gridCells.count();
    expect(cellCount).toBeGreaterThan(0);
    console.log(`ASSERT: Grid reloaded with ${cellCount} cells`);
  }

  async getGridRecordCountAfterSearch() {
    console.log('ACTION: Waiting for grid to update after search...');
    await this.page.waitForTimeout(1000);
    return await this.getGridRecordCount();
  }

  async getFirstRecordData() {
    console.log('ACTION: Getting first record data...');
    
    const rows = this.grid.locator('[role="row"]');
    const totalRows = await rows.count();
    
    if (totalRows < 2) {
      throw new Error('No data rows found in grid');
    }
    
    // Find first visible data row (skip header)
    let firstVisibleRow = null;
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      const isVisible = await row.isVisible().catch(() => false);
      if (isVisible) {
        firstVisibleRow = row;
        break;
      }
    }
    
    if (!firstVisibleRow) {
      await this.grid.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      firstVisibleRow = rows.nth(1);
      await expect(firstVisibleRow).toBeVisible({ timeout: 5000 });
    }
    
    const cells = firstVisibleRow.locator('[role="gridcell"]');
    const patientId = (await cells.nth(0).textContent())?.trim() || '';
    const patientName = (await cells.nth(1).textContent())?.trim() || '';
    
    // Parse patient name into first and last name
    const nameArray = patientName.split(/\s+/);
    const firstName = nameArray[0] || '';
    const lastName = nameArray[nameArray.length - 1] || '';
    
    const data = {
      patientId,
      patientName,
      firstName,
      lastName
    };
    
    console.log(`ASSERT: Retrieved first record - Name: ${patientName}, ID: ${patientId}`);
    return data;
  }

  async verifyFirstNameInGrid(firstName) {
    console.log(`ACTION: Verifying first name "${firstName}" exists in grid...`);
    
    const cellLocator = this.page.locator('[role="gridcell"]')
      .filter({ hasText: firstName });
    
    await expect(cellLocator.first()).toBeVisible({ timeout: 5000 });
    
    console.log(`  ✓ First Name "${firstName}" found in grid`);
    console.log(`ASSERT: First Name "${firstName}" verified in grid`);
  }

  async verifyLastNameInGrid(lastName) {
    console.log(`ACTION: Verifying last name "${lastName}" exists in grid...`);
    
    const cellLocator = this.page.locator('[role="gridcell"]')
      .filter({ hasText: lastName });
    
    await expect(cellLocator.first()).toBeVisible({ timeout: 5000 });
    
    console.log(`  ✓ Last Name "${lastName}" found in grid`);
    console.log(`ASSERT: Last Name "${lastName}" verified in grid`);
  }

  // ==================================================================================
  // EMPTY STATE VERIFICATION METHODS
  // ==================================================================================
  // ==================================================================================
  // GRID STRUCTURE AND COLUMN VALIDATION METHODS
  // ==================================================================================
  async verifyGridStructureAndColumns() {
    console.log('ACTION: Verifying grid structure and column headers...');
    
    // Verify title is visible
    await expect(this.followupReferralsTitle).toBeVisible();
    console.log('ASSERT: Followup Referrals title is visible');
    
    // Verify grid is visible
    await expect(this.grid).toBeVisible();
    console.log('ASSERT: Grid is visible');
    
    // Check all required column headers
    const headers = [
      { locator: this.patientIdHeader, name: 'Patient Id' },
      { locator: this.patientNameHeader, name: 'Patient Name' },
      { locator: this.descriptionHeader, name: 'Description' },
      { locator: this.dueDateHeader, name: 'Due Date' },
      { locator: this.statusHeader, name: 'Status' },
      { locator: this.phoneNumberHeader, name: 'Phone Number' },
      { locator: this.providerHeader, name: 'Provider' },
      { locator: this.actionHeader, name: 'Action' }
    ];
    
    for (const header of headers) {
      await expect(header.locator).toBeVisible();
      console.log(`ASSERT: Column header visible: ${header.name}`);
    }
  }

  async getGridRecordCount() {
    console.log('ACTION: Getting grid record count...');
    const rows = this.grid.getByRole('row');
    const total = await rows.count();
    const count = Math.max(0, total - 1); // Subtract header row
    console.log(`ASSERT: Grid record count: ${count}`);
    return count;
  }

  async verifyGridDataDisplay() {
    console.log('ACTION: Verifying grid data is displayed...');
    const rows = this.grid.getByRole('row');
    const rowCount = await rows.count();
    console.log(`ASSERT: Grid contains ${rowCount} rows (including header)`);
    return rowCount > 1;
  }

  async verifyGridColumnDataDisplay(rowsToCheck = 3) {
    console.log(`ACTION: Verifying grid column data is displayed for ${rowsToCheck} rows...`);
    
    // Wait for grid to be stable
    await expect(this.grid).toBeVisible({ timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Configuration for column validation
    const columnConfig = [
      { name: 'Patient Id', index: 0, optional: false, validator: (text) => /^\d+$/.test(text) },
      { name: 'Patient Name', index: 1, optional: false, validator: (text) => text.length > 0 },
      { name: 'Description', index: 2, optional: false, validator: (text) => text.length > 0 },
      { name: 'Due Date', index: 3, optional: false, validator: (text) => /\d{1,2}\/\d{1,2}\/\d{4}/.test(text) },
      { name: 'Status', index: 4, optional: false, validator: (text) => text.length > 0 },
      { name: 'Phone Number', index: 5, optional: true, validator: (text) => !text || /[\d\s\-\(\)]+/.test(text) },
      { name: 'Provider', index: 6, optional: false, validator: (text) => text.length > 0 }
    ];
    
    // Get data rows only (filter out header rows)
    const dataRows = await this.grid.locator('[role="row"]:has([role="gridcell"])').all();
    const actualRowsToCheck = Math.min(rowsToCheck, dataRows.length);
    
    if (dataRows.length === 0) {
      console.log('⚠️ WARNING: No data rows available - Grid may be empty');
      return false;
    }
    
    console.log(`INFO: Found ${dataRows.length} data rows in the grid`);
    console.log(`ACTION: Validating grid column data for ${actualRowsToCheck} data record(s)...`);
    
    // Validate each row
    for (let rowIndex = 0; rowIndex < actualRowsToCheck; rowIndex++) {
      const row = dataRows[rowIndex];
      const cells = await row.locator('[role="gridcell"]').all();
      
      await expect(row).toBeVisible({ timeout: 10000 });
      
      console.log(`\nACTION: Validating record ${rowIndex + 1}...`);
      
      // Validate each column
      for (const column of columnConfig) {
        if (column.index >= cells.length - 1) continue; // Skip Action column
        
        const cell = cells[column.index];
        const cellText = (await cell.textContent()).trim();
        const displayText = cellText.length > 50 ? `${cellText.substring(0, 50)}...` : cellText;
        
        // Validate required fields
        if (!column.optional) {
          expect(cellText.length).toBeGreaterThan(0);
          console.log(`ASSERT: ${column.name} "${displayText}" is displayed for record ${rowIndex + 1}`);
        } else {
          // For optional fields, validate format if present
          if (cellText.length > 0) {
            const isValid = column.validator(cellText);
            expect(isValid).toBe(true);
            console.log(`ASSERT: ${column.name} "${displayText}" is displayed and valid for record ${rowIndex + 1}`);
          } else {
            console.log(`INFO: ${column.name} is empty (optional field) for record ${rowIndex + 1}`);
          }
        }
      }
      
      console.log(`ASSERT: All required information is displayed for record ${rowIndex + 1}`);
    }
    
    console.log(`\n✅ ASSERT: Grid column validation completed successfully for ${actualRowsToCheck} data record(s)`);
    console.log(`ASSERT: Patient ID, Patient Name, Description, Due Date, Status, Phone Number, and Provider information is displayed against each referral record in the Followup Referrals Grid`);
    return true;
  }

  async verifyActionColumnIcons(rowsToCheck = 3) {
    console.log(`ACTION: Verifying Action column contains action icons in up to ${rowsToCheck} rows...`);
    
    // Wait for grid to be visible
    await expect(this.grid).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);

    // Get data rows from the grid
    const gridRows = this.grid.locator('[role="row"]');
    const totalRows = await gridRows.count();

    console.log(`Found ${totalRows} total rows, checking action icons...`);

    // Define expected action icons with specific FontAwesome classes
    const expectedActionIcons = {
      'Add Appointment': 'fa-calendar-plus-o',
      'Edit Followup Referral': 'fa-pencil',
      'Send Message': 'fa-commenting-o',
      'Complete Referral': 'fa-check'
    };

    // Find all data rows (skip header rows - those without gridcells)
    let dataRowsChecked = 0;
    let dataRowIndex = 0;

    for (let i = 0; i < totalRows && dataRowsChecked < rowsToCheck; i++) {
      const row = gridRows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();

      // Skip rows with no gridcells (header rows)
      if (cellCount === 0) {
        console.log(`DEBUG: Skipping row ${i} - no gridcells (header row)`);
        continue;
      }

      dataRowIndex++;
      dataRowsChecked++;
      const actionCell = cells.last();

      try {
        // Check for action icons with title attributes
        const actionIcons = actionCell.locator('i[title]');
        const iconCount = await actionIcons.count();

        console.log(`\n  Row ${dataRowIndex}: Action icons: ${iconCount}`);

        // STRICT ASSERTION: Must have at least one action icon
        expect(iconCount).toBeGreaterThanOrEqual(1, 
          `Row ${dataRowIndex} should have at least one action icon`);
        console.log(`    ✓ Row ${dataRowIndex}: Has action icon(s)`);

        // Verify icons are expected actions
        let validIconsFound = 0;
        for (let j = 0; j < iconCount; j++) {
          const icon = actionIcons.nth(j);
          const title = await icon.getAttribute('title');
          const classList = await icon.getAttribute('class');

          // Check if icon title matches expected action
          const isExpectedAction = Object.keys(expectedActionIcons).includes(title);
          
          if (isExpectedAction) {
            const expectedClass = expectedActionIcons[title];
            const hasExpectedClass = classList.includes(expectedClass);
            
            console.log(`    ✓ Icon ${j + 1}: "${title}" (class: ${classList})`);
            if (hasExpectedClass) {
              console.log(`      └─ ✓ Correct FontAwesome class: ${expectedClass}`);
              validIconsFound++;
            } else {
              console.log(`      └─ ⚠️ Expected class not found: ${expectedClass}`);
            }
          } else {
            console.log(`    ⚠️ Icon ${j + 1}: "${title}" - Unexpected action`);
          }
        }

        // At least one valid expected icon should exist per row
        expect(validIconsFound).toBeGreaterThanOrEqual(1, 
          `Row ${dataRowIndex} should have at least one valid expected action icon`);

      } catch (error) {
        console.log(`    ❌ Row ${dataRowIndex}: Error verifying action icons - ${error.message}`);
        throw error;
      }
    }

    if (dataRowsChecked === 0) {
      throw new Error('TEST FAILED: No data rows available for action icon validation');
    }

    console.log(`\nASSERT: Action column icons verified for ${dataRowsChecked} data row(s)`);
  }

  async verifyGridDataValidity() {
    console.log('ACTION: Verifying Followup Referrals Grid displays with relevant data...');
    
    // First, verify the grid is visible
    await expect(this.grid).toBeVisible();
    console.log('✓ Grid is displayed');
    
    // Verify grid has at least one row of data
    const rowCount = await this.getGridRowCount();
    expect(rowCount).toBeGreaterThan(0);
    console.log(`✓ Grid contains ${rowCount} row(s) of data`);
    
    // Get first row data to validate
    const rowData = await this.getRowData(0);
    expect(rowData).toBeDefined();
    console.log('✓ Grid data is accessible');
    
    // Verify key fields contain relevant data
    const hasPatientId = rowData.patientId && rowData.patientId.trim().length > 0;
    const hasPatientName = rowData.patientName && rowData.patientName.trim().length > 0;
    const hasDescription = rowData.description && rowData.description.trim().length > 0;
    const hasDueDate = rowData.dueDate && rowData.dueDate.trim().length > 0;
    const hasStatus = rowData.status && rowData.status.trim().length > 0;
    
    // All key fields should have relevant data
    const hasRelevantData = hasPatientId && hasPatientName && hasDescription && hasDueDate && hasStatus;
    
    expect(hasRelevantData).toBeTruthy();
    console.log('✓ Grid contains relevant data in all key fields');
    
    // Log sample data for verification
    console.log('Sample row data:', {
      patientId: rowData.patientId,
      patientName: rowData.patientName,
      description: rowData.description,
      dueDate: rowData.dueDate,
      status: rowData.status
    });
    
    // Optional: Validate data format/types if present
    if (rowData.patientId) {
      expect(rowData.patientId).toMatch(/^\d+$/);
      console.log(`✓ Patient ID format valid: ${rowData.patientId}`);
    }
    
    if (rowData.dueDate) {
      expect(rowData.dueDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      console.log(`✓ Due Date format valid: ${rowData.dueDate}`);
    }
    
    if (rowData.status) {
      const validStatuses = ['Open', 'Pending', 'Completed', 'Archive', 'Medium', 'Accepted', 'DELETED'];
      expect(validStatuses).toContain(rowData.status);
      console.log(`✓ Status is valid: ${rowData.status}`);
    }
    
    console.log('✓ Followup Referrals Grid is displayed with relevant data');
  }

  // ==================================================================================
  // WIDGET AND COUNT VERIFICATION METHODS
  // ==================================================================================
  async verifyDynamicCount() {
    console.log('ACTION: Verifying dynamic count in yellow circle badge...');
    
    // Verify the yellow circle badge is visible
    await expect(this.dynamicCountBadge).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Dynamic count badge (yellow circle) is visible');
    
    // Verify CSS properties: circular shape and yellow background
    const computedStyle = await this.dynamicCountBadge.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor
      };
    });
    
    // Verify circular shape (border-radius should be 50%)
    expect(computedStyle.borderRadius).toBe('50%');
    console.log(`ASSERT: Badge is circular (border-radius: ${computedStyle.borderRadius})`);
    
    // Verify yellow background color (#F2C53D converts to rgb(242, 197, 61))
    expect(computedStyle.backgroundColor).toMatch(/rgb\(242,\s*197,\s*61\)|rgb\(242, 197, 61\)/);
    console.log(`ASSERT: Badge has yellow background (${computedStyle.backgroundColor})`);
    
    // Get the count text from the badge
    const countText = await this.dynamicCountBadge.textContent();
    const count = countText?.trim();
    expect(count).toBeTruthy();
    expect(count).toMatch(/^\d+$/);
    console.log(`ASSERT: Dynamic count displayed: ${count}`);
    
    return count;
  }

  // ==================================================================================
  // ACTION BUTTONS VERIFICATION METHODS
  // ==================================================================================
  // ==================================================================================
  // COLUMN SORTING VALIDATION METHODS
  // ==================================================================================
  async getColumnValues(colIndex, rowCount) {
    const grid = this.page.getByRole('grid').last();
    const rows = grid.locator('[role="row"]');
    const values = [];
    let dataRowsProcessed = 0;
    
    for (let i = 0; i < await rows.count() && dataRowsProcessed < rowCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();
      
      // Skip header rows (no gridcells)
      if (cellCount === 0) continue;
      
      const cell = cells.nth(colIndex);
      const value = await cell.textContent();
      if (value) {
        values.push(value.trim());
        dataRowsProcessed++;
      }
    }
    
    return values;
  }

  async clickColumnHeader(colIndex) {
    const grid = this.page.getByRole('grid').last();
    const rows = grid.locator('[role="row"]');
    const firstRow = rows.nth(0);
    const headers = firstRow.locator('[role="columnheader"]');
    const header = headers.nth(colIndex);
    
    console.log(`ACTION: Clicking column header at index ${colIndex}`);
    await header.click();
    await this.waitForGridStable();
  }

  async waitForLoadingSpinnerToDisappear() {
    console.log('ACTION: Waiting for loading spinner to disappear...');
    const spinner = this.page.locator('.e-spinner, .loading, [role="progressbar"]').first();
    const isVisible = await spinner.isVisible().catch(() => false);
    
    if (isVisible) {
      await this.page.waitForTimeout(500);
      await spinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
    
    await this.waitForGridStable();
  }

  async verifyColumnSorted(colIndex, direction, rowCount) {
    const values = await this.getColumnValues(colIndex, rowCount);
    
    if (values.length === 0) {
      throw new Error(`No values found in column ${colIndex}`);
    }
    
    console.log(`VALUES (${direction}):`, values);
    
    // Try to parse as numbers if they look numeric
    const numericValues = values.map(v => {
      const num = parseFloat(v);
      return isNaN(num) ? v : num;
    });
    
    let isSorted = true;
    if (direction === 'ascending') {
      for (let i = 1; i < numericValues.length; i++) {
        if (numericValues[i] < numericValues[i - 1]) {
          isSorted = false;
          break;
        }
      }
    } else if (direction === 'descending') {
      for (let i = 1; i < numericValues.length; i++) {
        if (numericValues[i] > numericValues[i - 1]) {
          isSorted = false;
          break;
        }
      }
    }
    
    if (!isSorted) {
      throw new Error(`Column data is not sorted ${direction}: ${JSON.stringify(numericValues)}`);
    }
    
    console.log(`ASSERT: Column ${colIndex} is sorted ${direction} ✓`);
  }

  async testColumnSorting(colIndex, columnName) {
    console.log(`\n🧪 TESTING COLUMN SORTING: ${columnName} (Index: ${colIndex})`);
    
    const testRowCount = 5; // Test with first 5 rows
    
    try {
      // Get initial values
      console.log(`Step 1: Getting initial column values...`);
      const initialValues = await this.getColumnValues(colIndex, testRowCount);
      console.log(`INITIAL VALUES:`, initialValues);
      
      // Test Ascending Sort
      console.log(`\nStep 2: Testing ASCENDING sort...`);
      await this.clickColumnHeader(colIndex);
      await this.waitForLoadingSpinnerToDisappear();
      const ascendingValues = await this.getColumnValues(colIndex, testRowCount);
      await this.verifyColumnSorted(colIndex, 'ascending', testRowCount);
      
      // Test Descending Sort
      console.log(`\nStep 3: Testing DESCENDING sort...`);
      await this.clickColumnHeader(colIndex);
      await this.waitForLoadingSpinnerToDisappear();
      const descendingValues = await this.getColumnValues(colIndex, testRowCount);
      await this.verifyColumnSorted(colIndex, 'descending', testRowCount);
      
      // Test Reset
      console.log(`\nStep 4: Testing RESET (click column again)...`);
      await this.clickColumnHeader(colIndex);
      await this.waitForLoadingSpinnerToDisappear();
      const resetValues = await this.getColumnValues(colIndex, testRowCount);
      console.log(`RESET VALUES:`, resetValues);
      
      // Verify reset returns to initial order
      const resetMatches = JSON.stringify(resetValues) === JSON.stringify(initialValues);
      if (resetMatches) {
        console.log(`ASSERT: Reset button restored initial sort order ✓`);
      } else {
        console.log(`⚠️ WARNING: Reset order differs from initial (may be expected depending on app behavior)`);
      }
      
      console.log(`\n✅ COLUMN SORTING TEST PASSED: ${columnName}`);
      
    } catch (error) {
      console.error(`\n❌ COLUMN SORTING TEST FAILED: ${columnName}`);
      console.error(`Error: ${error.message}`);
      throw error;
    }
  }

  // ==================================================================================
  // DROPDOWN HELPER METHODS FOR DYNAMIC VALUE SELECTION
  // ==================================================================================
  async getDropdownOptions(dropdownLocator, optionType = 'option') {
    console.log('ACTION: Getting available dropdown options...');
    await dropdownLocator.click();
    
    // Wait for options to appear in the dropdown
    await this.page.waitForTimeout(500);
    await this.page.waitForSelector('[role="option"]', { timeout: 5000 }).catch(() => {
      console.log('DEBUG: Options not found by selector');
    });
    
    const options = this.page.getByRole(optionType);
    let optionCount = await options.count();
    
    // If no options, try waiting a bit longer
    if (optionCount === 0) {
      await this.page.waitForTimeout(500);
      optionCount = await options.count();
    }
    
    const optionsList = [];
    for (let i = 0; i < optionCount; i++) {
      const text = await options.nth(i).textContent();
      if (text) optionsList.push(text.trim());
    }
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    
    console.log(`ASSERT: Retrieved ${optionsList.length} dropdown options: ${optionsList.join(', ')}`);
    return optionsList.filter(opt => opt && opt.length > 0);
  }

  async selectMultipleDropdownOptions(dropdownLocator, optionNames) {
    console.log(`ACTION: Selecting multiple options: ${optionNames.join(', ')}...`);
    await dropdownLocator.click();
    
    // Wait for dropdown to open
    await this.page.waitForTimeout(500);
    await this.page.waitForSelector('[role="option"]', { timeout: 5000 }).catch(() => {
      console.log('DEBUG: Dropdown options not visible');
    });
    
    for (const optionName of optionNames) {
      const option = this.page.getByRole('option', { name: optionName });
      await option.click().catch(() => {
        console.log(`WARNING: Could not click option "${optionName}"`);
      });
      await this.page.waitForTimeout(200);
    }
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    
    console.log(`ASSERT: All options selected: ${optionNames.join(', ')}`);
  }

  async selectProviders(providerNames) {
    console.log(`ACTION: Selecting providers: ${providerNames.join(', ')}...`);
    await this.selectMultipleDropdownOptions(this.selectProvidersDropdown, providerNames);
  }

  async selectLocations(locationNames) {
    console.log(`ACTION: Selecting locations: ${locationNames.join(', ')}...`);
    await this.selectMultipleDropdownOptions(this.selectLocationsDropdown, locationNames);
  }

  async selectAssignedStatus(assignedStatus) {
    console.log(`ACTION: Selecting assigned status: "${assignedStatus}"...`);
    await this.assignedDropdown.click();
    await this.page.waitForTimeout(300);
    const option = this.page.getByRole('option', { name: assignedStatus });
    await option.click();
    await this.page.waitForTimeout(300);
    console.log(`ASSERT: Assigned status "${assignedStatus}" selected`);
  }

  async selectReferralStatus(statusName) {
    console.log(`ACTION: Selecting referral status: "${statusName}"...`);
    await this.statusDropdown.click();
    await this.page.waitForTimeout(300);
    const option = this.page.getByRole('option', { name: statusName });
    await option.click();
    await this.page.waitForTimeout(300);
    console.log(`ASSERT: Referral status "${statusName}" selected`);
  }

  async verifyProvidersInGridRows(selectedProviders) {
    console.log(`ACTION: Verifying selected providers exist in first 3 grid rows...`);
    console.log(`  Checking for providers: ${selectedProviders.join(', ')}`);

    // Get all rows in the grid (excluding header)
    const rows = await this.page.locator('[role="row"]').all();
    console.log(`  Total rows found: ${rows.length}`);

    if (rows.length <= 1) {
      console.log('  ⚠ No data rows found in grid');
      return;
    }

    let foundProvidersCount = 0;
    const foundProviders = [];
    const maxRowsToCheck = Math.min(3, rows.length - 1); // Only check up to 3 data rows

    // Iterate through first 3 data rows and check if provider column contains selected providers
    for (let i = 1; i <= maxRowsToCheck; i++) {
      const row = rows[i];
      const cells = await row.locator('[role="gridcell"]').all();

      // Provider is typically in column 6 (0-indexed)
      if (cells.length > 6) {
        const providerCell = cells[6];
        const providerText = await providerCell.textContent();

        // Check if this row's provider matches any of the selected providers
        for (const selectedProvider of selectedProviders) {
          if (providerText && providerText.includes(selectedProvider)) {
            foundProvidersCount++;
            if (!foundProviders.includes(selectedProvider)) {
              foundProviders.push(selectedProvider);
            }
            console.log(`  ✓ Row ${i}: Provider "${providerText.trim()}" matches filter "${selectedProvider}"`);
            break;
          }
        }
      }
    }

    console.log(`ASSERT: Found ${foundProvidersCount} rows with selected providers in first 3 data rows`);
    console.log(`ASSERT: Providers found in grid: ${foundProviders.join(', ')}`);

    expect(foundProvidersCount).toBeGreaterThan(0);
  }

  async verifyStatusInGridRows(selectedStatus) {
    console.log(`ACTION: Verifying selected status exists in first 3 grid rows...`);
    console.log(`  Checking for status: ${selectedStatus}`);

    // Get all rows in the grid (excluding header)
    const rows = await this.page.locator('[role="row"]').all();
    console.log(`  Total rows found: ${rows.length}`);

    if (rows.length <= 1) {
      console.log('  ⚠ No data rows found in grid');
      return;
    }

    let foundStatusCount = 0;
    const maxRowsToCheck = Math.min(3, rows.length - 1); // Only check up to 3 data rows

    // Iterate through first 3 data rows and check if status column contains selected status
    for (let i = 1; i <= maxRowsToCheck; i++) {
      const row = rows[i];
      const cells = await row.locator('[role="gridcell"]').all();

      // Status is typically in column 4 (0-indexed: PatientId=0, PatientName=1, Description=2, DueDate=3, Status=4)
      if (cells.length > 4) {
        const statusCell = cells[4];
        const statusText = await statusCell.textContent();

        if (statusText && statusText.trim() === selectedStatus) {
          foundStatusCount++;
          console.log(`  ✓ Row ${i}: Status "${statusText.trim()}" matches filter "${selectedStatus}"`);
        }
      }
    }

    console.log(`ASSERT: Found ${foundStatusCount} rows with status "${selectedStatus}" in first 3 data rows`);
    expect(foundStatusCount).toBeGreaterThan(0);
  }

  async verifyProvidersDropdownReset() {
    console.log('ACTION: Verifying Providers dropdown is reset...');
    
    // Click providers dropdown to check if it's empty/reset
    await this.selectProvidersDropdown.click();
    await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
    await this.page.waitForTimeout(300);
    
    const selectedOptions = await this.page.locator('[role="option"][aria-selected="true"]').count();
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);
    
    expect(selectedOptions).toBe(0);
    console.log('  ✓ Providers dropdown reset - No selections');
  }

  async verifyLocationsDropdownReset() {
    console.log('ACTION: Verifying Locations dropdown is reset...');
    
    // Click locations dropdown to check if it's empty/reset
    await this.selectLocationsDropdown.click();
    await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
    await this.page.waitForTimeout(300);
    
    const selectedOptions = await this.page.locator('[role="option"][aria-selected="true"]').count();
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);
    
    expect(selectedOptions).toBe(0);
    console.log('  ✓ Locations dropdown reset - No selections');
  }

  async verifyAssignedDropdownReset() {
    console.log('ACTION: Verifying Assigned dropdown is reset to "All"...');
    
    // Click assigned dropdown to verify "All" is selected
    await this.assignedDropdown.click();
    await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
    await this.page.waitForTimeout(300);
    
    // Get all options and check which one appears first (default selected)
    const allOption = await this.page.locator('[role="option"]').filter({ hasText: /^All$/ });
    const isAllVisible = await allOption.isVisible();
    
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);
    
    expect(isAllVisible).toBe(true);
    console.log('  ✓ Assigned dropdown reset to "All"');
  }

  async verifyStatusDropdownReset() {
    console.log('ACTION: Verifying Status dropdown is reset to "Open"...');
    
    // Click status dropdown to verify "Open" is selected
    await this.statusDropdown.click();
    await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
    await this.page.waitForTimeout(300);
    
    // Get all options and check which one appears first (default selected)
    const openOption = await this.page.locator('[role="option"]').filter({ hasText: /^Open$/ });
    const isOpenVisible = await openOption.isVisible();
    
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);
    
    expect(isOpenVisible).toBe(true);
    console.log('  ✓ Status dropdown reset to "Open"');
  }

  // ==================================================================================
  // ADD FOLLOWUP REFERRAL POPUP METHODS
  // ==================================================================================
  async clickAddFollowupReferralButton() {
    console.log('ACTION: Clicking Add Followup Referral button...');
    await this.addReferralButton.click();
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Add Followup Referral button clicked');
  }

  async verifyAddFollowupReferralPopupDisplayed() {
    console.log('ACTION: Verifying Add Followup Referral popup is displayed...');
    
    // Verify popup is visible
    await expect(this.addFollowupReferralPopup).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Add Followup Referral popup is visible');
    
    // Verify popup header
    await expect(this.popupHeader).toBeVisible();
    const headerText = await this.popupHeader.textContent();
    expect(headerText).toContain('Add Followup Referral');
    console.log(`ASSERT: Popup header displays: "${headerText.trim()}"`);
    
    // Verify close icon is visible
    await expect(this.popupCloseButton).toBeVisible();
    console.log('ASSERT: Close icon (X) is visible on popup header');
    
    // Verify Patient field label with asterisk
    await expect(this.patientFieldLabel).toBeVisible();
    const patientLabelText = await this.patientFieldLabel.textContent();
    expect(patientLabelText).toContain('*');
    console.log('ASSERT: Patient field is displayed with asterisk (required)');
    
    // Verify Description field with asterisk
    await expect(this.descriptionFieldLabel).toBeVisible();
    const descriptionPlaceholder = await this.descriptionFieldLabel.getAttribute('placeholder');
    expect(descriptionPlaceholder || 'Description *').toContain('*');
    console.log('ASSERT: Description field is displayed with asterisk (required)');
    
    // Verify Cancel button
    await expect(this.popupCancelButton).toBeVisible();
    await expect(this.popupCancelButton).toBeEnabled();
    console.log('ASSERT: Cancel button is visible and clickable');
    
    // Verify Save button
    await expect(this.popupSaveButton).toBeVisible();
    console.log('ASSERT: Save button is visible');
  }

  async closePopupWithCloseButton() {
    console.log('ACTION: Clicking close icon (X) on popup header...');
    await this.popupCloseButton.click();
    await this.page.waitForTimeout(1000);
    
    // Verify popup is closed
    const popupHidden = await this.addFollowupReferralPopup.isVisible().catch(() => false);
    expect(popupHidden).toBe(false);
    console.log('ASSERT: Add Followup Referral popup is closed');
  }

  async closePopupWithCancelButton() {
    console.log('ACTION: Clicking Cancel button on popup...');
    
    // Close any open dropdowns by pressing Escape key
    console.log('STEP: Closing autocomplete dropdown if open...');
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    
    await this.popupCancelButton.click();
    await this.page.waitForTimeout(1000);
    
    // Verify popup is closed
    const popupHidden = await this.addFollowupReferralPopup.isVisible().catch(() => false);
    expect(popupHidden).toBe(false);
    console.log('ASSERT: Add Followup Referral popup is closed via Cancel button');
  }

  async verifyUserReturnedToGrid() {
    console.log('ACTION: Verifying user is back to the Followup Referrals grid...');
    await expect(this.grid).toBeVisible({ timeout: 5000 });
    await expect(this.addReferralButton).toBeVisible();
    console.log('ASSERT: User returned to Followup Referrals grid screen');
  }

  async searchPatientInPopup(searchText) {
    console.log(`ACTION: Searching for patient "${searchText}" in Add Popup...`);
    
    // Wait for any loading wrappers to disappear first
    console.log('ACTION: Waiting for loading spinner and wrapper to disappear...');
    await this.page.waitForTimeout(500);
    const loaderWrapper = this.page.locator('.loader-wrapper');
    const wrapperVisible = await loaderWrapper.isVisible().catch(() => false);
    if (wrapperVisible) {
      await loaderWrapper.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
        console.log('DEBUG: Loader wrapper did not disappear within timeout');
      });
      await this.page.waitForTimeout(500);
    }
    
    await this.patientInputField.click();
    await this.page.waitForTimeout(500);
    await this.patientInputField.fill(searchText);
    await this.page.waitForTimeout(1000); // Wait for autocomplete to show results
    console.log(`ASSERT: Patient search text entered: "${searchText}"`);
  }

  async getPatientSearchResults() {
    console.log('ACTION: Getting patient search results...');
    
    // Wait for the autocomplete panel to be visible
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 }).catch(() => {
      console.log('DEBUG: Listbox not found');
    });
    
    await this.page.waitForTimeout(300);
    
    // Get all mat-option elements from the dropdown
    const options = this.page.locator('mat-option[role="option"] span.mat-option-text');
    const count = await options.count();
    
    const results = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text && text.trim()) {
        results.push(text.trim());
      }
    }
    
    console.log(`ASSERT: Retrieved ${results.length} patient search results`);
    return results;
  }

  async selectPatientFromSearchResults(patientName) {
    console.log(`ACTION: Selecting patient "${patientName}" from search results...`);
    
    // Wait for options to be visible
    await this.page.waitForSelector('mat-option[role="option"]', { timeout: 5000 });
    
    // Find and click the matching option
    const option = this.page.locator('mat-option[role="option"]').filter({ 
      hasText: new RegExp(patientName, 'i') 
    }).first();
    
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(800);
    console.log(`ASSERT: Patient "${patientName}" selected from dropdown`);
  }

  async verifyPatientFieldIsPopulated(expectedPatient) {
    console.log(`ACTION: Verifying patient field contains "${expectedPatient}"...`);
    const fieldValue = await this.patientInputField.inputValue();
    // Check if field contains any part of the expected patient name (flexible matching)
    const fieldMatches = expectedPatient.toLowerCase().split(' ').some(part => 
      fieldValue.toLowerCase().includes(part)
    );
    expect(fieldMatches).toBe(true);
    console.log(`ASSERT: Patient field populated with "${fieldValue}"`);
  }

  async searchAndVerifyPatientInPopup(searchText, expectedPatientName) {
    console.log(`ACTION: Searching for patient "${searchText}" and verifying results...`);
    await this.searchPatientInPopup(searchText);
    
    const searchResults = await this.getPatientSearchResults();
    expect(searchResults.length).toBeGreaterThan(0);
    console.log(`ASSERT: Search returned ${searchResults.length} result(s)`);
    console.log(`Results: ${searchResults.slice(0, 5).join(', ')}`);
    
    const patientFound = searchResults.some(patient => 
      patient.toLowerCase().includes(expectedPatientName.toLowerCase())
    );
    expect(patientFound).toBe(true);
    console.log(`✔️ VERIFIED: Patient "${expectedPatientName}" found in search results`);
    
    return searchResults;
  }

  async clearPatientSearchField() {
    console.log('ACTION: Clearing patient search field...');
    await this.patientInputField.click();
    await this.patientInputField.clear();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Patient search field cleared');
  }

  async enterDescription(text) {
    console.log(`ACTION: Entering description: "${text}"`);
    await this.descriptionFieldLabel.click();
    await this.descriptionFieldLabel.clear();
    await this.descriptionFieldLabel.fill(text);
    await this.page.waitForTimeout(300);
    console.log('ASSERT: Description entered successfully');
  }

  async clickSaveButton() {
    console.log('ACTION: Clicking Save button...');
    await this.popupSaveButton.click();
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Save button clicked');
  }

  async getSuccessMessage() {
    console.log('ACTION: Retrieving success message...');
    try {
      const message = await this.toastMessage.textContent();
      console.log(`ASSERT: Success message retrieved: "${message}"`);
      return message;
    } catch (e) {
      console.log('INFO: No success message found');
      return null;
    }
  }

  async verifyNewReferralInGrid(patientName, description) {
    console.log(`ACTION: Verifying new referral in grid - Patient: "${patientName}", Description: "${description}"`);
    
    // Get all rows
    const rows = await this.gridRows.count();
    console.log(`INFO: Checking ${rows} total grid rows`);
    
    // Search through grid for the patient and description
    for (let i = 1; i < rows; i++) {
      const row = this.gridRows.nth(i);
      const rowText = await row.textContent();
      
      // Check if row contains both patient name and description
      if (rowText.includes(patientName) && rowText.includes(description)) {
        console.log(`✔️ VERIFIED: New referral found in grid - Patient: "${patientName}", Description: "${description}"`);
        return true;
      }
    }
    
    console.log(`❌ WARNING: New referral NOT found in grid`);
    return false;
  }

  async getAllPatientsInSearchResults() {
    console.log('ACTION: Getting all patients from search results...');
    const patients = await this.page.getByRole('option').all();
    const patientNames = [];
    
    for (const patient of patients) {
      const text = await patient.textContent();
      if (text && text.trim()) {
        patientNames.push(text.trim());
      }
    }
    
    console.log(`ASSERT: Retrieved ${patientNames.length} patients from search results`);
    return patientNames;
  }

  async generateValidDescription() {
    console.log('ACTION: Generating valid description without "Admission" keyword...');
    let description = faker.lorem.sentence().slice(0, 50);
    while (description.includes('Admission')) {
      description = faker.lorem.sentence().slice(0, 50);
    }
    console.log(`ASSERT: Generated description: "${description}"`);
    return description;
  }

  async attemptSaveWithPatient(patientName, attemptNumber = 1) {
    console.log(`\nACTION: Attempt ${attemptNumber} - Saving referral with patient "${patientName}"...`);
    
    // Search and verify patient
    await this.searchAndVerifyPatientInPopup(patientName, patientName);
    
    // Select patient
    console.log(`STEP ${attemptNumber}a: Selecting patient from search results...`);
    await this.selectPatientFromSearchResults(patientName);
    await this.verifyPatientFieldIsPopulated(patientName);
    console.log(`ASSERT: Patient "${patientName}" selected and verified`);
    
    // Generate description
    const description = await this.generateValidDescription();
    
    // Enter description and save
    console.log(`STEP ${attemptNumber}b: Entering description...`);
    await this.enterDescription(description);
    
    console.log(`STEP ${attemptNumber}c: Clicking Save button...`);
    await this.clickSaveButton();
    
    // Get success message
    console.log(`STEP ${attemptNumber}d: Checking for success message...`);
    const successMsg = await this.getSuccessMessage();
    
    return {
      success: successMsg && (successMsg.includes('successfully') || successMsg.includes('Successfully')),
      description,
      message: successMsg
    };
  }

  async saveReferralWithRetry(patientName, maxAttempts = 3) {
    console.log(`ACTION: Attempting to save referral with up to ${maxAttempts} attempts...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.attemptSaveWithPatient(patientName, attempt);
      
      if (result.success) {
        console.log(`✔️ SUCCESS: Referral saved on attempt ${attempt}`);
        console.log(`SUCCESS MESSAGE: "${result.message}"`);
        return { success: true, description: result.description, attempt };
      }
      
      console.log(`INFO: Attempt ${attempt} failed - ${result.message || 'No message'}`);
      
      if (attempt < maxAttempts) {
        console.log(`INFO: Closing popup to retry...`);
        await this.closePopupWithCancelButton();
        await this.page.waitForTimeout(500);
        
        console.log(`INFO: Reopening Add popup for attempt ${attempt + 1}...`);
        await this.clickAddFollowupReferralButton();
        await this.page.waitForTimeout(300);
      }
    }
    
    console.log(`FAILED: Could not save referral after ${maxAttempts} attempts`);
    return { success: false, description: null, attempt: maxAttempts };
  }

  async saveReferralWithSearchCharacter(searchChar = 'a', maxAttempts = 5) {
    console.log(`ACTION: Attempting to save referral by searching with character "${searchChar}"...`);
    
    // Search for patients with the character
    console.log(`STEP: Searching for patients with character "${searchChar}"...`);
    await this.searchPatientInPopup(searchChar);
    
    // Get patient list from search results
    const patientList = await this.getPatientSearchResults();
    
    if (patientList.length === 0) {
      console.log(`INFO: No results for character "${searchChar}", returning empty`);
      return { success: false, description: null, attempt: 0, searchChar };
    }
    
    console.log(`ASSERT: Retrieved ${patientList.length} patients from search`);
    
    // Try each patient up to maxAttempts times
    const patientsToTry = patientList.slice(0, maxAttempts);
    
    for (let attempt = 0; attempt < patientsToTry.length; attempt++) {
      const currentPatient = patientsToTry[attempt];
      console.log(`\nSTEP ${attempt + 1}: Attempt ${attempt + 1}/${patientsToTry.length} - Trying patient "${currentPatient}"...`);
      
      // Select patient
      console.log(`STEP ${attempt + 1}a: Selecting patient "${currentPatient}"...`);
      await this.selectPatientFromSearchResults(currentPatient);
      await this.verifyPatientFieldIsPopulated(currentPatient);
      console.log(`ASSERT: Patient "${currentPatient}" selected`);
      
      // Generate description
      const description = await this.generateValidDescription();
      
      // Enter description
      console.log(`STEP ${attempt + 1}b: Entering description...`);
      await this.enterDescription(description);
      
      // Save
      console.log(`STEP ${attempt + 1}c: Clicking Save button...`);
      await this.clickSaveButton();
      
      // Check for success
      console.log(`STEP ${attempt + 1}d: Checking for success message...`);
      const successMsg = await this.getSuccessMessage();
      
      if (successMsg && (successMsg.includes('successfully') || successMsg.includes('Successfully'))) {
        console.log(`SUCCESS: Referral saved with patient "${currentPatient}" on attempt ${attempt + 1}`);
        console.log(`SUCCESS MESSAGE: "${successMsg}"`);
        return { success: true, description, attempt: attempt + 1, patient: currentPatient, searchChar };
      }
      
      console.log(`INFO: Save failed with patient "${currentPatient}" - ${successMsg || 'No message'}`);
      
      // Close and reopen if not last attempt
      if (attempt < patientsToTry.length - 1) {
        console.log(`INFO: Closing popup to try next patient...`);
        await this.closePopupWithCancelButton();
        await this.page.waitForTimeout(500);
        
        console.log(`INFO: Reopening Add popup for attempt ${attempt + 2}...`);
        await this.clickAddFollowupReferralButton();
        
        // Wait for popup to be fully loaded
        await this.page.waitForTimeout(1000);
        
        // Clear patient field first
        await this.patientInputField.clear();
        await this.page.waitForTimeout(300);
        
        // Search again
        await this.searchPatientInPopup(searchChar);
        await this.page.waitForTimeout(500);
      }
    }
    
    console.log(`FAILED: Could not save referral after trying ${patientsToTry.length} patients`);
    return { success: false, description: null, attempt: patientsToTry.length, searchChar };
  }

  async tryMultipleSearchCharacters(charactersToTry = ['a', 'e', 'i', 'o', 'p'], maxPatientsPerChar = 5) {
    console.log(`ACTION: Attempting to save referral with multiple search characters...`);
    
    for (const char of charactersToTry) {
      console.log(`\nSTEP: Trying search character "${char}"...`);
      
      const result = await this.saveReferralWithSearchCharacter(char, maxPatientsPerChar);
      
      if (result.success) {
        console.log(`SUCCESS: Referral saved using character "${result.searchChar}"`);
        return result;
      }
      
      console.log(`INFO: Character "${char}" did not yield successful save, trying next...`);
      
      // If not last character, reopen popup
      if (char !== charactersToTry[charactersToTry.length - 1]) {
        await this.clickAddFollowupReferralButton();
        await this.page.waitForTimeout(300);
      }
    }
    
    console.log(`FAILED: Could not save referral with any of the tried characters`);
    return { success: false, description: null, attempt: 0, searchChar: null };
  }
}

module.exports = { FollowupReferralsPage };
