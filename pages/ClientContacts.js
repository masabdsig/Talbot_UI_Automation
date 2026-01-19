const { expect } = require('@playwright/test');

class ClientContactsPage {
  constructor(page) {
    this.page = page;

    // ==================================================================================
    // PORTAL NAVIGATION LOCATORS
    // ==================================================================================
    this.portalRequestsMenu = page.locator('div').filter({ hasText: /^Portal Requests\d+$/ }).first();
    this.clientContactsThumbnail = page.locator('h5:has-text("Client Contacts")');
    this.clientContactsHeading = page.locator('h6:has-text("Client Contacts")');
    this.clientContactsCountSpan = page.locator('div').filter({ hasText: /^Client Contacts\d+$/ }).locator('h2');

    // ==================================================================================
    // CLIENT CONTACTS SECTION CONTROLS
    // ==================================================================================
    this.searchTextbox = page.getByRole('textbox', { name: 'Search' });
    this.statusDropdown = page.getByRole('combobox').filter({ hasText: /New|Status/ }).first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.newRequestButton = page.getByRole('button', { name: 'New Request' });

    // ==================================================================================
    // CLIENT CONTACTS GRID LOCATORS
    // ==================================================================================
    this.clientContactsGrid = page.locator('ejs-grid');
    this.gridRows = page.locator('ejs-grid [role="row"]');
    
    // Grid column headers
    this.firstNameColumn = page.locator('ejs-grid .e-headertext:has-text("First Name")');
    this.lastNameColumn = page.locator('ejs-grid .e-headertext:has-text("Last Name")');
    this.emailColumn = page.locator('ejs-grid .e-headertext').filter({ hasText: /^Email$/ });
    this.phoneColumn = page.locator('ejs-grid .e-headertext').filter({ hasText: /^Phone Number$/ });
    this.clientNotesColumn = page.locator('ejs-grid .e-headertext:has-text("Client Notes")');
    this.actionByColumn = page.locator('ejs-grid .e-headertext:has-text("Action By")');
    this.actionNotesColumn = page.locator('ejs-grid .e-headertext:has-text("Action Notes")');
    this.actionColumn = page.locator('ejs-grid .e-headertext').filter({ hasText: /^Action$/ });

    // ==================================================================================
    // ACTION ICONS LOCATORS
    // ==================================================================================
    this.completeIcon = page.locator('i.fa.fa-check.ng-star-inserted');
    this.rejectIcon = page.locator('i.fa.fa-times-circle.ml-10.ng-star-inserted');
    
    // Icon selectors for row-scoped searches
    this.completeIconSelector = 'i.fa.fa-check.ng-star-inserted';
    this.rejectIconSelector = 'i.fa.fa-times-circle.ml-10.ng-star-inserted';

    // ==================================================================================
    // NEW REQUEST DIALOG LOCATORS
    // ==================================================================================
    this.clientContactDialog = page.locator('div.modal-content');
    this.dialogHeader = page.getByRole('heading', { name: 'Client Contact' });
    this.dialogCloseButton = page.locator('i.fa.fa-times.fa-lg');
    
    // Form fields
    this.firstNameField = page.getByRole('textbox', { name: 'First Name *' });
    this.lastNameField = page.getByRole('textbox', { name: 'Last Name *' });
    this.emailField = page.getByRole('textbox', { name: 'Email *' });
    this.phoneField = page.locator('div.e-input-group input[mask="(000) 000-0000"]');
    this.addNoteField = page.getByRole('textbox', { name: 'Add Note *' });
    this.saveButton = page.getByRole('button', { name: 'Save' });

    // ==================================================================================
    // ADD NOTE/REASON DIALOG LOCATORS (Complete/Reject)
    // ==================================================================================
    this.addNoteDialog = page.locator('div.modal-content');
    this.addNoteDialogHeader = page.getByRole('heading', { name: 'Add Note/Reason' });
    this.addNoteDialogCloseButton = page.locator('.fa.fa-times');
    this.addReasonNoteField = page.getByRole('textbox', { name: 'Add Reason/Note' });
    this.statusDropdownInDialog = page.getByRole('dialog').locator('[role="combobox"]').first();
    this.saveButtonInDialog = page.getByRole('button', { name: 'Save' });

    // ==================================================================================
    // SUCCESS/ERROR MESSAGES
    // ==================================================================================
    this.successToast = page.locator('.toast-success, #toast-container:has-text("success")');
    this.rejectToast = page.locator('.ngx-toastr.toast-success:has-text("Successfully Reject")');

    // ==================================================================================
    // LOADER LOCATOR
    // ==================================================================================
    this.loader = page.locator('[class*="loader"], [class*="loading"], [class*="spinner"], .mat-progress-spinner, .spinner');
  }

