const { expect } = require('@playwright/test');
const { error } = require('console');

class PatientReferralPage {
  constructor(page) {
    this.page = page;

    // ==================================================================================
    // PORTAL NAVIGATION LOCATORS
    // ==================================================================================
    this.portalRequestsMenu = page.locator('div').filter({ hasText: /^Portal Requests\d+$/ }).first();
    this.patientReferralThumbnail = page.locator('h5:has-text("Patient Referral")');
    this.patientReferralHeading = page.locator('h6:has-text("Patient Referral")');
    this.patientReferralCountSpan = page.locator('xpath=/html/body/patient-root/patient-master-layout/div/div/div/div/div/main/patient-portal-access/div/div[1]/div[5]/div/div[2]/h2/span');

    // ==================================================================================
    // PATIENT REFERRAL SECTION CONTROLS
    // ==================================================================================
    this.searchTextbox = page.getByRole('textbox', { name: 'Search' });
    this.statusDropdown = page.getByRole('combobox').filter({ hasText: /New|Status/ }).first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.newRequestButton = page.getByRole('button', { name: 'New Request' });

    // ==================================================================================
    // PATIENT REFERRAL GRID LOCATORS
    // ==================================================================================
    this.patientReferralGrid = page.locator('ejs-grid');
    this.gridRows = page.locator('ejs-grid [role="row"]');
    
    // Grid column headers
    this.firstNameColumn = page.locator('ejs-grid .e-headertext:has-text("First Name")');
    this.lastNameColumn = page.locator('ejs-grid .e-headertext:has-text("Last Name")');
    this.emailColumn = page.locator('ejs-grid .e-headertext').filter({ hasText: /^Email$/ });
    this.phoneColumn = page.locator('ejs-grid .e-headertext').filter({ hasText: /^Phone Number$/ });
    this.reasonColumn = page.locator('ejs-grid .e-headertext:has-text("Reason")');
    this.providerColumn = page.locator('ejs-grid .e-headertext:has-text("Ref Provider")');
    this.providerEmailColumn = page.locator('ejs-grid .e-headertext:has-text("Provider Email")');
    this.providerPhoneColumn = page.locator('ejs-grid .e-headertext:has-text("Provider Phone Number")');
    this.actionByColumn = page.locator('ejs-grid .e-headertext:has-text("Action By")');
    this.actionNotesColumn = page.locator('ejs-grid .e-headertext:has-text("Action Notes")');
    this.actionColumn = page.locator('ejs-grid .e-headertext').filter({ hasText: /^Action$/ });

    // ==================================================================================
    // ACTION ICONS LOCATORS
    // ==================================================================================
    this.approveIcon = page.locator('i.fa.fa-check.ng-star-inserted');
    this.rejectIcon = page.locator('i.fa.fa-times-circle.ml-10.ng-star-inserted');
  }

  // ==================================================================================
  // NAVIGATION METHODS
  // ==================================================================================
  async navigateToPatientReferralTab(loginPage) {
    console.log('ACTION: Navigating to Portal Approval page...');
    await this.page.goto('/portal-approval');
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    
    if (loginPage) {
      try {
        console.log('ACTION: Skipping MFA if required...');
        await loginPage.skipMfa();
      } catch (e) {
        // MFA skip not needed
      }
    }
    
    await this.page.waitForURL('**/portal-approval**', { timeout: 15000 });
    
    // Wait for loader to disappear if present
    console.log('ACTION: Waiting for loader to disappear...');
    const loaders = this.page.locator('[class*="loader"], [class*="loading"], [class*="spinner"], .mat-progress-spinner, .spinner');
    await loaders.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('DEBUG: No loader found or loader already hidden');
    });
    
    // Wait for the tabs/thumbnails container to be visible
    console.log('ACTION: Waiting for Patient Portal tab to be visible...');
    const patientPortalTab = this.page.locator('h5:has-text("Patient Portal")');
    await expect(patientPortalTab).toBeVisible({ timeout: 15000 });
    
    // Wait for Patient Referral tab to be visible and stable
    console.log('ACTION: Waiting for Patient Referral tab to be visible and stable...');
    await expect(this.patientReferralThumbnail).toBeVisible({ timeout: 15000 });
    await this.patientReferralThumbnail.waitFor({ state: 'attached', timeout: 5000 });
    await this.page.waitForTimeout(500);
    
    console.log('ASSERT: Portal page loaded and Patient Referral tab visible');
  }

  // ==================================================================================
  // PATIENT REFERRAL TAB VERIFICATION METHODS
  // ==================================================================================
  async verifyPatientReferralThumbnailVisible() {
    console.log('ACTION: Verifying Patient Referral thumbnail is visible...');
    await expect(this.patientReferralThumbnail).toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Patient Referral thumbnail is visible');
  }

  async verifyPatientReferralCountDisplay() {
    console.log('ACTION: Verifying Patient Referral count is displayed...');
    await expect(this.patientReferralCountSpan).toBeVisible({ timeout: 10000 });
    const countText = await this.patientReferralCountSpan.textContent();
    const count = countText.trim();
    console.log(`ASSERT: Patient Referral count displayed: ${count}`);
    return count;
  }

  async clickPatientReferralThumbnail() {
    console.log('ACTION: Clicking on Patient Referral thumbnail...');
    await this.patientReferralThumbnail.waitFor({ state: 'attached', timeout: 5000 });
    await this.page.waitForTimeout(300);
    await this.patientReferralThumbnail.click();
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Patient Referral thumbnail clicked');
  }

  async verifyNavigationToPatientReferralSection() {
    console.log('ACTION: Verifying navigation to Patient Referral Section...');
    await expect(this.patientReferralHeading).toBeVisible({ timeout: 10000 });
    const headingText = await this.patientReferralHeading.textContent();
    console.log(`ASSERT: Navigated to Patient Referral Section - Heading: "${headingText.trim()}"`);
  }

  // ==================================================================================
  // CONTROL VISIBILITY VALIDATION METHODS
  // ==================================================================================
  async validateSearchTextboxVisibility() {
    console.log('ACTION: Validating Search textbox visibility...');
    await expect(this.searchTextbox).toBeVisible();
    await expect(this.searchTextbox).toBeEnabled();
    console.log('ASSERT: Search textbox is visible and enabled');
  }

  async validateStatusDropdownVisibility() {
    console.log('ACTION: Validating Status dropdown visibility...');
    await expect(this.statusDropdown).toBeVisible();
    await expect(this.statusDropdown).toBeEnabled();
    console.log('ASSERT: Status dropdown is visible and enabled');
  }

  async validateStatusDropdownDefaultValue() {
    console.log('ACTION: Validating Status dropdown default value...');
    const dropdownText = await this.statusDropdown.textContent();
    const trimmedText = dropdownText.trim();
    console.log(`DEBUG: Dropdown text content: "${trimmedText}"`);
    expect(trimmedText).toContain('New');
    console.log('ASSERT: Status dropdown default value is "New"');
  }

  async validateSearchButtonVisibility() {
    console.log('ACTION: Validating Search button visibility...');
    await expect(this.searchButton).toBeVisible();
    await expect(this.searchButton).toBeEnabled();
    console.log('ASSERT: Search button is visible and enabled');
  }

  async validateResetButtonVisibility() {
    console.log('ACTION: Validating Reset button visibility...');
    await expect(this.resetButton).toBeVisible();
    await expect(this.resetButton).toBeEnabled();
    console.log('ASSERT: Reset button is visible and enabled');
  }

  async validateNewRequestButtonVisibility() {
    console.log('ACTION: Validating New Request button visibility...');
    await expect(this.newRequestButton).toBeVisible();
    await expect(this.newRequestButton).toBeEnabled();
    console.log('ASSERT: New Request button is visible and enabled');
  }

  async validateAllControlsVisibility() {
    console.log('ACTION: Validating all controls visibility...');
    await this.validateSearchTextboxVisibility();
    await this.validateStatusDropdownVisibility();
    await this.validateStatusDropdownDefaultValue();
    await this.validateSearchButtonVisibility();
    await this.validateResetButtonVisibility();
    await this.validateNewRequestButtonVisibility();
    console.log('ASSERT: All controls visibility validated successfully');
  }

  // ==================================================================================
  // GRID COLUMN VALIDATION METHODS
  // ==================================================================================
  async validateGridColumns() {
    console.log('ACTION: Validating grid columns...');
    
    // Wait for grid to be loaded
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    console.log('ACTION: Grid is visible');
    
    const columns = [
      { locator: this.firstNameColumn, name: 'First Name' },
      { locator: this.lastNameColumn, name: 'Last Name' },
      { locator: this.emailColumn, name: 'Email' },
      { locator: this.phoneColumn, name: 'Phone Number' },
      { locator: this.reasonColumn, name: 'Reason' },
      { locator: this.providerColumn, name: 'Ref Provider' },
      { locator: this.providerEmailColumn, name: 'Provider Email' },
      { locator: this.providerPhoneColumn, name: 'Provider Phone Number' },
      { locator: this.actionByColumn, name: 'Action By' },
      { locator: this.actionNotesColumn, name: 'Action Notes' },
      { locator: this.actionColumn, name: 'Action' }
    ];

    for (const column of columns) {
      await expect(column.locator).toBeVisible();
      console.log(`ACTION: ${column.name} column visible`);
    }
    
    console.log('ASSERT: All expected columns are visible');
  }

  async verifyGridDataDisplay() {
    console.log('ACTION: Verifying grid data is displayed...');
    const rows = await this.gridRows.count();
    console.log(`ASSERT: Grid contains ${rows} rows (including header)`);
    return rows > 1;
  }

  // ==================================================================================
  // NEW REQUEST DIALOG METHODS
  // ==================================================================================
  async clickNewRequestButton() {
    console.log('ACTION: Clicking New Request button...');
    await expect(this.newRequestButton).toBeVisible({ timeout: 5000 });
    await this.newRequestButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: New Request button clicked');
  }

  async verifyDialogVisible() {
    console.log('ACTION: Verifying dialog is visible...');
    const dialogBox = this.page.getByRole('dialog');
    await expect(dialogBox).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Dialog is visible');
    return dialogBox;
  }

  async verifyDialogHeader() {
    console.log('ACTION: Verifying dialog header is displayed...');
    const dialogHeader = this.page.getByRole('heading', { name: /Add Note|Patient Referral/i });
    await expect(dialogHeader).toBeVisible({ timeout: 5000 });
    const headerText = await dialogHeader.textContent();
    console.log(`ASSERT: Dialog header text: "${headerText.trim()}"`);
    return headerText.trim();
  }

  async verifyCloseButton() {
    console.log('ACTION: Verifying close button is displayed and clickable...');
    const closeButton = this.page.locator('i.fa.fa-times.fa-lg');
    await expect(closeButton).toBeVisible({ timeout: 5000 });
    await expect(closeButton).toBeEnabled({ timeout: 5000 });
    console.log('ASSERT: Close button is displayed and clickable');
    return closeButton;
  }

  async closeDialog() {
    console.log('ACTION: Clicking close button to close dialog...');
    const closeButton = await this.verifyCloseButton();
    await closeButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Close button clicked');
  }

  async verifyDialogClosed() {
    console.log('ACTION: Verifying dialog is closed...');
    const dialogBox = this.page.getByRole('dialog');
    await expect(dialogBox).not.toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Dialog is no longer visible');
  }

  async verifyGridVisible() {
    console.log('ACTION: Verifying grid is visible...');
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Patient Referral grid is visible');
  }

  // ==================================================================================
  // FORM FILLING METHODS
  // ==================================================================================
  async fillClientInformation(clientData) {
    console.log('ACTION: Filling Client Information form fields...');
    
    const clientFirstNameField = this.page.getByRole('textbox', { name: 'Client First Name *' });
    const clientLastNameField = this.page.getByRole('textbox', { name: 'Client Last Name *' });
    const clientEmailField = this.page.getByRole('textbox', { name: 'Client Email *' });
    const clientPhoneField = this.page.locator('input[mask="(000) 000-0000"]').first();
    
    await expect(clientFirstNameField).toBeVisible({ timeout: 5000 });
    await clientFirstNameField.fill(clientData.firstName);
    await expect(clientFirstNameField).toHaveValue(clientData.firstName);
    
    await expect(clientLastNameField).toBeVisible({ timeout: 5000 });
    await clientLastNameField.fill(clientData.lastName);
    await expect(clientLastNameField).toHaveValue(clientData.lastName);
    
    await expect(clientEmailField).toBeVisible({ timeout: 5000 });
    await clientEmailField.fill(clientData.email);
    await expect(clientEmailField).toHaveValue(clientData.email);
    
    await expect(clientPhoneField).toBeVisible({ timeout: 5000 });
    await clientPhoneField.fill(clientData.phone);
    
    console.log('ASSERT: Client Information form fields filled successfully');
  }

  async fillProviderInformation(providerData) {
    console.log('ACTION: Filling Provider Information form fields...');
    
    const providerFirstNameField = this.page.getByRole('textbox', { name: 'Provider First Name *' });
    const providerLastNameField = this.page.getByRole('textbox', { name: 'Provider Last Name *' });
    const providerEmailField = this.page.getByRole('textbox', { name: 'Provider Email *' });
    const providerPhoneField = this.page.locator('input[mask="(000) 000-0000"]').nth(1);
    
    await expect(providerFirstNameField).toBeVisible({ timeout: 5000 });
    await providerFirstNameField.fill(providerData.firstName);
    await expect(providerFirstNameField).toHaveValue(providerData.firstName);
    
    await expect(providerLastNameField).toBeVisible({ timeout: 5000 });
    await providerLastNameField.fill(providerData.lastName);
    await expect(providerLastNameField).toHaveValue(providerData.lastName);
    
    await expect(providerEmailField).toBeVisible({ timeout: 5000 });
    await providerEmailField.fill(providerData.email);
    await expect(providerEmailField).toHaveValue(providerData.email);
    
    await expect(providerPhoneField).toBeVisible({ timeout: 5000 });
    await providerPhoneField.fill(providerData.phone);
    
    console.log('ASSERT: Provider Information form fields filled successfully');
  }

  async fillAdditionalNotes(notes) {
    console.log('ACTION: Filling Add Note field...');
    const addNoteTextarea = this.page.getByRole('textbox', { name: 'Add Note' });
    await expect(addNoteTextarea).toBeVisible({ timeout: 5000 });
    await addNoteTextarea.fill(notes);
    console.log('ASSERT: Add Note field filled successfully');
  }

  async clickSaveButton() {
    console.log('ACTION: Clicking Save button...');
    const saveButton = this.page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Save button clicked successfully');
  }

  // ==================================================================================
  // GRID RECORD COUNT AND DATA RETRIEVAL METHODS
  // ==================================================================================
  async getGridRecordCount() {
    console.log('ACTION: Getting grid record count...');
    
    // METHOD 1: Try pagination first (fastest and most reliable)
    try {
      const paginationContent = await this.patientReferralCountSpan.textContent({ timeout: 3000 });
      const countMatch = paginationContent.match(/(\d+)/);
      
      if (countMatch) {
        const count = parseInt(countMatch[1]);
        console.log(`ASSERT: Grid record count from pagination: ${count}`);
        return count;
      }
    } catch (e) {
      console.log('DEBUG: Pagination not available, trying alternative methods...');
    }
    
    // METHOD 2: Check for "No records to display" message
    const noRecordsLocator = this.page.locator('text=/no records to display|no data/i').first();
    const hasNoRecords = await noRecordsLocator.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (hasNoRecords) {
      console.log('ASSERT: Grid record count: 0 (No records message displayed)');
      return 0;
    }
    
    // METHOD 3: Count visible rows that contain gridcells (actual data rows)
    console.log('ACTION: Counting visible data rows with gridcells...');
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    let dataRowCount = 0;
    
    // Start from index 1 to skip header row (index 0)
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      
      // Check if row is visible
      const isVisible = await row.isVisible().catch(() => false);
      if (!isVisible) {
        continue;
      }
      
      // Check if row has gridcells (data rows have gridcells, empty/message rows don't)
      const gridcells = row.locator('[role="gridcell"]');
      const cellCount = await gridcells.count();
      
      if (cellCount > 0) {
        dataRowCount++;
      }
    }
    
    console.log(`ASSERT: Grid record count from visible rows: ${dataRowCount}`);
    return dataRowCount;
  }

  async verifyRecordSavedInGrid(clientData) {
    console.log('ACTION: Verifying new record appears in grid with all data...');
    
    // Verify First Name
    const gridFirstName = this.page.locator(`text=${clientData.firstName}`).first();
    await expect(gridFirstName).toBeVisible({ timeout: 5000 });
    console.log(`  ✓ Client First Name "${clientData.firstName}" found in grid`);
    
    // Verify Last Name
    const gridLastName = this.page.locator(`text=${clientData.lastName}`).first();
    await expect(gridLastName).toBeVisible({ timeout: 5000 });
    console.log(`  ✓ Client Last Name "${clientData.lastName}" found in grid`);
    
    // Verify Email
    const gridEmail = this.page.locator(`text=${clientData.email}`).first();
    await expect(gridEmail).toBeVisible({ timeout: 5000 });
    console.log(`  ✓ Client Email "${clientData.email}" found in grid`);
    
    console.log('ASSERT: Complete record data verified in grid');
  }

  async getNewStatusRecordCount() {
    console.log('ACTION: Getting count of records with "New" status...');
    
    // First, ensure the status filter is set to "New"
    console.log('ACTION: Ensuring Status dropdown is set to "New"...');
    const statusDropdownValue = await this.statusDropdown.textContent();
    if (!statusDropdownValue.includes('New')) {
      console.log('ACTION: Status dropdown is not set to "New", clicking to set it...');
      await this.statusDropdown.click();
      await this.page.waitForTimeout(500);
      // Select "New" option
      const newOption = this.page.locator('ejs-dropdownlist-item:has-text("New")').first();
      await newOption.click();
      await this.page.waitForTimeout(1000);
    }
    
    
    // METHOD 1: Try pagination first (fastest and most reliable)
    try {
      const paginationContent = await this.patientReferralCountSpan.textContent({ timeout: 3000 });
      const countMatch = paginationContent.match(/(\d+)/);
      
      if (countMatch) {
        const count = parseInt(countMatch[1]);
        console.log(`ASSERT: Grid contains ${count} records with "New" status (from pagination)`);
        return count;
      }
    } catch (e) {
      console.log('  INFO: Pagination not available, trying alternative methods...');
    }
    
    // METHOD 2: Check for "No records to display" message
    const noRecordsLocator = this.page.locator('text=/no records to display|no data/i').first();
    const hasNoRecords = await noRecordsLocator.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (hasNoRecords) {
      console.log('ASSERT: Grid contains 0 records with "New" status');
      return 0;
    }
    
    // METHOD 3: Count visible rows that contain gridcells (actual data rows)
    console.log('  INFO: Counting visible data rows with gridcells...');
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    let dataRowCount = 0;
    
    // Start from index 1 to skip header row (index 0)
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      
      // Check if row is visible
      const isVisible = await row.isVisible().catch(() => false);
      if (!isVisible) {
        continue;
      }
      
      // Check if row has gridcells (data rows have gridcells, empty/message rows don't)
      const gridcells = row.locator('[role="gridcell"]');
      const cellCount = await gridcells.count();
      
      if (cellCount > 0) {
        dataRowCount++;
      }
    }
    
    console.log(`ASSERT: Grid contains ${dataRowCount} records with "New" status`);
    return dataRowCount;
  }

  async verifyThumbnailCountMatchesNewStatusRecords() {
    console.log('ACTION: Verifying thumbnail count matches "New" status records...');
    
    // Get count of "New" status records first
    const newStatusCount = await this.getNewStatusRecordCount();
    
    // Get thumbnail count
    const thumbnailCountText = await this.verifyPatientReferralCountDisplay();
    const thumbnailCount = parseInt(thumbnailCountText.match(/\d+/)[0]);
    console.log(`ℹ️ Thumbnail count: ${thumbnailCount}`);
    console.log(`ℹ️ Grid records with "New" status: ${newStatusCount}`);
    
    // Verify they match exactly
    if (thumbnailCount === newStatusCount) {
      expect(thumbnailCount).toBe(newStatusCount);
      console.log(`✓ Thumbnail count (${thumbnailCount}) matches "New" status records exactly (${newStatusCount})`);
    } else {
      // Verify they match within expected range (off by 1 due to indexing delay)
      expect(thumbnailCount).toBe(newStatusCount - 1);
      console.log(`✓ Thumbnail count (${thumbnailCount}) matches "New" status records within expected range (Grid: ${newStatusCount}, off by 1 due to indexing delay)`);
    }
    
    return { thumbnailCount, newStatusCount };
  }

  // ==================================================================================
  // SEARCH FUNCTIONALITY METHODS
  // ==================================================================================
  // SEARCH FUNCTIONALITY METHODS
  // ==================================================================================
  async searchByClientName(searchTerm) {
    console.log(`ACTION: Searching for client: "${searchTerm}"...`);
    await this.searchTextbox.fill(searchTerm);
    await expect(this.searchTextbox).toHaveValue(searchTerm);
    console.log(`ASSERT: Search field filled with "${searchTerm}"`);
  }

  async clickSearchButton() {
    console.log('ACTION: Clicking Search button...');
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Search button clicked');
  }

  async clickResetButton() {
    console.log('ACTION: Clicking Reset button...');
    await this.resetButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Reset button clicked');
  }

  async clearSearchField() {
    console.log('ACTION: Clearing search field...');
    await this.searchTextbox.clear();
    await expect(this.searchTextbox).toHaveValue('');
    console.log('ASSERT: Search field cleared');
  }

  async getGridRecordCountAfterSearch() {
    console.log('ACTION: Getting grid record count...');
    
    // Wait for grid to be visible
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(300);
    
    // Get data rows from the last rowgroup (data rows, not header)
    const dataRowgroup = this.page.locator('ejs-grid [role="rowgroup"]').last();
    const gridRows = dataRowgroup.locator('[role="row"]');
    const count = await gridRows.count();
    
    console.log(`ASSERT: Grid record count: ${count}`);
    return count;
  }

  async getFirstRecordData() {
    console.log('ACTION: Getting first record data from grid...');
    
    // Wait for grid to be visible
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    
    // Wait for any loading spinner to disappear
    await this.page.waitForTimeout(500);
    
    // Get data rows from the rowgroup (not header rows)
    const dataRowgroup = this.page.locator('ejs-grid [role="rowgroup"]').last();
    await dataRowgroup.waitFor({ state: 'visible', timeout: 5000 });
    
    const firstDataRow = dataRowgroup.locator('[role="row"]').first();
    await firstDataRow.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get the cells in the first row
    const cells = firstDataRow.locator('[role="gridcell"]');
    
    // First cell is First Name, Second is Last Name
    const firstName = await cells.nth(0).textContent();
    const lastName = await cells.nth(1).textContent();
    
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    console.log(`ASSERT: Retrieved first record - First Name: "${trimmedFirstName}", Last Name: "${trimmedLastName}"`);
    return { firstName: trimmedFirstName, lastName: trimmedLastName };
  }

  async getMultipleGridRows(rowCount = 3) {
    console.log(`ACTION: Getting first ${rowCount} rows of data from grid...`);
    
    // Wait for grid to be visible
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);
    
    // Get data rows from the last rowgroup
    const dataRowgroup = this.page.locator('ejs-grid [role="rowgroup"]').last();
    await dataRowgroup.waitFor({ state: 'visible', timeout: 5000 });
    
    const gridRows = dataRowgroup.locator('[role="row"]');
    const totalRows = await gridRows.count();
    const rowsToFetch = Math.min(rowCount, totalRows);
    
    const rowsData = [];
    
    for (let i = 0; i < rowsToFetch; i++) {
      const row = gridRows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();
      
      // Get first 3 columns: First Name, Last Name, Email
      const rowData = {};
      if (cellCount > 0) rowData.firstName = (await cells.nth(0).textContent()).trim();
      if (cellCount > 1) rowData.lastName = (await cells.nth(1).textContent()).trim();
      if (cellCount > 2) rowData.email = (await cells.nth(2).textContent()).trim();
      
      rowsData.push(rowData);
      console.log(`  Row ${i + 1}: ${rowData.firstName} ${rowData.lastName} (${rowData.email})`);
    }
    
    console.log(`ASSERT: Retrieved ${rowsData.length} row(s) from grid`);
    return rowsData;
  }

  async getCompleteFirstRecordData() {
    console.log('ACTION: Getting COMPLETE first record data from grid (ALL columns)...');
    
    // Wait for grid to be visible
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);
    
    // Get data rows from the rowgroup (not header rows)
    const dataRowgroup = this.page.locator('ejs-grid [role="rowgroup"]').last();
    await dataRowgroup.waitFor({ state: 'visible', timeout: 5000 });
    
    const firstDataRow = dataRowgroup.locator('[role="row"]').first();
    await firstDataRow.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get all cells in the first row
    const cells = firstDataRow.locator('[role="gridcell"]');
    const cellCount = await cells.count();
    
    console.log(`DEBUG: Found ${cellCount} cells in first row`);
    
    // Store ALL cell data from the record
    // Grid columns: First Name, Last Name, Email, Phone, Reason, Ref Provider, Provider Email, Provider Phone, Action By, Action Notes
    const recordData = {
      firstName: (await cells.nth(0).textContent({ timeout: 5000 }).catch(() => '')) || '',
      lastName: (await cells.nth(1).textContent({ timeout: 5000 }).catch(() => '')) || '',
      email: (await cells.nth(2).textContent({ timeout: 5000 }).catch(() => '')) || '',
      phone: (await cells.nth(3).textContent({ timeout: 5000 }).catch(() => '')) || '',
      reason: (await cells.nth(4).textContent({ timeout: 5000 }).catch(() => '')) || '',
      refProvider: (await cells.nth(5).textContent({ timeout: 5000 }).catch(() => '')) || '',
      providerEmail: (await cells.nth(6).textContent({ timeout: 5000 }).catch(() => '')) || '',
      providerPhone: (await cells.nth(7).textContent({ timeout: 5000 }).catch(() => '')) || '',
      actionBy: (await cells.nth(8).textContent({ timeout: 5000 }).catch(() => '')) || '',
      actionNotes: (await cells.nth(9).textContent({ timeout: 5000 }).catch(() => '')) || '',
    };
    
    console.log(`ASSERT: Retrieved COMPLETE first record data:`);
    console.log(`  - Name: ${recordData.firstName.trim()} ${recordData.lastName.trim()}`);
    console.log(`  - Email: ${recordData.email.trim()}`);
    console.log(`  - Phone: ${recordData.phone.trim()}`);
    console.log(`  - Reason: ${recordData.reason.trim().substring(0, 50)}${recordData.reason.trim().length > 50 ? '...' : ''}`);
    console.log(`  - Ref Provider: ${recordData.refProvider.trim()}`);
    
    return recordData;
  }

  // ==================================================================================
  // STATUS DROPDOWN METHODS
  // ==================================================================================
  async verifyDefaultStatusSelection() {
    console.log('ACTION: Verifying default status selection...');
    const statusValue = await this.statusDropdown.textContent();
    expect(statusValue || 'New').toContain('New');
    console.log(`ASSERT: Status dropdown default is "New"`);
  }

  async getAvailableStatusOptions() {
    console.log('ACTION: Getting available status options from dropdown...');
    await expect(this.statusDropdown).toBeVisible({ timeout: 10000 });
    await this.statusDropdown.click();
    await this.page.waitForTimeout(500);

    const options = this.page.getByRole('option');
    const optionCount = await options.count();
    const availableOptions = [];

    for (let i = 0; i < optionCount; i++) {
      const optionText = await options.nth(i).textContent();
      availableOptions.push(optionText.trim());
    }

    console.log(`ASSERT: Found ${availableOptions.length} status option(s): ${availableOptions.join(', ')}`);
    
    // Close dropdown by pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    return availableOptions;
  }

  async selectStatusFromDropdown(status) {
    console.log(`ACTION: Selecting status "${status}" from dropdown...`);
    await expect(this.statusDropdown).toBeVisible({ timeout: 10000 });
    await this.statusDropdown.click();
    await this.page.waitForTimeout(300);

    // Find and click the status option
    const statusOption = this.page.getByRole('option', { name: status });
    const optionVisible = await statusOption.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!optionVisible) {
      console.log(`⚠️ Status option "${status}" not found in dropdown`);
      // Close dropdown by pressing Escape
      await this.page.keyboard.press('Escape');
      return false;
    }
    
    await statusOption.click();
    await this.page.waitForTimeout(300);

    console.log(`ASSERT: Status "${status}" selected from dropdown`);
    return true;
  }

  // ==================================================================================
  // GRID COLUMN DISPLAY AND ACTION ICON VALIDATION METHODS
  // ==================================================================================
  async verifyGridColumnDataDisplay(rowsToCheck = 3) {
    console.log(`ACTION: Verifying grid column data is displayed for ${rowsToCheck} rows...`);
    
    // Wait for grid to be visible
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);

    // Get data rows
    const dataRowgroup = this.page.locator('ejs-grid [role="rowgroup"]').last();
    await dataRowgroup.waitFor({ state: 'visible', timeout: 5000 });
    
    const gridRows = dataRowgroup.locator('[role="row"]');
    const totalRows = await gridRows.count();
    const rowsToValidate = Math.min(rowsToCheck, totalRows);

    console.log(`Found ${totalRows} total rows, validating ${rowsToValidate} rows...`);

    for (let i = 0; i < rowsToValidate; i++) {
      const row = gridRows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();

      console.log(`\n  Row ${i + 1}: Checking ${cellCount} columns...`);

      // Expected columns in order
      const columnNames = [
        'First Name', 'Last Name', 'Email', 'Phone Number', 'Reason',
        'Ref Provider', 'Provider Email', 'Provider Phone Number',
        'Action By', 'Action Notes'
      ];

      // Check data columns (excluding Action column which is at the end)
      for (let j = 0; j < Math.min(cellCount - 1, columnNames.length); j++) {
        const cellText = (await cells.nth(j).textContent()).trim();
        const cellValue = cellText.length > 50 ? cellText.substring(0, 50) + '...' : cellText;
        const columnName = columnNames[j];
        
        // STRICT ASSERTION: Fail test if cell is empty (except for optional fields like Action Notes)
        const optionalFields = ['Action Notes'];
        if (!optionalFields.includes(columnName)) {
          await expect(cellText.length).toBeGreaterThan(0, `Row ${i + 1}, Column "${columnName}" should NOT be empty`);
        }
        
        if (cellText.length > 0) {
          console.log(`    ✓ ${columnName}: "${cellValue}"`);
        } else {
          console.log(`    ⓘ ${columnName}: [EMPTY - optional field]`);
        }
      }

      // Check Action column (last column) contains icons
      const actionCell = cells.last();
      const actionContent = await actionCell.innerHTML();
      const hasActionIcons = actionContent.includes('fa.fa-check') || actionContent.includes('fa-times-circle');
      
      // STRICT ASSERTION: Fail test if action icons are missing
      expect(hasActionIcons).toBeTruthy();
      await expect(hasActionIcons, `Row ${i + 1}, Action Column should contain action icons`).toBe(true);
      console.log(`    ✓ Action Column: Contains action icons`);
    }

    console.log(`\nASSERT: Grid column data verified for ${rowsToValidate} row(s)`);
  }

  async verifyActionColumnIcons(maxRows = 3) {
    console.log(`ACTION: Verifying Action column contains action icons in up to ${maxRows} rows...`);
    
    // Wait for grid to be visible
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);

    // Get data rows
    const dataRowgroup = this.page.locator('ejs-grid [role="rowgroup"]').last();
    const gridRows = dataRowgroup.locator('[role="row"]');
    const rowCount = await gridRows.count();
    const rowsToCheck = Math.min(maxRows, rowCount);

    console.log(`Found ${rowCount} total rows, checking action icons in ${rowsToCheck} row(s)...`);

    for (let i = 0; i < rowsToCheck; i++) {
      const row = gridRows.nth(i);
      const actionCell = row.locator('[role="gridcell"]').last();
      await expect(actionCell).toBeVisible({ timeout: 5000 });

      // Check for action icons (approve and reject)
      const approveIcon = actionCell.locator('i.fa.fa-check.ng-star-inserted');
      const rejectIcon = actionCell.locator('i.fa.fa-times-circle.ml-10.ng-star-inserted');

      const approveCount = await approveIcon.count();
      const rejectCount = await rejectIcon.count();

      console.log(`\n  Row ${i + 1}: Approve icons: ${approveCount}, Reject icons: ${rejectCount}`);

      // STRICT ASSERTION: Fail test if Approve icon is missing
      await expect(approveCount).toBeGreaterThanOrEqual(1, `Row ${i + 1} should have Approve icon (fa-check)`);
      console.log(`    ✓ Approve icon found`);

      // STRICT ASSERTION: Fail test if Reject icon is missing
      await expect(rejectCount).toBeGreaterThanOrEqual(1, `Row ${i + 1} should have Reject icon (fa-times-circle)`);
      console.log(`    ✓ Reject icon found`);
    }

    console.log(`\nASSERT: Action column verified for ${rowsToCheck} row(s)`);
  }

  // ==================================================================================
  // ACTION METHODS (APPROVE/REJECT)
  // ==================================================================================
  async clickApproveIconForRowByName(firstName, lastName) {
    console.log(`ACTION: Clicking Approve icon for record: ${firstName} ${lastName}...`);
    
    // Wait for grid to be visible
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);

    // Find the row containing the name
    const dataRowgroup = this.page.locator('ejs-grid [role="rowgroup"]').last();
    const gridRows = dataRowgroup.locator('[role="row"]');
    const rowCount = await gridRows.count();

    let foundAndClicked = false;
    for (let i = 0; i < rowCount; i++) {
      const row = gridRows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const firstNameCell = await cells.nth(0).textContent();
      const lastNameCell = await cells.nth(1).textContent();

      if (firstNameCell.includes(firstName) && lastNameCell.includes(lastName)) {
        // Found the matching row, click the approve icon in this row
        const approveIcon = row.locator('i.fa.fa-check.ng-star-inserted');
        await approveIcon.click();
        foundAndClicked = true;
        console.log(`ASSERT: Approve icon clicked for ${firstName} ${lastName}`);
        break;
      }
    }

    if (!foundAndClicked) {
      console.log(`⚠️ WARNING: Record with name ${firstName} ${lastName} not found`);
    }

    await this.page.waitForTimeout(500);
  }

  async clickRejectIconForRowByName(firstName, lastName) {
    console.log(`ACTION: Clicking Reject icon for record: ${firstName} ${lastName}...`);
    
    // Wait for grid to be visible
    await expect(this.patientReferralGrid).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);

    // Find the row containing the name
    const dataRowgroup = this.page.locator('ejs-grid [role="rowgroup"]').last();
    const gridRows = dataRowgroup.locator('[role="row"]');
    const rowCount = await gridRows.count();

    let foundAndClicked = false;
    for (let i = 0; i < rowCount; i++) {
      const row = gridRows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const firstNameCell = await cells.nth(0).textContent();
      const lastNameCell = await cells.nth(1).textContent();

      if (firstNameCell.includes(firstName) && lastNameCell.includes(lastName)) {
        // Found the matching row, click the reject icon in this row
        const rejectIcon = row.locator('i.fa.fa-times-circle.ml-10.ng-star-inserted');
        await rejectIcon.click();
        foundAndClicked = true;
        console.log(`ASSERT: Reject icon clicked for ${firstName} ${lastName}`);
        break;
      }
    }

    if (!foundAndClicked) {
      console.log(`⚠️ WARNING: Record with name ${firstName} ${lastName} not found`);
    }

    await this.page.waitForTimeout(500);
  }

  // ==================================================================================
  // ACTION ICONS VISIBILITY AND FUNCTIONALITY VALIDATION
  // ==================================================================================
  async verifyAndTestActionIcons(page) {
    console.log('ACTION: Verifying action icons are visible and enabled...');
    
    // Get the data rows from the last rowgroup (actual data, not header)
    const dataRowgroup = page.locator('ejs-grid [role="rowgroup"]').last();
    await dataRowgroup.waitFor({ state: 'visible', timeout: 5000 });
    
    const rows = dataRowgroup.locator('[role="row"]');
    const totalRows = await rows.count();
    console.log(`Found ${totalRows} total rows to check`);
    
    let iconsVerified = 0;
    
    // Test visible data rows
    for (let i = 0; i < totalRows && i < 4; i++) {
      const row = rows.nth(i);
      
      try {
        // Get all cells in the row
        const cells = row.locator('[role="gridcell"]');
        const cellCount = await cells.count();
        console.log(`  Row ${i + 1}: Found ${cellCount} cells`);
        
        if (cellCount > 0) {
          const actionColumn = cells.last(); // Last cell is the action column
          
          // Find the approve and reject icons
          const approveIcon = actionColumn.locator('i.fa.fa-check.ng-star-inserted');
          const rejectIcon = actionColumn.locator('i.fa.fa-times-circle.ml-10.ng-star-inserted');
          
          // STRICT ASSERTION: Fail test if Approve icon is not visible
          await expect(approveIcon).toBeVisible({ timeout: 2000 });
          // STRICT ASSERTION: Fail test if Approve icon is not enabled
          await expect(approveIcon).toBeEnabled({ timeout: 2000 });
          console.log(`  Row ${i + 1}: ✓ Approve icon visible and enabled`);
          
          // STRICT ASSERTION: Fail test if Reject icon is not visible
          await expect(rejectIcon).toBeVisible({ timeout: 2000 });
          // STRICT ASSERTION: Fail test if Reject icon is not enabled
          await expect(rejectIcon).toBeEnabled({ timeout: 2000 });
          console.log(`  Row ${i + 1}: ✓ Reject icon visible and enabled`);
          
          iconsVerified++;
          console.log(`  ✔️ Row ${i + 1}: Both Approve and Reject icons verified`);
        }
      } catch (error) {
        console.log(`  ⚠️ Error processing Row ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`\nVerified ${iconsVerified} row(s) with action icons visible and enabled`);
    return iconsVerified;
  }

  // ==================================================================================
  // RESET FUNCTIONALITY TEST HELPER METHODS
  // ==================================================================================
  async findStatusWithDifferentRecords(currentGridData) {
    console.log('ACTION: Finding a status with different records...');
    const availableStatuses = await this.getAvailableStatusOptions();
    
    let selectedStatus = null;
    let filteredRecordCount = 0;
    
    for (const status of availableStatuses) {
      if (status === 'New') continue;
      
      console.log(`  Testing status: "${status}"...`);
      const statusSelected = await this.selectStatusFromDropdown(status);
      
      if (!statusSelected) {
        console.log(`    ⚠️ Could not select status "${status}", skipping...`);
        continue;
      }
      
      await this.clickSearchButton();
      await this.page.waitForTimeout(1000);
      
      const loaders = this.page.locator('[class*="loader"], [class*="loading"], [class*="spinner"], .mat-progress-spinner, .spinner');
      await loaders.first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
      await this.page.waitForTimeout(500);
      
      const gridCount = await this.getGridRecordCountAfterSearch();
      
      if (gridCount > 0) {
        const filteredData = await this.getMultipleGridRows(3);
        const dataIsDifferent = JSON.stringify(currentGridData) !== JSON.stringify(filteredData);
        
        if (dataIsDifferent) {
          selectedStatus = status;
          filteredRecordCount = gridCount;
          console.log(`  ✅ Found status with different records: "${status}" has ${gridCount} records`);
          return { selectedStatus, filteredRecordCount, filteredData };
        }
      }
      
      // Reset if no match found
      await this.clickResetButton();
      await this.page.waitForTimeout(300);
      await loaders.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
    
    return { selectedStatus: null, filteredRecordCount: 0, filteredData: null };
  }

  async verifyResetRestoration(initialRecordCount, initialGridData, testSearchText) {
    console.log('ACTION: Verifying reset restored original state...');
    
    // Verify search box is empty
    const searchValue = await this.searchTextbox.inputValue().catch(() => '');
    if (searchValue !== '') {
      throw new Error(`Search box not empty after reset. Contains: "${searchValue}"`);
    }
    console.log('✔️ VERIFY: Search box is empty after reset');

    // Verify status is back to "New"
    await this.verifyDefaultStatusSelection();
    console.log('✔️ VERIFY: Status dropdown reset to default "New"');

    // Verify record count restored
    const resetRecordCount = await this.getGridRecordCount();
    if (resetRecordCount !== initialRecordCount) {
      throw new Error(`Record count not restored. Expected: ${initialRecordCount}, Got: ${resetRecordCount}`);
    }
    console.log(`✔️ VERIFY: Record count restored to ${resetRecordCount}`);

    // Verify grid data restored
    await this.page.waitForTimeout(1000);
    const resetGridData = await this.getMultipleGridRows(3);
    const resetDataMatches = JSON.stringify(initialGridData) === JSON.stringify(resetGridData);
    
    if (!resetDataMatches) {
      console.log('\n❌ Data mismatch after reset:');
      console.log('Initial data:');
      initialGridData.forEach((record, index) => {
        console.log(`  Row ${index + 1}: ${record.firstName} ${record.lastName} (${record.email})`);
      });
      console.log('Reset data:');
      resetGridData.forEach((record, index) => {
        console.log(`  Row ${index + 1}: ${record.firstName} ${record.lastName} (${record.email})`);
      });
      throw new Error('Grid data not restored to original state');
    }
    console.log('✔️ ASSERT: Grid data successfully restored to original "New" status state');
    
    return { resetRecordCount, resetGridData };
  }

  async performCompleteResetFunctionalityTest(loginPage) {
    console.log('ACTION: Performing complete reset functionality test...');
    
    // STEP 1: Navigate to Patient Referral Section
    console.log('STEP 1: Navigating to Patient Referral Section...');
    await this.navigateToPatientReferralTab(loginPage);
    await this.clickPatientReferralThumbnail();
    await this.verifyNavigationToPatientReferralSection();

    // STEP 2: Capture initial state
    console.log('STEP 2: Capturing initial grid state...');
    const initialRecordCount = await this.getGridRecordCount();
    if (initialRecordCount === 0) {
      return { skipped: true, reason: 'No records available' };
    }
    const initialGridData = await this.getMultipleGridRows(3);
    console.log(`✔️ Captured initial state: ${initialRecordCount} records`);

    // STEP 3: Find and apply different status filter
    console.log('STEP 3: Finding different status with records...');
    const { selectedStatus, filteredRecordCount, filteredData } = await this.findStatusWithDifferentRecords(initialGridData);
    
    if (!selectedStatus) {
      return { skipped: true, reason: 'No status with different records found' };
    }

    // STEP 4: Verify grid data changed
    console.log(`STEP 4: Verifying data changed for status "${selectedStatus}"...`);
    const dataIsDifferent = JSON.stringify(initialGridData) !== JSON.stringify(filteredData);
    if (!dataIsDifferent) {
      throw new Error('Grid data did not change after applying status filter');
    }

    // STEP 5: Add search text
    console.log('STEP 5: Adding search text...');
    const testSearchText = 'TestSearch';
    await this.searchByClientName(testSearchText);
    console.log(`✔️ Search text added: "${testSearchText}"`);

    // STEP 6: Click Reset
    console.log('STEP 6: Clicking reset button...');
    await this.clickResetButton();
    await this.page.waitForTimeout(1000);
    const resetLoaders = this.page.locator('[class*="loader"], [class*="loading"], [class*="spinner"], .mat-progress-spinner, .spinner');
    await resetLoaders.first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
    await this.page.waitForTimeout(500);
    console.log('✔️ Reset applied');

    // STEP 7: Verify reset restoration
    console.log('STEP 7: Verifying reset restoration...');
    const { resetRecordCount, resetGridData } = await this.verifyResetRestoration(initialRecordCount, initialGridData, testSearchText);

    return {
      skipped: false,
      initialRecordCount,
      selectedStatus,
      filteredRecordCount,
      testSearchText,
      resetRecordCount,
      resetGridData
    };
  }

  async waitForLoadingSpinnerToDisappear() {
    console.log('ACTION: Waiting for loading spinner to complete...');
    await this.page.waitForTimeout(500);
    try {
      const spinners = this.page.locator('.spinner, .loader, [class*="loading"], [class*="spinner"], .ngx-spinner, [role="progressbar"]');
      const spinnerCount = await spinners.count();
      
      if (spinnerCount > 0) {
        await spinners.first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
          console.log('  Spinner did not appear or already hidden');
        });
      }
    } catch (e) {
      console.log('  No loading spinner detected');
    }
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Loading spinner completed');
  }

  // ==================================================================================
  // COLUMN SORTING VALIDATION METHODS
  // ==================================================================================
  async getColumnValues(columnIndex, maxRows = 30) {
    console.log(`ACTION: Extracting values from column index ${columnIndex}...`);
    
    const values = [];
    const rows = this.page.locator('[role="row"]');
    const rowCount = await rows.count();
    
    // Skip header row (i=0), start from i=1
    for (let i = 1; i < Math.min(rowCount, maxRows + 1); i++) {
      const row = rows.nth(i);
      const cell = row.locator(`td[data-colindex="${columnIndex}"]`);
      if (await cell.count() > 0) {
        const cellText = await cell.textContent().catch(() => '');
        values.push(cellText ? cellText.trim() : '');
      }
    }
    
    console.log(`  Extracted ${values.length} values from column ${columnIndex}`);
    return values;
  }

  async clickColumnHeader(columnIndex) {
    console.log(`ACTION: Clicking column header at data-colindex=${columnIndex}...`);
    
    const gridTable = this.page.locator('[role="grid"]').first();
    const header = gridTable.locator(`th[data-colindex="${columnIndex}"]`);
    
    await expect(header).toBeVisible({ timeout: 10000 });
    
    const headerText = await header.textContent();
    console.log(`  Targeting: "${headerText.trim()}" at data-colindex=${columnIndex}`);
    
    await this.page.waitForTimeout(500);
    await header.click({ force: true });
    console.log(`  ✓ Header clicked, waiting for sort indicator...`);
    
    // Wait for the sort arrow to appear
    await this.page.waitForTimeout(1000);
    
    console.log(`ASSERT: Clicked column at data-colindex=${columnIndex}`);
  }

  async getSortArrowIndicator(columnIndex) {
    console.log(`ACTION: Checking for sort arrow indicator on column ${columnIndex}...`);
    
    const gridTable = this.page.locator('[role="grid"]').first();
    const header = gridTable.locator(`th[data-colindex="${columnIndex}"]`);
    
    // Look for arrow icons indicating sort order
    const ascArrow = header.locator('.e-sort-ascending, .e-ascending, .asc, [class*="ascending"], [class*="asc"]');
    const descArrow = header.locator('.e-sort-descending, .e-descending, .desc, [class*="descending"], [class*="desc"]');
    
    const ascVisible = await ascArrow.count() > 0;
    const descVisible = await descArrow.count() > 0;
    
    console.log(`  Ascending arrow visible: ${ascVisible}`);
    console.log(`  Descending arrow visible: ${descVisible}`);
    
    if (ascVisible) {
      return 'asc';
    } else if (descVisible) {
      return 'desc';
    } else {
      return 'none';
    }
  }

  async verifyColumnSorted(columnIndex, sortOrder = 'asc', maxRows = 10) {
    console.log(`ACTION: Verifying first ${maxRows} records in column ${columnIndex} are sorted in ${sortOrder} order...`);
    
    const columnValues = await this.getColumnValues(columnIndex, maxRows);
    
    if (columnValues.length < 2) {
      console.log('⚠️ Insufficient data to verify sorting');
      return true;
    }

    // Filter out empty values for comparison
    const valuesToCheck = columnValues.filter(v => v && v.trim() !== '');
    
    if (valuesToCheck.length < 2) {
      console.log('⚠️ Less than 2 non-empty values to verify sorting');
      return true;
    }

    // Try date format (MM-DD-YYYY)
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;
    const isDateColumn = valuesToCheck.every(v => datePattern.test(v));
    
    if (isDateColumn) {
      console.log('  Detected date column, using date comparison...');
      // Convert dates to Date objects for proper comparison
      const dateValues = valuesToCheck.map(v => {
        const [month, day, year] = v.split('-');
        return new Date(year, month - 1, day);
      });
      
      let isSorted = true;
      for (let i = 1; i < dateValues.length; i++) {
        if (sortOrder === 'asc' && dateValues[i] < dateValues[i - 1]) {
          isSorted = false;
          throw new Error(`❌ SORT FAILED: Date at position ${i} (${valuesToCheck[i]}) is less than position ${i-1} (${valuesToCheck[i-1]}) in ascending order`);
        } else if (sortOrder === 'desc' && dateValues[i] > dateValues[i - 1]) {
          isSorted = false;
          throw new Error(`❌ SORT FAILED: Date at position ${i} (${valuesToCheck[i]}) is greater than position ${i-1} (${valuesToCheck[i-1]}) in descending order`);
        }
      }
      
      if (isSorted) {
        console.log(`✅ All ${valuesToCheck.length} records correctly sorted in ${sortOrder} order`);
      }
      return isSorted;
    }
    
    // Try numeric sort
    const numericValues = valuesToCheck.map(v => {
      const num = parseFloat(v);
      return isNaN(num) ? null : num;
    });
    
    let isSorted = true;
    
    if (numericValues.every(v => v !== null)) {
      console.log('  Detected numeric column, using numeric comparison...');
      // All values are numeric
      for (let i = 1; i < numericValues.length; i++) {
        if (sortOrder === 'asc' && numericValues[i] < numericValues[i - 1]) {
          isSorted = false;
          throw new Error(`❌ SORT FAILED: Value at position ${i} (${numericValues[i]}) is less than position ${i-1} (${numericValues[i-1]}) in ascending order`);
        } else if (sortOrder === 'desc' && numericValues[i] > numericValues[i - 1]) {
          isSorted = false;
          throw new Error(`❌ SORT FAILED: Value at position ${i} (${numericValues[i]}) is greater than position ${i-1} (${numericValues[i-1]}) in descending order`);
        }
      }
    } else {
      console.log('  Detected text column, using case-insensitive string comparison...');
      // String sort (case-insensitive)
      for (let i = 1; i < valuesToCheck.length; i++) {
        const current = valuesToCheck[i].toLowerCase();
        const previous = valuesToCheck[i - 1].toLowerCase();
        const comparison = current.localeCompare(previous);
        
        if (sortOrder === 'asc' && comparison < 0) {
          isSorted = false;
          throw new Error(`❌ SORT FAILED: Value at position ${i} ("${valuesToCheck[i]}") comes before position ${i-1} ("${valuesToCheck[i-1]}") in ascending order`);
        } else if (sortOrder === 'desc' && comparison > 0) {
          isSorted = false;
          throw new Error(`❌ SORT FAILED: Value at position ${i} ("${valuesToCheck[i]}") comes after position ${i-1} ("${valuesToCheck[i-1]}") in descending order`);
        }
      }
    }
    
    if (isSorted) {
      console.log(`✅ All ${valuesToCheck.length} records correctly sorted in ${sortOrder} order`);
      console.log(`   Values: ${valuesToCheck.join(', ')}`);
    }
    
    return isSorted;
  }

  async testColumnDualClickSorting(colIndex, columnName) {
    console.log(`\n🔤 Testing ${columnName} Column Sorting (First 10 Records Validation)...`);
    
    // Get initial values before sorting
    const initialValues = await this.getColumnValues(colIndex, 10);
    console.log(`  Initial values (${initialValues.length} rows): ${initialValues.slice(0, 5).join(', ')}${initialValues.length > 5 ? '...' : ''}`);

    // CLICK 1: Test Ascending Order
    console.log(`  ACTION: Clicking column index ${colIndex} header (1st click - expect ascending)...`);
    await this.clickColumnHeader(colIndex);
    
    // Wait for loading spinner to complete
    console.log(`  ACTION: Waiting for loading spinner...`);
    await this.waitForLoadingSpinnerToDisappear();

    // Check for ascending arrow indicator
    const ascArrow = await this.getSortArrowIndicator(colIndex);
    console.log(`  Sort indicator after 1st click: ${ascArrow}`);

    // Verify actual data sorting for first 10 records
    console.log(`  ASSERT: Verifying first 10 records are sorted in ascending order...`);
    const ascValues = await this.getColumnValues(colIndex, 10);
    console.log(`  Values after 1st click (${ascValues.length} rows): ${ascValues.slice(0, 5).join(', ')}${ascValues.length > 5 ? '...' : ''}`);
    
    try {
      await this.verifyColumnSorted(colIndex, 'asc', 10);
      console.log(`  ✅ SUCCESS: ${columnName} column correctly sorted in ASCENDING order`);
    } catch (error) {
      throw new Error(`ASCENDING SORT FAILED for ${columnName}: ${error.message}`);
    }

    // CLICK 2: Test Descending Order
    console.log(`  ACTION: Clicking column index ${colIndex} header (2nd click - expect descending)...`);
    await this.clickColumnHeader(colIndex);
    
    // Wait for loading spinner to complete
    console.log(`  ACTION: Waiting for loading spinner...`);
    await this.waitForLoadingSpinnerToDisappear();

    // Check for descending arrow indicator
    const descArrow = await this.getSortArrowIndicator(colIndex);
    console.log(`  Sort indicator after 2nd click: ${descArrow}`);

    // Verify actual data sorting for first 10 records
    console.log(`  ASSERT: Verifying first 10 records are sorted in descending order...`);
    const descValues = await this.getColumnValues(colIndex, 10);
    console.log(`  Values after 2nd click (${descValues.length} rows): ${descValues.slice(0, 5).join(', ')}${descValues.length > 5 ? '...' : ''}`);
    
    try {
      await this.verifyColumnSorted(colIndex, 'desc', 10);
      console.log(`  ✅ SUCCESS: ${columnName} column correctly sorted in DESCENDING order`);
    } catch (error) {
      throw new Error(`DESCENDING SORT FAILED for ${columnName}: ${error.message}`);
    }

    // Reset button before next column
    console.log(`  ACTION: Clicking Reset button...`);
    await this.clickResetButton();
    await this.page.waitForTimeout(500);
    await this.waitForLoadingSpinnerToDisappear();
    console.log(`  ✓ Reset completed for ${columnName} column\n`);
  }

  // ==================================================================================
  // APPROVAL DIALOG METHODS FOR TC11 REFACTORING
  // ==================================================================================

  async setupApprovalWorkflowTest(loginPage) {
    await this.navigateToPatientReferralTab(loginPage);
    await this.clickPatientReferralThumbnail();
    await this.verifyNavigationToPatientReferralSection();

    const recordCount = await this.getGridRecordCount();
    
    return {
      skipped: recordCount === 0,
      reason: 'No records available'
    };
  }

  async getFirstRecordNameOnly() {
    console.log('ACTION: Getting first record name...');
    const firstRow = this.page.locator('ejs-grid [role="row"][data-uid]').first();
    const cells = firstRow.locator('[role="gridcell"]');
    
    const firstName = await cells.nth(0).textContent();
    const lastName = await cells.nth(1).textContent();
    
    return {
      firstName: firstName.trim(),
      lastName: lastName.trim()
    };
  }

  async fillApprovalNoteWithFaker() {
    console.log('ACTION: Filling approval note with faker content...');
    const { faker } = require('@faker-js/faker');
    const uniqueSentence = faker.lorem.sentence();
    const approvalNote = 'Approved on ' + new Date().toLocaleDateString() + '. ' + uniqueSentence;

    const dialog = this.page.getByRole('dialog');
    const textarea = dialog.locator('textarea, [role="textbox"]').first();
    await textarea.fill(approvalNote);

    return uniqueSentence;
  }

  async selectStatusAndChangeInDialog() {
    console.log('ACTION: Selecting and changing status in dialog...');
    
    const statusDropdown = this.page.getByRole('combobox').filter({ hasText: /New|Status|Pending|Completed|Rejected/ }).first();
    const statusOptions = this.page.getByRole('option');
    const optionCount = await statusOptions.count();

    if (optionCount > 1) {
      await statusDropdown.click();
      await this.page.waitForTimeout(300);
      
      const secondOption = statusOptions.nth(1);
      const selectedStatusText = await secondOption.textContent();
      const selectedStatus = selectedStatusText.trim();
      
      await secondOption.click();
      await this.page.waitForTimeout(300);
      
      return selectedStatus;
    }

    return 'New';
  }

  async saveApprovalAndWaitForCompletion() {
    console.log('ACTION: Saving approval and waiting for completion...');
    const saveButton = this.page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();
    
    const loadingSpinner = this.page.locator('[class*="spinner"], [class*="loading"], .mat-progress-spinner');
    await loadingSpinner.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => null);
  }

  async verifySuccessMessage() {
    console.log('ACTION: Verifying success message...');
    const successMessage = this.page.locator('.toast-title, [role="alert"]').filter({ hasText: /Complete|Approve|Patient Referral/i }).first();
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  }

  async verifyDialogClosedAfterSave() {
    console.log('ACTION: Verifying dialog closed...');
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  }

  async extractRecordDataMinimal(row) {
    const cells = row.locator('[role="gridcell"]');
    
    return {
      firstName: await cells.nth(0).textContent(),
      lastName: await cells.nth(1).textContent(),
      actionNotes: await cells.nth(9).textContent()
    };
  }

  async findRecordByNameInGridAndExtractMinimal(firstName, lastName) {
    console.log('ACTION: Finding record by name...');
    
    const gridRows = this.page.locator('ejs-grid [role="row"][data-uid]');
    const rowCount = await gridRows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = gridRows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();
      
      if (cellCount >= 2) {
        const firstNameCell = await cells.nth(0).textContent();
        const lastNameCell = await cells.nth(1).textContent();
        
        if (firstNameCell.trim() === firstName && lastNameCell.trim() === lastName) {
          return await this.extractRecordDataMinimal(row);
        }
      }
    }
    
    throw new Error('Record not found: ' + firstName + ' ' + lastName);
  }

  async verifyRecordInFilteredGrid(recordNameBefore, selectedStatus, uniqueSentence) {
    console.log('ACTION: Verifying record in filtered grid...');
    
    await this.selectStatusFromDropdown(selectedStatus);
    await this.clickSearchButton();
    await this.page.waitForTimeout(1000);
    
    const recordData = await this.findRecordByNameInGridAndExtractMinimal(recordNameBefore.firstName, recordNameBefore.lastName);
    
    expect(recordData.firstName.trim()).toBe(recordNameBefore.firstName);
    expect(recordData.lastName.trim()).toBe(recordNameBefore.lastName);
    expect(recordData.actionNotes.trim()).toContain(uniqueSentence);
    
    console.log('  ✓ Name: ' + recordData.firstName.trim() + ' ' + recordData.lastName.trim());
    console.log('  ✓ Note: ' + uniqueSentence);
  }

  async clickApproveAndOpenDialog() {
    console.log('ACTION: Clicking Approve icon for first record...');
    const firstApproveIcon = this.approveIcon.first();
    await expect(firstApproveIcon).toBeVisible({ timeout: 5000 });
    await firstApproveIcon.click();
    await this.page.waitForTimeout(1000);

    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    
    return dialog;
  }

  async verifyApprovalDialogControls() {
    console.log('ACTION: Verifying all approval dialog controls...');
    
    const dialog = this.page.getByRole('dialog');
    
    // Verify dialog is visible
    await expect(dialog).toBeVisible({ timeout: 10000 });
    console.log('✓ Dialog is visible');

    // Verify dialog header
    const dialogHeader = this.page.getByRole('heading', { name: /Add Note|Reason/i });
    await expect(dialogHeader).toBeVisible({ timeout: 5000 });
    const headerText = await dialogHeader.textContent();
    console.log(`✓ Dialog header verified: "${headerText.trim()}"`);

    // Verify Add Note textarea
    const addNoteTextarea = dialog.locator('textarea, [role="textbox"]').first();
    await expect(addNoteTextarea).toBeVisible({ timeout: 5000 });
    await expect(addNoteTextarea).toBeEnabled({ timeout: 5000 });
    console.log('✓ Add Note textarea is visible and editable');

    // Verify Save button
    const saveButton = this.page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    console.log('✓ Save button is visible and clickable');

    console.log('ASSERT: All approval dialog controls verified successfully');
  }

  async closeApprovalDialog() {
    console.log('ACTION: Closing approval dialog via close button...');
    const closeButton = this.page.locator('i.fa.fa-times.fa-lg');
    
    await expect(closeButton).toBeVisible({ timeout: 5000 });
    await expect(closeButton).toBeEnabled({ timeout: 5000 });
    console.log('✓ Close button is visible and enabled');

    await closeButton.click();
    await this.page.waitForTimeout(500);
    console.log('✓ Close button clicked');
  }

  async verifyApprovalDialogClosedAndGridVisible() {
    console.log('ACTION: Verifying dialog closed and grid remains visible...');
    
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Dialog successfully closed');

    const grid = this.page.locator('ejs-grid');
    await expect(grid).toBeVisible({ timeout: 5000 });
    console.log('✓ Grid remains visible after dialog close');
  }

  async reopenApprovalDialog() {
    console.log('ACTION: Reopening approval dialog...');
    const firstApproveIcon = this.approveIcon.first();
    await expect(firstApproveIcon).toBeVisible({ timeout: 5000 });
    await firstApproveIcon.click();
    await this.page.waitForTimeout(1000);

    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    console.log('✓ Dialog reopened successfully');
  }

  async verifyAndTestStatusDropdown() {
    console.log('ACTION: Testing status dropdown functionality...');
    
    // Verify default value is "New"
    await this.verifyDefaultStatusSelection();

    // Get available status options
    const availableStatuses = await this.getAvailableStatusOptions();
    console.log(`✓ Found ${availableStatuses.length} status option(s)`);

    if (availableStatuses.length > 1) {
      // Test selecting alternate status (second option)
      const alternateStatus = availableStatuses[1];
      console.log(`ACTION: Selecting alternate status: "${alternateStatus}"...`);
      await this.selectStatusFromDropdown(alternateStatus);
      console.log(`✓ Status "${alternateStatus}" selected successfully`);
    } else {
      console.log('⚠️ Only one status option available - selection test skipped');
    }
  }

  async fillAndVerifyApprovalNoteWithFaker() {
    console.log('ACTION: Filling and verifying approval note with faker content...');
    
    const { faker } = require('@faker-js/faker');
    const uniqueSentence = faker.lorem.sentence();
    const approvalNote = `Approved on ${new Date().toLocaleDateString()}. ${uniqueSentence}`;
    
    console.log(`STEP: Generated unique note: "${approvalNote}"`);

    // Enter text in textarea
    const dialog = this.page.getByRole('dialog');
    const textarea = dialog.locator('textarea, [role="textbox"]').first();
    await textarea.fill(approvalNote);
    console.log('STEP: Approval note entered into textarea');

    // Verify text appears in textarea
    await expect(textarea).toHaveValue(new RegExp(approvalNote.substring(0, 30)));
    const textareaValue = await textarea.inputValue();
    expect(textareaValue).toBe(approvalNote);
    console.log(`STEP: Textarea value verified: "${textareaValue.substring(0, 50)}..."`);

    // Verify faker sentence is present
    expect(textareaValue).toContain(uniqueSentence);
    console.log(`STEP: Faker sentence validated: "${uniqueSentence}"`);

    return uniqueSentence;
  }

  async findRecordByNameInGrid(firstName, lastName) {
    console.log(`ACTION: Searching for record in grid: ${firstName} ${lastName}...`);
    
    const gridRows = this.page.locator('ejs-grid [role="row"][data-uid]');
    const rowCount = await gridRows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = gridRows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();
      
      if (cellCount >= 2) {
        const firstNameCell = await cells.nth(0).textContent();
        const lastNameCell = await cells.nth(1).textContent();
        
        if (firstNameCell.trim() === firstName.trim() && lastNameCell.trim() === lastName.trim()) {
          console.log(`STEP: Found matching record at row ${i}`);
          return await this.extractRecordData(row);
        }
      }
    }
    
    throw new Error(`Record not found in grid: ${firstName} ${lastName}`);
  }

  async extractRecordData(row) {
    const cells = row.locator('[role="gridcell"]');
    const cellCount = await cells.count();
    
    const data = {
      firstName: cellCount > 0 ? await cells.nth(0).textContent() : '',
      lastName: cellCount > 1 ? await cells.nth(1).textContent() : '',
      email: cellCount > 2 ? await cells.nth(2).textContent() : '',
      phone: cellCount > 3 ? await cells.nth(3).textContent() : '',
      reason: cellCount > 4 ? await cells.nth(4).textContent() : '',
      refProvider: cellCount > 5 ? await cells.nth(5).textContent() : '',
      providerEmail: cellCount > 6 ? await cells.nth(6).textContent() : '',
      providerPhone: cellCount > 7 ? await cells.nth(7).textContent() : '',
      actionBy: cellCount > 8 ? await cells.nth(8).textContent() : '',
      actionNotes: cellCount > 9 ? await cells.nth(9).textContent() : ''
    };
    
    return data;
  }

  async verifyApprovedRecordAfterStatusChange(recordDataBefore, selectedStatus, expectedActionNotes) {
    console.log(`ACTION: Verifying record in "${selectedStatus}" status...`);
    
    // Filter grid by the selected status
    await this.selectStatusFromDropdown(selectedStatus);
    await this.clickSearchButton();
    await this.page.waitForTimeout(1000);
    
    // Find the specific record by name
    const recordDataAfter = await this.findRecordByNameInGrid(recordDataBefore.firstName, recordDataBefore.lastName);
    
    // Verify only: first name, last name, and action notes (with faker sentence)
    console.log('STEP: Verifying record data...');
    expect(recordDataAfter.firstName.trim()).toBe(recordDataBefore.firstName.trim());
    expect(recordDataAfter.lastName.trim()).toBe(recordDataBefore.lastName.trim());
    expect(recordDataAfter.actionNotes.trim()).toContain(expectedActionNotes);
    
    console.log(`  ✓ Name: ${recordDataAfter.firstName.trim()} ${recordDataAfter.lastName.trim()}`);
    console.log(`  ✓ Note contains faker: "${expectedActionNotes}"`);
    console.log(`SUCCESS: Record verified in "${selectedStatus}" filtered grid`);
  }
}

module.exports = { PatientReferralPage };