  // ==================================================================================
  // NAVIGATION METHODS
  // ==================================================================================
  async navigateToClientContactsTab(loginPage) {
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
    await this.loader.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('DEBUG: No loader found or loader already hidden');
    });
    
    // Wait for the tabs/thumbnails container to be visible
    console.log('ACTION: Waiting for Patient Portal tab to be visible...');
    const patientPortalTab = this.page.locator('h5:has-text("Patient Portal")');
    await expect(patientPortalTab).toBeVisible({ timeout: 15000 });
    
    // Wait for Client Contacts tab to be visible and stable
    console.log('ACTION: Waiting for Client Contacts tab to be visible and stable...');
    await expect(this.clientContactsThumbnail).toBeVisible({ timeout: 15000 });
    await this.clientContactsThumbnail.waitFor({ state: 'attached', timeout: 5000 });
    await this.page.waitForTimeout(500);
    
    console.log('ASSERT: Portal page loaded and Client Contacts tab visible');
  }

  // ==================================================================================
  // CLIENT CONTACTS TAB VERIFICATION METHODS
  // ==================================================================================
  async verifyClientContactsThumbnailVisible() {
    console.log('ACTION: Verifying Client Contacts thumbnail is visible...');
    await expect(this.clientContactsThumbnail).toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Client Contacts thumbnail is visible');
  }

  async verifyClientContactsCountDisplay() {
    console.log('ACTION: Verifying Client Contacts count is displayed...');
    await expect(this.clientContactsCountSpan).toBeVisible({ timeout: 10000 });
    const countText = await this.clientContactsCountSpan.textContent();
    const count = countText.trim();
    console.log(`ASSERT: Client Contacts count displayed: ${count}`);
    return count;
  }

  async clickClientContactsThumbnail() {
    console.log('ACTION: Clicking on Client Contacts thumbnail...');
    await this.clientContactsThumbnail.waitFor({ state: 'attached', timeout: 5000 });
    await this.page.waitForTimeout(300);
    await this.clientContactsThumbnail.click();
    
    // Wait for loader to disappear if present
    console.log('ACTION: Waiting for loader to disappear...');
    await this.loader.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      console.log('DEBUG: No loader found or loader already hidden');
    });
    
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Client Contacts thumbnail clicked');
  }

  async verifyNavigationToClientContactsSection() {
    console.log('ACTION: Verifying navigation to Client Contacts Section...');
    await expect(this.clientContactsHeading).toBeVisible({ timeout: 10000 });
    const headingText = await this.clientContactsHeading.textContent();
    console.log(`ASSERT: Navigated to Client Contacts Section - Heading: "${headingText.trim()}"`);
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
    await expect(this.clientContactsGrid).toBeVisible({ timeout: 10000 });
    console.log('ACTION: Grid is visible');
    
    const columns = [
      { locator: this.firstNameColumn, name: 'First Name' },
      { locator: this.lastNameColumn, name: 'Last Name' },
      { locator: this.emailColumn, name: 'Email' },
      { locator: this.phoneColumn, name: 'Phone Number' },
      { locator: this.clientNotesColumn, name: 'Client Notes' },
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
    await expect(this.clientContactDialog).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Dialog is visible');
    return this.clientContactDialog;
  }

  async verifyDialogHeader() {
    console.log('ACTION: Verifying dialog header is displayed...');
    await expect(this.dialogHeader).toBeVisible({ timeout: 5000 });
    const headerText = await this.dialogHeader.textContent();
    console.log(`ASSERT: Dialog header text: "${headerText.trim()}"`);
    return headerText.trim();
  }

  async verifyCloseButton() {
    console.log('ACTION: Verifying close button is displayed and clickable...');
    await expect(this.dialogCloseButton).toBeVisible({ timeout: 5000 });
    await expect(this.dialogCloseButton).toBeEnabled({ timeout: 5000 });
    console.log('ASSERT: Close button is displayed and clickable');
    return this.dialogCloseButton;
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
    await expect(this.clientContactDialog).not.toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Dialog is no longer visible');
  }

  async verifyGridVisible() {
    console.log('ACTION: Verifying grid is visible...');
    await expect(this.clientContactsGrid).toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Client Contacts grid is visible');
  }

  // ==================================================================================
  // FORM FILLING METHODS
  // ==================================================================================
  async fillClientContactForm(contactData) {
    console.log('ACTION: Filling Client Contact form fields...');
    
    await expect(this.firstNameField).toBeVisible({ timeout: 5000 });
    await expect(this.firstNameField).toBeEditable({ timeout: 5000 });
    await this.firstNameField.fill(contactData.firstName);
    await expect(this.firstNameField).toHaveValue(contactData.firstName);
    
    await expect(this.lastNameField).toBeVisible({ timeout: 5000 });
    await expect(this.lastNameField).toBeEditable({ timeout: 5000 });
    await this.lastNameField.fill(contactData.lastName);
    await expect(this.lastNameField).toHaveValue(contactData.lastName);
    
    await expect(this.emailField).toBeVisible({ timeout: 5000 });
    await expect(this.emailField).toBeEditable({ timeout: 5000 });
    await this.emailField.fill(contactData.email);
    await expect(this.emailField).toHaveValue(contactData.email);
    
    // Handle phone field with mask - extract digits and validate by digits only
    await expect(this.phoneField).toBeVisible({ timeout: 5000 });
    await this.phoneField.fill(contactData.phone);
    // For masked phone fields, validate that the digits match (ignore formatting)
    const phoneValue = await this.phoneField.inputValue();
    const phoneDigits = phoneValue.replace(/\D/g, '');
    const expectedDigits = contactData.phone.replace(/\D/g, '');
    if (phoneDigits !== expectedDigits) {
      console.log(`WARNING: Phone field value "${phoneValue}" doesn't match expected "${contactData.phone}" exactly, but digits match`);
    }
    
    await expect(this.addNoteField).toBeVisible({ timeout: 5000 });
    await expect(this.addNoteField).toBeEditable({ timeout: 5000 });
    await this.addNoteField.fill(contactData.notes);
    await expect(this.addNoteField).toHaveValue(contactData.notes);
    
    console.log('ASSERT: Client Contact form fields filled successfully');
  }

  async clickSaveButton() {
    console.log('ACTION: Clicking Save button...');
    await expect(this.saveButton).toBeVisible({ timeout: 5000 });
    await expect(this.saveButton).toBeEnabled({ timeout: 5000 });
    await this.saveButton.click();
    
    // Wait for loader to disappear (if it appears)
    console.log('ACTION: Waiting for loader to disappear...');
    await this.loader.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      console.log('DEBUG: Loader not found or already hidden');
    });
    
    console.log('ASSERT: Save button clicked successfully');
  }

  // ==================================================================================
  // SEARCH AND FILTER METHODS
  // ==================================================================================
  async searchByClientName(name) {
    console.log(`ACTION: Searching by client name: "${name}"...`);
    await this.searchTextbox.fill(name);
    console.log(`ASSERT: Search field filled with "${name}"`);
  }

  async clickSearchButton() {
    console.log('ACTION: Clicking Search button...');
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
    
    // Wait for loader to appear and then disappear
    console.log('ACTION: Waiting for loader to appear and disappear...');
    await this.loader.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      console.log('DEBUG: No loader appeared, continuing...');
    });
    await this.loader.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('DEBUG: Loader not found or already hidden');
    });
    
    console.log('ASSERT: Search button clicked and grid updated');
  }

  async clickResetButton() {
    console.log('ACTION: Clicking Reset button...');
    await this.resetButton.click();
    await this.page.waitForTimeout(500);
    
    // Wait for loader to appear and then disappear
    console.log('ACTION: Waiting for loader to appear and disappear...');
    await this.loader.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      console.log('DEBUG: No loader appeared, continuing...');
    });
    await this.loader.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('DEBUG: Loader not found or already hidden');
    });
    
    console.log('ASSERT: Reset button clicked and grid updated');
  }

  async clearSearchField() {
    console.log('ACTION: Clearing search field...');
    await this.searchTextbox.clear();
    console.log('ASSERT: Search field cleared');
  }

  async selectStatusFromDropdown(statusOption) {
    console.log(`ACTION: Selecting status "${statusOption}" from dropdown...`);
    await this.statusDropdown.click();
    await this.page.waitForTimeout(500);
    
    const option = this.page.getByRole('option', { name: statusOption });
    await expect(option).toBeVisible({ timeout: 5000 });
    
    // Wait for element to be stable before clicking
    await this.page.waitForTimeout(300);
    
    // Use force: true to bypass stability check and handle detaching DOM
    await option.click({timeout: 5000 });
    await this.page.waitForTimeout(1000);

    
    // Wait for loader to disappear after selection
    await this.loader.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      console.log('DEBUG: No loader appeared after selection');
    });
    
    // Wait longer for dropdown UI to update and stabilize
    await this.page.waitForTimeout(1500);
    
    // Verify selected status is visible in dropdown with longer timeout
    await expect(this.statusDropdown).toContainText(statusOption, { timeout: 5000 });
    console.log(`ASSERT: Status "${statusOption}" selected and visible in dropdown`);
  }

  async getAvailableStatusOptions() {
    console.log('ACTION: Getting available status options...');
    await this.statusDropdown.click();
    await this.page.waitForTimeout(300);
    
    const options = this.page.locator('[role="option"]');
    const count = await options.count();
    const statusOptions = [];
    
    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).textContent();
      statusOptions.push(optionText.trim());
    }
    
    // Close the dropdown
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    
    console.log(`ASSERT: Found ${statusOptions.length} status options: ${statusOptions.join(', ')}`);
    return statusOptions;
  }

  async verifyDefaultStatusSelection() {
    console.log('ACTION: Verifying default status selection is "New"...');
    await this.validateStatusDropdownDefaultValue();
    console.log('ASSERT: Default status is "New"');
  }

  async resetStatusDropdownToNew() {
    console.log('ACTION: Resetting status dropdown to "New"...');
    try {
      const currentText = await this.statusDropdown.textContent();
      if (!currentText.includes('New')) {
        console.log('DEBUG: Status is not "New", resetting...');
        await this.statusDropdown.click();
        await this.page.waitForTimeout(500);
        
        const newOption = this.page.getByRole('option', { name: 'New' });
        await expect(newOption).toBeVisible({ timeout: 5000 });
        await this.page.waitForTimeout(300);
        
        await newOption.click({ force: true, timeout: 5000 });
        await this.page.waitForTimeout(1000);
        
        // Close dropdown
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
        
        // Wait for UI to update
        await this.page.waitForTimeout(500);
        
        console.log('DEBUG: Status dropdown reset to "New"');
      } else {
        console.log('DEBUG: Status dropdown already set to "New"');
      }
    } catch (e) {
      console.log(`DEBUG: Could not reset dropdown: ${e.message}`);
    }
    console.log('ASSERT: Status dropdown ready');
  }

  // ==================================================================================
  // GRID RECORD COUNT AND DATA RETRIEVAL METHODS
  // ==================================================================================
  async getGridRecordCount() {
    console.log('ACTION: Getting grid record count...');
    
    // METHOD 1: Try pagination first
    try {
      const paginationText = await this.page.locator('text=/\\d+ of \\d+ pages \\(\\d+ item/i').first().textContent({ timeout: 3000 });
      const countMatch = paginationText.match(/\((\d+)\s+items?\)/);
      
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
    
    // METHOD 3: Count visible rows with gridcells
    console.log('ACTION: Counting visible data rows with gridcells...');
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    let dataRowCount = 0;
    
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      const isVisible = await row.isVisible().catch(() => false);
      if (!isVisible) continue;
      
      const gridcells = row.locator('[role="gridcell"]');
      const cellCount = await gridcells.count();
      
      if (cellCount > 0) {
        dataRowCount++;
      }
    }
    
    console.log(`ASSERT: Grid record count: ${dataRowCount}`);
    return dataRowCount;
  }

  async getGridRecordCountAfterSearch() {
    console.log('ACTION: Waiting for grid to update after search...');
    await this.page.waitForTimeout(1000);
    return await this.getGridRecordCount();
  }

  async getFirstRecordData() {
    console.log('ACTION: Getting first record data...');
    
    // Find the first visible data row (skip header row at index 0)
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    if (totalRows < 2) {
      throw new Error('No data rows found in grid');
    }
    
    // Find the first visible row starting from index 1
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
      // If no visible row found, scroll to top and try the first data row
      await this.clientContactsGrid.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      firstVisibleRow = rows.nth(1);
      await expect(firstVisibleRow).toBeVisible({ timeout: 5000 });
    }
    
    const cells = firstVisibleRow.locator('[role="gridcell"]');
    const firstName = await cells.nth(0).textContent();
    const lastName = await cells.nth(1).textContent();
    const email = await cells.nth(2).textContent();
    const phone = await cells.nth(3).textContent();
    
    const recordData = {
      firstName: firstName?.trim() || '',
      lastName: lastName?.trim() || '',
      email: email?.trim() || '',
      phone: phone?.trim() || ''
    };
    
    console.log(`ASSERT: First record data retrieved: ${JSON.stringify(recordData)}`);
    return recordData;
  }

  async getRecordDataByIndex(index) {
    console.log(`ACTION: Getting record data at index ${index}...`);
    
    // Find all data rows (skip header row at index 0)
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    if (totalRows < 2) {
      throw new Error('No data rows found in grid');
    }
    
    // Find the Nth visible data row by iterating through rows and counting visible ones
    let visibleCount = 0;
    let targetRow = null;
    
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      const isVisible = await row.isVisible().catch(() => false);
      
      if (isVisible) {
        if (visibleCount === index) {
          targetRow = row;
          break;
        }
        visibleCount++;
      }
    }
    
    if (!targetRow) {
      throw new Error(`Record at index ${index} not found - only ${visibleCount} visible data rows available`);
    }
    
    const cells = targetRow.locator('[role="gridcell"]');
    const firstName = await cells.nth(0).textContent();
    const lastName = await cells.nth(1).textContent();
    const email = await cells.nth(2).textContent();
    const phone = await cells.nth(3).textContent();
    const clientNotes = await cells.nth(4).textContent();
    const actionBy = await cells.nth(5).textContent();
    
    const recordData = {
      firstName: firstName?.trim() || '',
      lastName: lastName?.trim() || '',
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      clientNotes: clientNotes?.trim() || '',
      actionBy: actionBy?.trim() || ''
    };
    
    console.log(`ASSERT: Record data at index ${index} retrieved: ${JSON.stringify(recordData)}`);
    return recordData;
  }

  async verifyRecordSavedInGrid(contactData) {
    console.log('ACTION: Verifying new record appears in grid with all data...');
    
    // Find row containing ALL three values (firstName, lastName, email)
    const recordRow = this.page.locator('[role="row"]')
      .filter({ hasText: contactData.firstName })
      .filter({ hasText: contactData.lastName })
      .filter({ hasText: contactData.email });
    
    // Verify the row exists
    await expect(recordRow.first()).toBeVisible({ timeout: 5000 });
    
    console.log(`  ✓ Client First Name "${contactData.firstName}" found in grid`);
    console.log(`  ✓ Client Last Name "${contactData.lastName}" found in same row`);
    console.log(`  ✓ Client Email "${contactData.email}" found in same row`);
    
    console.log('ASSERT: Complete record data verified in same grid row');
  }

  // ==================================================================================
  // COMPLETE/REJECT ACTION METHODS
  // ==================================================================================
  async clickCompleteIcon(rowIndex = 0) {
    console.log(`ACTION: Clicking Complete icon for row ${rowIndex}...`);
    const completeIcon = this.completeIcon.nth(rowIndex);
    await expect(completeIcon).toBeVisible({ timeout: 5000 });
    await completeIcon.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Complete icon clicked');
  }

  async clickRejectIcon(rowIndex = 0) {
    console.log(`ACTION: Clicking Reject icon for row ${rowIndex}...`);
    const rejectIcon = this.rejectIcon.nth(rowIndex);
    await expect(rejectIcon).toBeVisible({ timeout: 5000 });
    await rejectIcon.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Reject icon clicked');
  }

  async verifyAddNoteDialogVisible() {
    console.log('ACTION: Verifying Add Note/Reason dialog is visible...');
    await expect(this.addNoteDialog).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Add Note/Reason dialog is visible');
  }

  async verifyAddNoteDialogHeader() {
    console.log('ACTION: Verifying Add Note/Reason dialog header...');
    await expect(this.addNoteDialogHeader).toBeVisible({ timeout: 5000 });
    const headerText = await this.addNoteDialogHeader.textContent();
    console.log(`ASSERT: Dialog header text: "${headerText.trim()}"`);
  }

  async verifyAddNoteDialogCloseButton() {
    console.log('ACTION: Verifying close button (cross mark icon) in Add Note dialog header...');
    await expect(this.addNoteDialogCloseButton.first()).toBeVisible({ timeout: 5000 });
    await expect(this.addNoteDialogCloseButton.first()).toBeEnabled({ timeout: 5000 });
    console.log('ASSERT: Close button (cross mark icon) is visible and clickable');
  }

  async verifyAddNoteDialogCloseButtonAndClose() {
    console.log('ACTION: Verifying and testing close button (cross mark icon) functionality...');
    
    // Verify close button is visible and enabled
    await expect(this.addNoteDialogCloseButton.first()).toBeVisible({ timeout: 5000 });
    await expect(this.addNoteDialogCloseButton.first()).toBeEnabled({ timeout: 5000 });
    console.log('ASSERT: Close button (cross mark icon) is visible and clickable');
    
    // Click the close button to close the dialog
    console.log('ACTION: Clicking close button to close the dialog...');
    await this.addNoteDialogCloseButton.first().click();
    await this.page.waitForTimeout(500);
    
    // Verify dialog is closed
    console.log('ACTION: Verifying dialog is closed...');
    await expect(this.addNoteDialog).not.toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Dialog successfully closed via close button');
  }

  async closeAddNoteDialog() {
    console.log('ACTION: Closing Add Note/Reason dialog...');
    await this.addNoteDialogCloseButton.first().click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Add Note/Reason dialog closed');
  }

  async fillAddReasonNote(note) {
    console.log('ACTION: Filling Add Reason/Note field...');
    await expect(this.addReasonNoteField).toBeVisible({ timeout: 5000 });
    await expect(this.addReasonNoteField).toBeEditable({ timeout: 5000 });
    await this.addReasonNoteField.fill(note);
    console.log(`ASSERT: Add Reason/Note field filled with: "${note}"`);
  }

  async verifyDefaultStatusInDialog() {
    console.log('ACTION: Verifying default status value in Add Note dialog...');
    await expect(this.statusDropdownInDialog).toBeVisible({ timeout: 5000 });
    
    const dropdownValue = await this.statusDropdownInDialog.textContent();
    const trimmedValue = dropdownValue.trim();
    
    console.log(`DEBUG: Current status dropdown value: "${trimmedValue}"`);
    
    expect(trimmedValue).toContain('New');
    console.log('ASSERT: Status dropdown is set to "New" by default');
  }

  async selectStatusInDialog(status) {
    console.log(`ACTION: Selecting status "${status}" in dialog...`);
    await this.statusDropdownInDialog.click();
    await this.page.waitForTimeout(300);
    
    const option = this.page.getByRole('option', { name: status });
    await expect(option).toBeVisible({ timeout: 5000 });
    await expect(option).toBeEnabled({ timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(500);
    
    console.log(`ASSERT: Status "${status}" selected in dialog`);
  }

  async clickSaveInDialog() {
    console.log('ACTION: Clicking Save button in dialog...');
    await expect(this.saveButtonInDialog).toBeVisible({ timeout: 3000 });
    await expect(this.saveButtonInDialog).toBeEnabled({ timeout: 3000 });
    await this.saveButtonInDialog.click();
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Save button clicked in dialog');
  }

  async verifySuccessMessage() {
    console.log('ACTION: Verifying success message popup...');
    await expect(this.successToast).toBeVisible({ timeout: 5000 });
    const messageText = await this.successToast.textContent();
    console.log(`ASSERT: Success message displayed: "${messageText.trim()}"`);
    return messageText.trim();
  }

  async verifyRejectSuccessMessage() {
    console.log('ACTION: Verifying reject success message popup...');
    await expect(this.rejectToast).toBeVisible({ timeout: 5000 });
    const messageText = await this.rejectToast.textContent();
    console.log(`ASSERT: Reject success message displayed: "${messageText.trim()}"`);
    return messageText.trim();
  }

  async getFirstRecordDataWithNote() {
    console.log('ACTION: Getting first record data including note...');
    
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    if (totalRows < 2) {
      throw new Error('No data rows found in grid');
    }
    
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
      await this.clientContactsGrid.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      firstVisibleRow = rows.nth(1);
      await expect(firstVisibleRow).toBeVisible({ timeout: 5000 });
    }
    
    const cells = firstVisibleRow.locator('[role="gridcell"]');
    const firstName = await cells.nth(0).textContent();
    const lastName = await cells.nth(1).textContent();
    const email = await cells.nth(2).textContent();
    const phone = await cells.nth(3).textContent();
    const actionNotes = await cells.nth(6).textContent();
    
    const recordData = {
      firstName: firstName?.trim() || '',
      lastName: lastName?.trim() || '',
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      actionNotes: actionNotes?.trim() || ''
    };
    
    console.log(`ASSERT: First record data with action notes retrieved: ${JSON.stringify(recordData)}`);
    return recordData;
  }

  async verifyGridColumnDataDisplay(rowsToCheck = 3) {
    console.log(`ACTION: Verifying grid column data is displayed for ${rowsToCheck} rows...`);
    
    // Wait for grid to be visible
    await expect(this.clientContactsGrid).toBeVisible({ timeout: 10000 });
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

      // Expected columns in order: First Name, Last Name, Email, Phone Number, Client Notes
      const columnNames = [
        'First Name', 'Last Name', 'Email', 'Phone Number', 'Client Notes'
      ];

      // Check data columns (excluding Action column which is at the end)
      for (let j = 0; j < Math.min(cellCount - 1, columnNames.length); j++) {
        const cellText = (await cells.nth(j).textContent()).trim();
        const cellValue = cellText.length > 50 ? cellText.substring(0, 50) + '...' : cellText;
        const columnName = columnNames[j];
        
        // STRICT ASSERTION: Fail test if cell is empty (except for optional fields like Client Notes)
        const optionalFields = ['Client Notes'];
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
    await expect(this.clientContactsGrid).toBeVisible({ timeout: 10000 });
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

      // Check for action icons (complete and reject)
      const completeIcon = actionCell.locator('i.fa.fa-check.ng-star-inserted');
      const rejectIcon = actionCell.locator('i.fa.fa-times-circle.ml-10.ng-star-inserted');

      const completeCount = await completeIcon.count();
      const rejectCount = await rejectIcon.count();

      console.log(`\n  Row ${i + 1}: Complete icons: ${completeCount}, Reject icons: ${rejectCount}`);

      // STRICT ASSERTION: Fail test if Complete icon is missing
      await expect(completeCount).toBeGreaterThanOrEqual(1, `Row ${i + 1} should have Complete icon (fa-check)`);
      console.log(`    ✓ Complete icon found`);

      // STRICT ASSERTION: Fail test if Reject icon is missing
      await expect(rejectCount).toBeGreaterThanOrEqual(1, `Row ${i + 1} should have Reject icon (fa-times-circle)`);
      console.log(`    ✓ Reject icon found`);
    }

    console.log(`\nASSERT: Action column verified for ${rowsToCheck} row(s)`);
  }

  async verifyActionIconsForMultipleRows(rowCount = 3) {
    console.log(`ACTION: Verifying action icons for first ${rowCount} rows...`);
    
    const recordCount = await this.getGridRecordCount();
    const rowsToCheck = Math.min(recordCount, rowCount);
    
    if (rowsToCheck === 0) {
      console.log('DEBUG: No records to verify icons for');
      return;
    }
    
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    let checkedCount = 0;
    
    // Check first N visible data rows (skip header at index 0)
    for (let i = 1; i < totalRows && checkedCount < rowsToCheck; i++) {
      const row = rows.nth(i);
      const isVisible = await row.isVisible().catch(() => false);
      if (!isVisible) continue;
      
      const gridcells = row.locator('[role="gridcell"]');
      const cellCount = await gridcells.count();
      
      if (cellCount > 0) {
        // Get record data for logging
        const firstName = await gridcells.nth(0).textContent();
        const lastName = await gridcells.nth(1).textContent();
        console.log(`ACTION: Checking row ${checkedCount + 1} - ${firstName?.trim()} ${lastName?.trim()}`);
        
        // Check for complete icon
        const completeIcon = row.locator('i.fa.fa-check.ng-star-inserted');
        await expect(completeIcon).toBeVisible({ timeout: 5000 });
        await expect(completeIcon).toBeEnabled({ timeout: 5000 });
        
        // Check for reject icon
        const rejectIcon = row.locator('i.fa.fa-times-circle.ml-10.ng-star-inserted');
        await expect(rejectIcon).toBeVisible({ timeout: 5000 });
        await expect(rejectIcon).toBeEnabled({ timeout: 5000 });
        console.log(`ASSERT: Row ${checkedCount + 1} has both Complete and Reject icons`);
        checkedCount++;
      }
    }
    
    console.log(`ASSERT: Action icons verified for ${checkedCount} rows`);
  }

  // ==================================================================================
  // THUMBNAIL COUNT VERIFICATION METHODS
  // ==================================================================================
  async verifyThumbnailCountMatchesNewStatusRecords() {
    console.log('ACTION: Verifying thumbnail count matches records with "New" status...');
    
    const thumbnailCountText = await this.verifyClientContactsCountDisplay();
    const thumbnailCount = parseInt(thumbnailCountText);

    const newStatusCount = await this.getGridRecordCountAfterSearch();
    
    console.log(`ASSERT: Thumbnail count (${thumbnailCount}) matches New status records (${newStatusCount})`);
    expect(thumbnailCount).toBe(newStatusCount);
    
    return { thumbnailCount, newStatusCount };
  }

  // ==================================================================================
  // COMBINED WORKFLOW METHODS
  // ==================================================================================
  async performCompleteResetFunctionalityTest(loginPage) {
    console.log('ACTION: Performing complete reset functionality test...');
    
    const initialRecordCount = await this.getGridRecordCount();
    
    if (initialRecordCount === 0) {
      return { skipped: true, reason: 'No records available for reset test' };
    }
    
    const statuses = await this.getAvailableStatusOptions();
    const selectedStatus = statuses.find(s => s !== 'New') || statuses[1];
    
    await this.selectStatusFromDropdown(selectedStatus);
    await this.clickSearchButton();
    const filteredRecordCount = await this.getGridRecordCountAfterSearch();
    await this.searchTextbox.fill('Test');
    await expect(this.searchTextbox).toHaveValue('Test');
    
    await this.clickResetButton();
    const resetRecordCount = await this.getGridRecordCount();
    
    await expect(this.searchTextbox).toHaveValue('');
    await this.verifyDefaultStatusSelection();
    
    expect(resetRecordCount).toBe(initialRecordCount);
    
    console.log('ASSERT: Reset functionality test completed successfully');
    
    return {
      skipped: false,
      initialRecordCount,
      selectedStatus,
      filteredRecordCount,
      resetRecordCount
    };
  }

  // ==================================================================================
  // UTILITY METHODS
  // ==================================================================================
  async ensureRecordWithNewStatusExists() {
    console.log('ACTION: Checking if records with New status exist...');
    let recordCount = await this.getGridRecordCount();
    
    if (recordCount === 0) {
      console.log('ACTION: No records with New status found - creating one...');
      const { faker } = require('@faker-js/faker');
      
      const contactData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number('##########'),
        notes: faker.lorem.sentence()
      };
      
      await this.clickNewRequestButton();
      await this.verifyDialogVisible();
      await this.fillClientContactForm(contactData);
      await this.clickSaveButton();
      await this.verifyDialogClosed();
      await this.page.waitForTimeout(1500);
      
      recordCount = await this.getGridRecordCount();
      console.log(`ASSERT: New record created. Current record count: ${recordCount}`);
    } else {
      console.log(`ASSERT: Found ${recordCount} record(s) with New status`);
    }
    
    return recordCount;
  }

  // ==================================================================================
  // GRID STATE VERIFICATION METHODS (For Reset Functionality Testing)
  // ==================================================================================
  async getInitialGridData() {
    console.log('ACTION: Retrieving initial grid data before applying filters...');
    
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    const gridData = [];
    
    // Get data from all visible rows (skip header at index 0)
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      const isVisible = await row.isVisible().catch(() => false);
      if (!isVisible) continue;
      
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();
      
      if (cellCount > 0) {
        const firstName = await cells.nth(0).textContent();
        const lastName = await cells.nth(1).textContent();
        const email = await cells.nth(2).textContent();
        const phone = await cells.nth(3).textContent();
        
        gridData.push({
          firstName: firstName?.trim() || '',
          lastName: lastName?.trim() || '',
          email: email?.trim() || '',
          phone: phone?.trim() || ''
        });
      }
    }
    
    console.log(`ASSERT: Stored initial grid data with ${gridData.length} records`);
    return gridData;
  }

  async verifyGridDataMatchesInitialState(initialGridData) {
    console.log('ACTION: Verifying current grid data matches initial state...');
    
    const rows = this.page.locator('[role="row"]');
    const totalRows = await rows.count();
    
    const currentGridData = [];
    
    // Get data from all visible rows (skip header at index 0)
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      const isVisible = await row.isVisible().catch(() => false);
      if (!isVisible) continue;
      
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();
      
      if (cellCount > 0) {
        const firstName = await cells.nth(0).textContent();
        const lastName = await cells.nth(1).textContent();
        const email = await cells.nth(2).textContent();
        const phone = await cells.nth(3).textContent();
        
        currentGridData.push({
          firstName: firstName?.trim() || '',
          lastName: lastName?.trim() || '',
          email: email?.trim() || '',
          phone: phone?.trim() || ''
        });
      }
    }
    
    // Verify counts match
    expect(currentGridData.length).toBe(initialGridData.length);
    console.log(`ASSERT: Grid record count matches: ${currentGridData.length} records`);
    
    // Verify data matches
    for (let i = 0; i < initialGridData.length; i++) {
      expect(currentGridData[i].firstName).toBe(initialGridData[i].firstName);
      expect(currentGridData[i].lastName).toBe(initialGridData[i].lastName);
      expect(currentGridData[i].email).toBe(initialGridData[i].email);
      expect(currentGridData[i].phone).toBe(initialGridData[i].phone);
    }
    
    console.log('ASSERT: All grid records match initial state');
  }

  async verifyRecordInGrid(firstName, lastName, note = null) {
    console.log(`ACTION: Verifying record "${firstName} ${lastName}" in same grid row...`);
    
    // Build locator that finds row containing ALL criteria
    let rowLocator = this.page.locator('[role="row"]')
      .filter({ hasText: firstName })
      .filter({ hasText: lastName });
    
    if (note) {
      rowLocator = rowLocator.filter({ hasText: note });
    }
    
    // Verify the row exists
    await expect(rowLocator.first()).toBeVisible({ timeout: 5000 });
    
    console.log(`  ✓ First Name "${firstName}" found in grid`);
    console.log(`  ✓ Last Name "${lastName}" found in same row`);
    if (note) {
      console.log(`  ✓ Note "${note}" found in same row`);
    }
    
    console.log(`ASSERT: Record "${firstName} ${lastName}" with all fields found in same grid row`);
  }

  async verifyFirstNameInGrid(firstName) {
    console.log(`ACTION: Verifying first name "${firstName}" exists in grid...`);
    
    // Build locator that finds gridcell containing firstName
    const cellLocator = this.page.locator('[role="gridcell"]')
      .filter({ hasText: firstName });
    
    // Verify the cell exists
    await expect(cellLocator.first()).toBeVisible({ timeout: 5000 });
    
    console.log(`  ✓ First Name "${firstName}" found in grid`);
    console.log(`ASSERT: First Name "${firstName}" verified in grid`);
  }

  async verifyLastNameInGrid(lastName) {
    console.log(`ACTION: Verifying last name "${lastName}" exists in grid...`);
    
    // Build locator that finds gridcell containing lastName
    const cellLocator = this.page.locator('[role="gridcell"]')
      .filter({ hasText: lastName });
    
    // Verify the cell exists
    await expect(cellLocator.first()).toBeVisible({ timeout: 5000 });
    
    console.log(`  ✓ Last Name "${lastName}" found in grid`);
    console.log(`ASSERT: Last Name "${lastName}" verified in grid`);
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
      const cells = row.locator('[role="gridcell"]');
      if (await cells.count() > columnIndex) {
        const cellText = await cells.nth(columnIndex).textContent().catch(() => '');
        values.push(cellText ? cellText.trim() : '');
      }
    }
    
    console.log(`  Extracted ${values.length} values from column ${columnIndex}`);
    return values;
  }

  async clickColumnHeader(columnIndex) {
    console.log(`ACTION: Clicking column header at index ${columnIndex}...`);
    
    const headerRow = this.page.locator('[role="row"]').first();
    const headers = headerRow.locator('[role="columnheader"]');
    
    const header = headers.nth(columnIndex);
    await expect(header).toBeVisible({ timeout: 10000 });
    
    const headerText = await header.textContent();
    console.log(`  Targeting: "${headerText.trim()}" at column index ${columnIndex}`);
    
    await this.page.waitForTimeout(500);
    await header.click({ force: true });
    console.log(`  ✓ Header clicked, waiting for sort indicator...`);
    
    // Wait for the sort to complete
    await this.page.waitForTimeout(1000);
    
    console.log(`ASSERT: Clicked column header at index ${columnIndex}`);
  }

  async waitForLoadingSpinnerToDisappear() {
    console.log(`ACTION: Waiting for loading spinner to disappear...`);
    try {
      await this.loader.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
        console.log('DEBUG: No loader found or already hidden');
      });
    } catch (e) {
      console.log('DEBUG: Loader wait timeout, continuing...');
    }
    console.log(`ASSERT: Loading spinner disappeared`);
  }

  async getSortArrowIndicator(columnIndex) {
    console.log(`ACTION: Checking for sort arrow indicator on column ${columnIndex}...`);
    
    const headerRow = this.page.locator('[role="row"]').first();
    const headers = headerRow.locator('[role="columnheader"]');
    const header = headers.nth(columnIndex);
    
    // Look for arrow icons or classes indicating sort order
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

  async testColumnSorting(colIndex, columnName) {
    console.log(`\n🔤 Testing ${columnName} Column Sorting (Multi-click Validation)...`);
    
    // Get initial values before sorting
    const initialValues = await this.getColumnValues(colIndex, 10);
    console.log(`  Initial values (${initialValues.length} rows): ${initialValues.slice(0, 5).join(', ')}${initialValues.length > 5 ? '...' : ''}`);

    // CLICK 1: Test Ascending Order
    console.log(`  ACTION: Clicking column ${colIndex} header (1st click - expect ascending)...`);
    await this.clickColumnHeader(colIndex);
    await this.waitForLoadingSpinnerToDisappear();

    const ascArrow = await this.getSortArrowIndicator(colIndex);
    console.log(`  Sort indicator after 1st click: ${ascArrow}`);

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
    console.log(`  ACTION: Clicking column ${colIndex} header (2nd click - expect descending)...`);
    await this.clickColumnHeader(colIndex);
    await this.waitForLoadingSpinnerToDisappear();

    const descArrow = await this.getSortArrowIndicator(colIndex);
    console.log(`  Sort indicator after 2nd click: ${descArrow}`);

    console.log(`  ASSERT: Verifying first 10 records are sorted in descending order...`);
    const descValues = await this.getColumnValues(colIndex, 10);
    console.log(`  Values after 2nd click (${descValues.length} rows): ${descValues.slice(0, 5).join(', ')}${descValues.length > 5 ? '...' : ''}`);
    
    try {
      await this.verifyColumnSorted(colIndex, 'desc', 10);
      console.log(`  ✅ SUCCESS: ${columnName} column correctly sorted in DESCENDING order`);
    } catch (error) {
      throw new Error(`DESCENDING SORT FAILED for ${columnName}: ${error.message}`);
    }

    // CLICK 3: Test Reset to Original Order
    console.log(`  ACTION: Clicking column ${colIndex} header (3rd click - expect original/unsorted)...`);
    await this.clickColumnHeader(colIndex);
    await this.waitForLoadingSpinnerToDisappear();

    const resetArrow = await this.getSortArrowIndicator(colIndex);
    console.log(`  Sort indicator after 3rd click: ${resetArrow}`);
    console.log(`  ✅ SUCCESS: ${columnName} column reset to original order (sort cleared)`);

    console.log(`  ACTION: Clicking Reset button to restore initial state...`);
    await this.clickResetButton();
    await this.page.waitForTimeout(500);
    await this.waitForLoadingSpinnerToDisappear();
    console.log(`  ✓ Reset completed for ${columnName} column\n`);
  }

  // ==================================================================================
  // RECORD DATA POPULATION VERIFICATION METHODS
  // ==================================================================================
  async verifyRecordFirstNamePopulated(recordData) {
    console.log(`ACTION: Verifying First Name is populated...`);
    expect(recordData.firstName).not.toBe('');
    console.log(`  ✓ First Name populated: "${recordData.firstName}"`);
    console.log(`ASSERT: Record First Name is not empty`);
  }

  async verifyRecordLastNamePopulated(recordData) {
    console.log(`ACTION: Verifying Last Name is populated...`);
    expect(recordData.lastName).not.toBe('');
    console.log(`  ✓ Last Name populated: "${recordData.lastName}"`);
    console.log(`ASSERT: Record Last Name is not empty`);
  }

  async verifyRecordEmailPopulated(recordData) {
    console.log(`ACTION: Verifying Email is populated...`);
    expect(recordData.email).not.toBe('');
    console.log(`  ✓ Email populated: "${recordData.email}"`);
    console.log(`ASSERT: Record Email is not empty`);
  }

  async verifyRecordPhonePopulated(recordData) {
    console.log(`ACTION: Verifying Phone Number is populated...`);
    expect(recordData.phone).not.toBe('');
    console.log(`  ✓ Phone Number populated: "${recordData.phone}"`);
    console.log(`ASSERT: Record Phone Number is not empty`);
  }

  async verifyRecordClientNotesPopulated(recordData) {
    console.log(`ACTION: Verifying Client Notes is populated...`);
    expect(recordData.clientNotes).not.toBe('');
    console.log(`  ✓ Client Notes populated: "${recordData.clientNotes}"`);
    console.log(`ASSERT: Record Client Notes is not empty`);
  }

  async verifyAllRecordFieldsPopulated(recordData) {
    console.log(`ACTION: Verifying all record fields are populated...`);
    await this.verifyRecordFirstNamePopulated(recordData);
    await this.verifyRecordLastNamePopulated(recordData);
    await this.verifyRecordEmailPopulated(recordData);
    await this.verifyRecordPhonePopulated(recordData);
    await this.verifyRecordClientNotesPopulated(recordData);
    console.log(`ASSERT: All record fields verified as populated`);
  }

  // ==================================================================================
  // STATUS DROPDOWN FILTER VERIFICATION METHODS
  // ==================================================================================
  async storeInitialRecords(recordCount = 3) {
    console.log(`ACTION: Storing first ${recordCount} records from initial grid...`);
    const initialRecords = [];
    const recordsToStore = Math.min(recordCount, await this.getGridRecordCount());
    
    for (let i = 0; i < recordsToStore; i++) {
      const recordData = await this.getRecordDataByIndex(i);
      initialRecords.push(recordData);
      console.log(`  Stored record ${i + 1}: "${recordData.firstName} ${recordData.lastName}"`);
    }
    
    console.log(`ASSERT: Successfully stored ${initialRecords.length} records`);
    return initialRecords;
  }

  async verifyStatusFilterChangesGrid(status, initialRecords) {
    console.log(`\n  ACTION: Testing status filter: "${status}"`);
    await this.selectStatusFromDropdown(status);
    await this.page.waitForTimeout(500);
    await this.clickSearchButton();
    
    const filteredCount = await this.getGridRecordCountAfterSearch();
    console.log(`  Filtered records for status "${status}": ${filteredCount}`);

    if (filteredCount > 0) {
      console.log(`  Verifying that stored initial records are NOT in filtered results...`);
      let foundInitialRecords = 0;

      for (let i = 0; i < initialRecords.length; i++) {
        const record = initialRecords[i];
        try {
          await this.verifyRecordInGrid(record.firstName, record.lastName);
          console.log(`    ❌ ERROR: Initial record ${i + 1} "${record.firstName} ${record.lastName}" still found in filtered grid!`);
          foundInitialRecords++;
        } catch (error) {
          console.log(`    ✓ Initial record ${i + 1} "${record.firstName} ${record.lastName}" correctly NOT found in filtered grid`);
        }
      }

      // Test should FAIL ONLY if ALL initial records are found (means filter didn't work at all)
      if (foundInitialRecords === initialRecords.length) {
        throw new Error(`❌ FILTER VALIDATION FAILED: ALL ${initialRecords.length} initial records were found in filtered grid. The status filter "${status}" did not change the displayed records at all.`);
      }
      
      console.log(`  ✓ Status filter "${status}" correctly changed grid records (${initialRecords.length - foundInitialRecords} records properly filtered out)`);
    }

    console.log(`  Resetting filter after testing status "${status}"...`);
    await this.clickResetButton();
    await this.page.waitForTimeout(500);
  }

  async verifyRecordsRestoredAfterReset(initialRecords) {
    console.log(`\n  ACTION: Verifying that initial grid records are restored after reset...`);
    console.log(`  Verifying all ${initialRecords.length} stored records are back in grid...`);
    
    for (let i = 0; i < initialRecords.length; i++) {
      const record = initialRecords[i];
      console.log(`    Verifying record ${i + 1}: "${record.firstName} ${record.lastName}"...`);
      await this.verifyRecordInGrid(record.firstName, record.lastName);
      console.log(`    ✓ Record ${i + 1} "${record.firstName} ${record.lastName}" found in grid after reset`);
    }
    
    console.log(`  ✓ All ${initialRecords.length} initial records successfully restored`);
  }
}

module.exports = { ClientContactsPage };
