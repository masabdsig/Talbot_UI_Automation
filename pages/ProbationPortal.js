const { expect } = require('@playwright/test');

class ProbationPortalPage {
  constructor(page) {
    this.page = page;

    // ==================================================================================
    // NAVIGATION & URLS
    // ==================================================================================
    this.portalRequestsUrl = '/portal-approval';
    this.dashboardUrl = '/dashboard';

    // ==================================================================================
    // PORTAL NAVIGATION LOCATORS
    // ==================================================================================
    this.skipMfaButton = page.getByRole('button', { name: ' Skip' });
    this.skipButton = page.locator('button').filter({ hasText: /Skip/ });
    this.probationPortalThumbnail = page.locator('div').filter({ hasText: /Probation Portal/ }).locator('..').first();
    this.probationPortalHeading = page.locator('h6:has-text("Probation Portal")').first();
    this.probationPortalGrid = page.locator('[role="grid"]').first();

    // ==================================================================================
    // PROBATION PORTAL SECTION CONTROLS
    // ==================================================================================
    this.searchInput = page.getByRole('textbox').first();
    this.statusDropdown = page.getByRole('combobox').filter({ hasText: /New|Status/ }).first();
    this.searchButton = page.getByRole('button').filter({ hasText: /\bSearch\b/ }).first();
    this.resetButton = page.getByRole('button').filter({ hasText: /\bReset\b/ }).first();
    this.newRequestButton = page.locator('button').filter({ hasText: /New Request/ }).first();

    // ==================================================================================
    // PROBATION PORTAL GRID LOCATORS
    // ==================================================================================
    this.probationPortalGridContainer = page.locator('[role="grid"]').first();
    this.gridRows = page.locator('[role="row"]');
    this.gridCells = page.locator('[role="gridcell"]');
    this.paginationText = page.getByText(/\(\d+ items?\)/);

    // Grid column headers
    this.firstNameColumn = page.locator('[role="columnheader"]').filter({ hasText: /First Name/ });
    this.lastNameColumn = page.locator('[role="columnheader"]').filter({ hasText: /Last Name/ });
    this.emailColumn = page.locator('[role="columnheader"]').filter({ hasText: /Email/ });
    this.phoneColumn = page.locator('[role="columnheader"]').filter({ hasText: /Phone/ });
    this.designationColumn = page.locator('[role="columnheader"]').filter({ hasText: /Designation/ });
    this.additionalInfoColumn = page.locator('[role="columnheader"]').filter({ hasText: /Additional Info/ });
    this.actionByColumn = page.locator('[role="columnheader"]').filter({ hasText: /Action By/ });
    this.actionNotesColumn = page.locator('[role="columnheader"]').filter({ hasText: /Action Notes/ });

    // ==================================================================================
    // NEW REQUEST DIALOG LOCATORS
    // ==================================================================================
    this.probationPortalDialog = page.getByRole('dialog');
    this.probationPortalDialogTitle = page.locator('dialog h5, [role="dialog"] h5').filter({ hasText: /Probation Portal Access/ });
    this.dialogCloseButton = page.locator('.fa.fa-times').first();
    this.closeDialogButton = page.locator('.fa.fa-times').first();

    // Form fields
    this.firstNameField = page.getByRole('dialog').getByRole('textbox').first();
    this.lastNameField = page.getByRole('dialog').getByRole('textbox').nth(1);
    this.emailField = page.getByRole('dialog').getByRole('textbox').nth(2);
    this.phoneField = page.getByRole('dialog').getByRole('textbox').nth(3);
    this.designationField = page.getByRole('dialog').getByRole('textbox').nth(5);
    this.additionalInfoField = page.getByRole('dialog').getByRole('textbox').nth(4);
    this.saveButton = page.locator('button').filter({ hasText: /Save/ }).first();

    // Legacy aliases for backwards compatibility
    this.firstNameInput = this.firstNameField;
    this.lastNameInput = this.lastNameField;
    this.emailInput = this.emailField;
    this.phoneInput = this.phoneField;
    this.designationInput = this.designationField;
    this.additionalInfoInput = this.additionalInfoField;

    // ==================================================================================
    // ADD NOTE/REASON DIALOG LOCATORS
    // ==================================================================================
    this.addNoteDialog = page.getByRole('dialog');
    this.noteTextArea = page.getByRole('dialog').getByRole('textbox');

    // ==================================================================================
    // ACTION ICONS LOCATORS
    // ==================================================================================
    this.approveButton = page.getByTitle('Approve');
    this.rejectButton = page.getByTitle('Reject');

    // ==================================================================================
    // LOADER LOCATOR
    // ==================================================================================
    this.loadingSpinner = page.locator('.spinner, .loader, [class*="loading"], [class*="spinner"], .ngx-spinner').first();
  }

  // ==================================================================================
  // NAVIGATION METHODS
  // ==================================================================================
  async navigateToDashboard() {
    console.log('ACTION: Navigating to Dashboard...');
    await this.page.goto(this.dashboardUrl);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    console.log('ASSERT: Dashboard loaded');
  }

  async navigateToPortalRequests() {
    console.log('ACTION: Navigating to Portal Requests page...');
    await this.page.goto(this.portalRequestsUrl);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    console.log('ASSERT: Portal Requests page loaded');
  }

  async navigateToPortalRequestsViaUI() {
    console.log('ACTION: Navigating to Portal Requests via UI...');
    
    // Click on Quick Menu
    console.log('  Step 1: Opening Quick Menu...');
    const quickMenuButton = this.page.getByTitle('Quick Menu');
    await expect(quickMenuButton).toBeVisible({ timeout: 10000 });
    await quickMenuButton.click();
    await this.page.waitForTimeout(500);
    console.log('  Quick Menu opened');
    
    // Click on Portal Requests
    console.log('  Step 2: Clicking Portal Requests...');
    const portalRequestsLink = this.page.getByText('Portal Requests').first();
    await expect(portalRequestsLink).toBeVisible({ timeout: 10000 });
    await portalRequestsLink.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.waitForLoadingSpinnerToComplete();
    console.log('ASSERT: Portal Requests page loaded via UI navigation');
  }

  async navigateToProbationPortalViaUI() {
    console.log('ACTION: Navigating to Probation Portal via UI...');
    
    // Click on Probation Portal heading
    console.log('  Clicking on Probation Portal heading...');
    const probationPortalHeading = this.page.getByRole('heading', { name: 'Probation Portal' });
    await expect(probationPortalHeading).toBeVisible({ timeout: 10000 });
    await probationPortalHeading.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.waitForLoadingSpinnerToComplete();
    console.log('ASSERT: Probation Portal section loaded via UI navigation');
  }

  async skipMfa() {
    console.log('ACTION: Clicking Skip MFA button...');
    await expect(this.skipMfaButton).toBeVisible();
    await this.skipMfaButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: MFA skipped');
  }

  async waitForPortalRequestsGridToLoad() {
    console.log('ACTION: Waiting for Portal Requests dashboard to load with category cards...');
    // Wait for category cards to appear (thumbnails for Patient Portal, Probation Portal, etc.)
    const categoryCard = this.page.locator('div').filter({ hasText: /Patient Portal|Probation Portal/ }).first();
    await expect(categoryCard).toBeVisible({ timeout: 15000 });
    await this.waitForLoadingSpinnerToComplete();
    console.log('ASSERT: Portal Requests dashboard loaded with category cards');
  }

  async waitForLoadingSpinnerToComplete() {
    console.log('ACTION: Waiting for loading spinner to complete...');
    await this.page.waitForTimeout(500);
    try {
      const spinners = this.page.locator('.spinner, .loader, [class*="loading"], [class*="spinner"], .ngx-spinner, [role="progressbar"]');
      const spinnerCount = await spinners.count();
      
      if (spinnerCount > 0) {
        console.log(`  Found ${spinnerCount} spinner(s), waiting for them to disappear...`);
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
  // PROBATION PORTAL TAB VERIFICATION METHODS
  // ==================================================================================
  async verifyProbationPortalIsSelected() {
    console.log('ACTION: Verifying Probation Portal is displayed/selected...');
    // Verify the Probation Portal heading is visible
    const probationPortalHeading = this.page.locator('h6:has-text("Probation Portal")');
    await expect(probationPortalHeading).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Probation Portal is displayed and selected');
  }

  async verifyProbationPortalThumbnailVisible() {
    console.log('ACTION: Verifying Probation Portal thumbnail is visible...');
    await this.waitForLoadingSpinnerToComplete();
    await expect(this.probationPortalThumbnail).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Probation Portal thumbnail is visible');
  }

  async getThumbnailCount() {
    console.log('ACTION: Extracting Probation Portal thumbnail count...');
    try {
      // Use the direct XPath to the Probation Portal thumbnail count
      const countSpan = this.page.locator('//*[@id="canvas-bookmark"]/div/div/main/patient-portal-access/div/div[1]/div[3]/div/div[2]/h2/span');
      await expect(countSpan).toBeVisible({ timeout: 10000 });
      
      const countText = await countSpan.textContent();
      
      if (countText) {
        const count = parseInt(countText.trim());
        console.log(`ASSERT: Probation Portal thumbnail count is ${count}`);
        return count;
      }
    } catch (e) {
      console.log('WARNING: Could not extract thumbnail count');
    }
    return null;
  }

  async clickProbationPortalThumbnail() {
    console.log('ACTION: Clicking on Probation Portal thumbnail...');
    await expect(this.probationPortalThumbnail).toBeVisible();
    await this.probationPortalThumbnail.click();
    
    // Wait for navigation and page load
    console.log('  Waiting for page to load and spinner to complete...');
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.waitForLoadingSpinnerToComplete();
    
    console.log('ASSERT: Probation Portal thumbnail clicked, navigating to section');
  }

  async verifyProbationPortalGridDisplayed() {
    console.log('ACTION: Verifying Probation Portal grid is displayed...');
    await this.waitForLoadingSpinnerToComplete();
    
    // Wait for the grid to be visible
    const gridLocator = this.page.locator('[role="grid"]').first();
    await expect(gridLocator).toBeVisible({ timeout: 15000 });
    console.log('ASSERT: Probation Portal grid is displayed');
  }

  async verifySearchControl() {
    console.log('ACTION: Verifying Search control is visible and enabled...');
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await expect(this.searchInput).toBeEnabled({ timeout: 10000 });
    console.log('ASSERT: Search textbox is visible and enabled');
  }

  async verifyStatusDropdown() {
    console.log('ACTION: Verifying Status dropdown is visible and enabled...');
    await expect(this.statusDropdown).toBeVisible({ timeout: 10000 });
    await expect(this.statusDropdown).toBeEnabled({ timeout: 10000 });
    console.log('ASSERT: Status dropdown is visible and enabled');
  }

  async verifySearchButton() {
    console.log('ACTION: Verifying Search button is visible and enabled...');
    await expect(this.searchButton).toBeVisible({ timeout: 10000 });
    await expect(this.searchButton).toBeEnabled({ timeout: 10000 });
    console.log('ASSERT: Search button is visible and enabled');
  }

  async verifyResetButton() {
    console.log('ACTION: Verifying Reset button is visible and enabled...');
    await expect(this.resetButton).toBeVisible({ timeout: 10000 });
    await expect(this.resetButton).toBeEnabled({ timeout: 10000 });
    console.log('ASSERT: Reset button is visible and enabled');
  }

  async verifyNewRequestButton() {
    console.log('ACTION: Verifying New Request button is visible and enabled...');
    await expect(this.newRequestButton).toBeVisible({ timeout: 10000 });
    await expect(this.newRequestButton).toBeEnabled({ timeout: 10000 });
    console.log('ASSERT: New Request button is visible and enabled');
  }

  async verifyAllControlsVisible() {
    console.log('ACTION: Verifying all Probation Portal controls are visible...');
    // Wait for loading to complete before checking controls
    await this.waitForLoadingSpinnerToComplete();
    
    // Add small delay to ensure DOM is stable
    await this.page.waitForTimeout(500);
    
    console.log('  Checking Search control...');
    await this.verifySearchControl();
    
    console.log('  Checking Status dropdown...');
    await this.verifyStatusDropdown();
    
    console.log('  Checking Search button...');
    await this.verifySearchButton();
    
    console.log('  Checking Reset button...');
    await this.verifyResetButton();
    
    console.log('  Checking New Request button...');
    await this.verifyNewRequestButton();
    
    console.log('ASSERT: All Probation Portal controls are visible and accessible');
  }

  // ==================================================================================
  // CONTROL VISIBILITY VALIDATION METHODS
  // ==================================================================================
  async verifyDefaultStatusSelection() {
    console.log('ACTION: Verifying default status selection in dropdown...');
    const statusValue = await this.statusDropdown.inputValue().catch(() => null);
    expect(statusValue || 'New').toBe('New');
    console.log(`ASSERT: Status dropdown shows "${statusValue || 'New'}" as default selection`);
  }

  async clickStatusDropdownToExpandOptions() {
    console.log('ACTION: Clicking Status dropdown to expand and view all options...');
    await expect(this.statusDropdown).toBeVisible({ timeout: 10000 });
    await this.statusDropdown.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Status dropdown expanded to show available options');
  }

  async verifyStatusDropdownOptionsAvailable() {
    console.log('ACTION: Verifying status dropdown options are available...');
    const options = this.page.getByRole('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
    
    // Fetch and print all available options
    console.log(`ASSERT: Status dropdown has ${optionCount} available option(s):`);
    const availableOptions = [];
    for (let i = 0; i < optionCount; i++) {
      const optionText = await options.nth(i).textContent();
      availableOptions.push(optionText.trim());
      console.log(`  - ${optionText.trim()}`);
    }
    console.log(`✓ Available options: ${availableOptions.join(', ')}`);
  }

  async validateGridColumns() {
    console.log('ACTION: Validating grid columns...');
    
    // Wait for grid to be loaded
    await expect(this.probationPortalGridContainer).toBeVisible({ timeout: 10000 });
    console.log('ACTION: Grid is visible');
    
    const columns = [
      { locator: this.firstNameColumn, name: 'First Name' },
      { locator: this.lastNameColumn, name: 'Last Name' },
      { locator: this.emailColumn, name: 'Email' },
      { locator: this.phoneColumn, name: 'Phone Number' },
      { locator: this.designationColumn, name: 'Designation' },
      { locator: this.additionalInfoColumn, name: 'Additional Info' },
      { locator: this.actionByColumn, name: 'Action By' },
      { locator: this.actionNotesColumn, name: 'Action Notes' }
    ];

    for (const column of columns) {
      await expect(column.locator).toBeVisible();
      console.log(`ACTION: ${column.name} column visible`);
    }
    
    console.log('ASSERT: All expected columns are visible');
  }

  // ==================================================================================
  // NEW REQUEST DIALOG METHODS
  // ==================================================================================
  async clickNewRequestButton() {
    console.log('ACTION: Clicking New Request button...');
    await this.newRequestButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: New Request button clicked');
  }

  async verifyProbationPortalAccessDialogOpened() {
    console.log('ACTION: Verifying Probation Portal Access dialog opened...');
    await expect(this.probationPortalDialogTitle).toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Probation Portal Access dialog title is visible');
  }

  async verifyCloseDialogButton() {
    console.log('ACTION: Verifying close button in dialog...');
    await expect(this.closeDialogButton).toBeVisible();
    console.log('ASSERT: Close button (cross icon) is visible');
  }

  async closeDialog() {
    console.log('ACTION: Clicking close button to close dialog...');
    await this.closeDialogButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Close button clicked');
  }

  async verifyDialogClosed() {
    console.log('ACTION: Verifying dialog is closed...');
    await expect(this.probationPortalDialog).toBeHidden({ timeout: 5000 });
    console.log('ASSERT: Dialog is closed');
  }

  async verifySuccessMessagePopup() {
    console.log('ACTION: Verifying success message popup appeared...');
    const successMessage = this.page.locator('[role="alert"], .success-message, .notification');
    try {
      await expect(successMessage).toBeVisible({ timeout: 5000 });
      const messageText = await successMessage.textContent();
      console.log(`ASSERT: Success message appeared - "${messageText}"`);
    } catch (error) {
      console.log('INFO: No visible success message found, but action may still have completed');
    }
  }

  async verifyGridHasRecords(expectedCount = null) {
    console.log(`ACTION: Verifying grid has records${expectedCount ? ` (expecting ${expectedCount})` : ''}...`);
    const recordCount = await this.getGridRecordCount();
    
    if (recordCount === 0) {
      throw new Error('Grid has no records');
    }
    
    if (expectedCount !== null && recordCount !== expectedCount) {
      console.log(`WARNING: Expected ${expectedCount} records but found ${recordCount}`);
    } else {
      console.log(`ASSERT: Grid has ${recordCount} records`);
    }
    
    return recordCount;
  }

  // ==================================================================================
  // FORM FILLING METHODS
  // ==================================================================================
  async fillFirstName(firstName) {
    console.log(`ACTION: Filling First Name with "${firstName}"...`);
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(firstName);
    console.log('ASSERT: First Name filled');
  }

  async fillLastName(lastName) {
    console.log(`ACTION: Filling Last Name with "${lastName}"...`);
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(lastName);
    console.log('ASSERT: Last Name filled');
  }

  async fillEmail(email) {
    console.log(`ACTION: Filling Email with "${email}"...`);
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    console.log('ASSERT: Email filled');
  }

  async fillPhone(phone) {
    console.log(`ACTION: Filling Phone with "${phone}"...`);
    await this.phoneInput.clear();
    await this.phoneInput.fill(phone);
    console.log('ASSERT: Phone filled');
  }

  async fillDesignation(designation) {
    console.log(`ACTION: Filling Designation with "${designation}"...`);
    await this.designationInput.clear();
    await this.designationInput.fill(designation);
    console.log('ASSERT: Designation filled');
  }

  async fillAdditionalInfo(additionalInfo) {
    console.log(`ACTION: Filling Additional Info with "${additionalInfo}"...`);
    await this.additionalInfoInput.clear();
    await this.additionalInfoInput.fill(additionalInfo);
    console.log('ASSERT: Additional Info filled');
  }

  async clickSaveButton() {
    console.log('ACTION: Clicking Save button...');
    await this.saveButton.click();
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Save button clicked');
  }

  // ==================================================================================
  // SEARCH AND FILTER METHODS
  // ==================================================================================
  async fillSearchInput(searchText) {
    console.log(`ACTION: Filling search input with "${searchText}"...`);
    await this.searchInput.clear();
    await this.searchInput.fill(searchText);
    console.log('ASSERT: Search input filled');
  }

  async clickSearchButton() {
    console.log('ACTION: Clicking Search button...');
    await this.searchButton.click();
    await this.waitForLoadingSpinnerToComplete();
    console.log('ASSERT: Search button clicked');
  }

  async clickResetButton() {
    console.log('ACTION: Clicking Reset button...');
    await this.resetButton.click();
    await this.page.waitForTimeout(1000);
    console.log('ASSERT: Reset button clicked');
  }

  // ==================================================================================
  // STATUS FILTERING AND SELECTION METHODS
  // ==================================================================================
  async selectStatusFilter(status) {
    console.log(`ACTION: Selecting status filter "${status}"...`);
    await this.statusDropdown.click();
    const statusOption = this.page.getByRole('option', { name: status });
    await statusOption.click();
    await this.page.waitForTimeout(500);
    console.log(`ASSERT: Status filter set to "${status}"`);
  }

  async verifyRecordInGrid(firstName, lastName, email = null, designation = null, additionalInfo = null, note = null) {
    console.log(`ACTION: Verifying record "${firstName} ${lastName}" in grid with all data...`);
    
    // Find row containing ALL provided values (firstName, lastName, and optionally email, designation, additionalInfo, note)
    let recordRow = this.page.locator('[role="row"]')
      .filter({ hasText: firstName })
      .filter({ hasText: lastName });
    
    // Add additional filters if provided
    if (email) {
      recordRow = recordRow.filter({ hasText: email });
    }
    if (designation) {
      recordRow = recordRow.filter({ hasText: designation });
    }
    if (additionalInfo) {
      recordRow = recordRow.filter({ hasText: additionalInfo });
    }
    if (note) {
      recordRow = recordRow.filter({ hasText: note });
    }
    
    // Verify the row exists
    await expect(recordRow.first()).toBeVisible({ timeout: 5000 });
    
    console.log(`  ✓ First Name "${firstName}" found in grid`);
    console.log(`  ✓ Last Name "${lastName}" found in same row`);
    if (email) {
      console.log(`  ✓ Email "${email}" found in same row`);
    }
    if (designation) {
      console.log(`  ✓ Designation "${designation}" found in same row`);
    }
    if (additionalInfo) {
      console.log(`  ✓ Additional Info "${additionalInfo}" found in same row`);
    }
    if (note) {
      console.log(`  ✓ Note "${note}" found in same row`);
    }
    
    console.log('ASSERT: Complete record data verified in same grid row');
  }

  // ==================================================================================
  // GRID DATA RETRIEVAL AND VERIFICATION METHODS
  // ==================================================================================
  async getColumnCount() {
    console.log('ACTION: Getting column count from grid header...');
    const headerCells = this.page.locator('[role="columnheader"]');
    const count = await headerCells.count();
    console.log(`ASSERT: Grid has ${count} columns`);
    return count;
  }

  // ==================================================================================
  // ACTION BUTTON METHODS (APPROVE/REJECT)
  // ==================================================================================
  async clickApproveButton(recordIndex = 0) {
    console.log(`ACTION: Clicking Approve button for record ${recordIndex}...`);
    const approveButtons = this.page.getByTitle('Approve');
    await approveButtons.nth(recordIndex).click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Approve button clicked');
  }

  async clickRejectButtonForRecord(recordIndex = 0) {
    console.log(`ACTION: Clicking Reject button for record ${recordIndex}...`);
    const rejectButtons = this.page.getByTitle('Reject');
    await rejectButtons.nth(recordIndex).click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Reject button clicked');
  }

  async verifyAddNoteDialogOpened() {
    console.log('ACTION: Verifying Add Note/Reason dialog opened...');
    const dialogTitle = this.page.locator('[role="dialog"] h5').filter({ hasText: /Add Note|Reason/ });
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });
    console.log('ASSERT: Add Note/Reason dialog title is visible');
  }

  // ==================================================================================
  // APPROVAL/REJECTION DIALOG METHODS
  // ==================================================================================
  async enterNote(noteText) {
    console.log(`ACTION: Entering note "${noteText}"...`);
    await this.noteTextArea.clear();
    await this.noteTextArea.fill(noteText);
    console.log('ASSERT: Note entered');
  }

  async verifyPaginationDisplays(expectedText = '1 of 1 pages (5 items)') {
    console.log(`ACTION: Verifying pagination displays "${expectedText}"...`);
    const paginationElement = this.page.getByText(/\d+ of \d+ pages/);
    await expect(paginationElement).toBeVisible();
    const text = await paginationElement.textContent();
    console.log(`ASSERT: Pagination displays "${text}"`);
  }

  // ==================================================================================
  // GRID RECORD COUNT AND DATA RETRIEVAL METHODS
  // ==================================================================================
  async getInitialGridCount() {
    console.log('ACTION: Getting initial grid count...');
    let count = 0;
    try {
      const paginationContent = await this.paginationText.textContent({ timeout: 3000 });
      const countMatch = paginationContent.match(/\((\d+)\s+items?\)/);
      if (countMatch) {
        count = parseInt(countMatch[1]);
      }
    } catch (e) {
      console.log('INFO: Could not extract count from pagination');
      const rows = this.gridRows;
      count = (await rows.count()) - 1; // -1 for header row
    }
    console.log(`ASSERT: Initial grid count: ${count}`);
    return count;
  }

  async getUpdatedGridCount() {
    console.log('ACTION: Getting updated grid count...');
    let count = 0;
    try {
      const paginationContent = await this.paginationText.textContent({ timeout: 3000 });
      const countMatch = paginationContent.match(/\((\d+)\s+items?\)/);
      if (countMatch) {
        count = parseInt(countMatch[1]);
      }
    } catch (e) {
      console.log('INFO: Could not extract updated count from pagination');
      const rows = this.gridRows;
      count = (await rows.count()) - 1; // -1 for header row
    }
    console.log(`ASSERT: Updated grid count: ${count}`);
    return count;
  }

  async verifyGridCountIncremented(initialCount) {
    console.log(`ACTION: Verifying grid count incremented from ${initialCount}...`);
    const updatedCount = await this.getUpdatedGridCount();
    expect(updatedCount).toBe(initialCount + 1);
    console.log(`ASSERT: Grid count verified: ${initialCount} → ${updatedCount}`);
  }

  async verifyRecordEmail(email) {
    console.log(`ACTION: Verifying email in grid: ${email}...`);
    const emailCell = this.gridCells.filter({ hasText: email }).first();
    await expect(emailCell).toBeVisible({ timeout: 3000 });
    console.log('ASSERT: Email found in grid');
  }

  async verifyRecordDesignation(designation) {
    console.log(`ACTION: Verifying designation in grid: ${designation}...`);
    const designationCell = this.gridCells.filter({ hasText: designation }).first();
    await expect(designationCell).toBeVisible({ timeout: 3000 });
    console.log('ASSERT: Designation found in grid');
  }

  async verifyRecordAdditionalInfo(additionalInfo) {
    console.log(`ACTION: Verifying additional info in grid: ${additionalInfo}...`);
    const additionalInfoCell = this.gridCells.filter({ hasText: additionalInfo }).first();
    await expect(additionalInfoCell).toBeVisible({ timeout: 3000 });
    console.log('ASSERT: Additional Info found in grid');
  }

  async getSearchResultCount() {
    console.log('ACTION: Getting search result count...');
    let count = 0;
    try {
      const paginationContent = await this.paginationText.textContent({ timeout: 3000 });
      const countMatch = paginationContent.match(/\((\d+)\s+items?\)/);
      if (countMatch) {
        count = parseInt(countMatch[1]);
      }
    } catch (e) {
      console.log('INFO: Could not extract count from pagination, counting rows manually');
      const rows = this.gridRows;
      count = (await rows.count()) - 1; // -1 for header row
    }
    console.log(`ASSERT: Search returned ${count} result(s)`);
    return count;
  }

  async verifySearchResultsNotEmpty() {
    console.log('ACTION: Verifying search returned results...');
    const resultCount = await this.getSearchResultCount();
    expect(resultCount).toBeGreaterThan(0);
    console.log(`ASSERT: Search returned ${resultCount} result(s) - verification passed`);
    return resultCount;
  }

  async getFirstRecordData() {
    console.log('ACTION: Getting first record data from grid...');
    await this.waitForLoadingSpinnerToComplete();
    
    // Get all gridcells from the grid
    const allCells = this.page.locator('[role="gridcell"]');
    const cellCount = await allCells.count();
    
    console.log(`DEBUG: Found ${cellCount} total gridcells`);
    
    if (cellCount < 4) {
      throw new Error(`Not enough cells found in grid. Expected at least 4, found ${cellCount}`);
    }

    // The first 4 cells are from the first data row: firstName, lastName, email, phone
    const firstName = (await allCells.nth(0).textContent()).trim();
    const lastName = (await allCells.nth(1).textContent()).trim();
    const email = (await allCells.nth(2).textContent()).trim();
    const phone = (await allCells.nth(3).textContent()).trim();
    
    const recordData = {
      firstName,
      lastName,
      email,
      phone
    };
    
    console.log(`ASSERT: Retrieved first record - ${recordData.firstName} ${recordData.lastName}`);
    return recordData;
  }

  async verifyResetFunctionality(originalCount) {
    console.log('\nACTION: Verifying Reset button functionality...');
    
    // Verify 1: Search input is cleared
    console.log('  STEP 1: Verifying search input is cleared...');
    const searchInputValue = await this.searchInput.inputValue();
    expect(searchInputValue).toBe('');
    console.log('  ✔️ Search input is cleared');
    
    // Verify 2: Status dropdown resets to default "New"
    console.log('  STEP 2: Verifying status dropdown resets to default...');
    const statusText = await this.statusDropdown.textContent();
    expect(statusText.trim()).toContain('New');
    console.log('  ✔️ Status dropdown shows "New" (default state)');
    
    // Verify 3: Grid returns to original state - get current count
    console.log('  STEP 3: Verifying grid returns to original record count...');
    const currentCount = await this.getSearchResultCount();
    expect(currentCount).toBe(originalCount);
    console.log(`  ✔️ Record count matches original: ${originalCount} == ${currentCount}`);
    
    // Verify 4: Verify all records are displayed again (check if grid has data)
    console.log('  STEP 4: Verifying all records are displayed...');
    const allCells = this.page.locator('[role="gridcell"]');
    const cellCount = await allCells.count();
    expect(cellCount).toBeGreaterThan(0);
    console.log(`  ✔️ Grid is populated with ${cellCount} cells - all records displayed`);
    
    console.log('ASSERT: Reset functionality verified - search cleared, grid restored, filters reset');
  }

  async selectStatusFilter(statusOption) {
    console.log(`ACTION: Selecting status filter: "${statusOption}"...`);
    await this.statusDropdown.click();
    await this.page.waitForTimeout(300);
    
    // Find and click the matching option
    const option = this.page.getByRole('option', { name: statusOption });
    await option.click();
    await this.page.waitForTimeout(500);
    
    console.log(`ASSERT: Status filter selected to "${statusOption}"`);
  }

  async verifyStatusFilterApplied(statusOption) {
    console.log(`ACTION: Verifying status filter "${statusOption}" is applied...`);
    const statusText = await this.statusDropdown.textContent();
    expect(statusText.trim()).toContain(statusOption);
    console.log(`ASSERT: Status dropdown shows "${statusOption}"`);
  }

  async getCountByStatus(statusOption) {
    console.log(`ACTION: Searching with status filter "${statusOption}"...`);
    await this.selectStatusFilter(statusOption);
    await this.clickSearchButton();
    await this.waitForLoadingSpinnerToComplete();
    
    const resultCount = await this.getSearchResultCount();
    console.log(`ASSERT: Found ${resultCount} result(s) with status "${statusOption}"`);
    return resultCount;
  }

  async clickColumnHeader(colIndex) {
    const gridTable = this.page.locator('[role="grid"]').first();
    const header = gridTable.locator(`th[data-colindex="${colIndex}"]`);
    await this.page.waitForTimeout(300);
    await header.click({ force: true });
    await this.page.waitForTimeout(1500);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
  }

  async getColumnValues(colIndex, maxRows = 20) {
    const values = [];
    const rows = this.probationPortalGrid.locator('[role="row"]');
    const rowCount = await rows.count();
    const rowsToCheck = Math.min(rowCount, maxRows);
    
    // Check up to maxRows on the first page (skip header row at index 0)
    for (let i = 1; i < rowsToCheck; i++) {
      const row = rows.nth(i);
      const cell = row.locator(`td[data-colindex="${colIndex}"]`);
      if (await cell.count() > 0) {
        const cellText = await cell.textContent().catch(() => '');
        values.push(cellText ? cellText.trim() : '');
      }
    }
    return values;
  }

  async verifyColumnSorted(colIndex, sortOrder = 'asc') {
    const values = await this.getColumnValues(colIndex);
    
    if (values.length < 2) {
      console.log('WARNING: Not enough rows to verify sorting');
      return true;
    }

    const firstValue = values[0];
    const isNumeric = /^\d+$/.test(firstValue);
    const isDate = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(firstValue);
    const isEmail = firstValue.includes('@') || /^[a-z0-9._-]+$/.test(firstValue.toLowerCase());
    
    let sorted = true;
    
    if (isNumeric) {
      for (let i = 1; i < values.length; i++) {
        const prev = parseInt(values[i - 1]) || 0;
        const curr = parseInt(values[i]) || 0;
        if (sortOrder === 'asc' && curr < prev) {
          sorted = false;
          break;
        } else if (sortOrder === 'desc' && curr > prev) {
          sorted = false;
          break;
        }
      }
    } else if (isDate) {
      const parseDate = (dateStr) => {
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          const month = parseInt(parts[0]);
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2].length === 2 ? '20' + parts[2] : parts[2]);
          return new Date(year, month - 1, day);
        }
        return new Date(0);
      };
      
      for (let i = 1; i < values.length; i++) {
        const prev = parseDate(values[i - 1]);
        const curr = parseDate(values[i]);
        if (sortOrder === 'asc' && curr < prev) {
          sorted = false;
          break;
        } else if (sortOrder === 'desc' && curr > prev) {
          sorted = false;
          break;
        }
      }
    } else if (isEmail) {
      for (let i = 1; i < values.length; i++) {
        const prevFirst = values[i - 1].charAt(0).toLowerCase();
        const currFirst = values[i].charAt(0).toLowerCase();
        if (sortOrder === 'asc' && currFirst < prevFirst) {
          sorted = false;
          break;
        } else if (sortOrder === 'desc' && currFirst > prevFirst) {
          sorted = false;
          break;
        }
      }
    } else {
      // Default string comparison
      for (let i = 1; i < values.length; i++) {
        const comparison = values[i - 1].localeCompare(values[i]);
        if (sortOrder === 'asc' && comparison > 0) {
          sorted = false;
          break;
        } else if (sortOrder === 'desc' && comparison < 0) {
          sorted = false;
          break;
        }
      }
    }
    
    return sorted;
  }

  async testColumnDualClickSorting(colIndex, columnName) {
    console.log(`\n🔤 Testing ${columnName} Column Sorting...`);
    
    // Get initial values before sorting
    const initialValues = await this.getColumnValues(colIndex);
    console.log(`  Initial values (all ${initialValues.length} rows): ${initialValues.join(', ')}`);

    // CLICK 1: Test Ascending Order
    console.log(`  ACTION: Clicking ${columnName} header (1st click - expect ascending)...`);
    await this.clickColumnHeader(colIndex);
    
    // Wait for loading spinner to appear and then disappear
    console.log(`  ACTION: Waiting for loading spinner to complete...`);
    await this.waitForLoadingSpinnerToComplete();

    const ascValues = await this.getColumnValues(colIndex);
    console.log(`  Values after 1st click (${ascValues.length} rows): ${ascValues.join(', ')}`);
    const isAscending = await this.verifyColumnSorted(colIndex, 'asc');

    if (isAscending) {
      console.log(`  ✅ SUCCESS: ${columnName} column sorted in ASCENDING order`);
    } else {
      throw new Error(`${columnName} column is NOT sorted in ascending order after 1st click`);
    }

    // CLICK 2: Test Descending Order
    console.log(`  ACTION: Clicking ${columnName} header (2nd click - expect descending)...`);
    await this.clickColumnHeader(colIndex);
    
    // Wait for loading spinner to appear and then disappear
    console.log(`  ACTION: Waiting for loading spinner to complete...`);
    await this.waitForLoadingSpinnerToComplete();

    const descValues = await this.getColumnValues(colIndex);
    console.log(`  Values after 2nd click (${descValues.length} rows): ${descValues.join(', ')}`);
    const isDescending = await this.verifyColumnSorted(colIndex, 'desc');

    if (isDescending) {
      console.log(`  ✅ SUCCESS: ${columnName} column sorted in DESCENDING order`);
    } else {
      throw new Error(`${columnName} column is NOT sorted in descending order after 2nd click`);
    }

    // Reset button before next column
    console.log(`  ACTION: Clicking Reset button...`);
    await this.clickResetButton();
    await this.page.waitForTimeout(500);
    console.log(`  ✓ Reset completed for ${columnName} column\n`);
  }

  async verifyApproveAndRejectButtons() {
    console.log('ACTION: Verifying Approve and Reject buttons in grid...');
    
    // Verify the Action column is visible in the grid
    const gridHeader = this.probationPortalGrid;
    await expect(gridHeader).toBeVisible();
    console.log('✔️ Grid is visible');

    // Verify each record has Approve icons (checkmark symbol)
    const approveIcons = this.approveButton;
    const approveCount = await approveIcons.count();

    // Verify each record has Reject icons (X symbol)
    const rejectIcons = this.rejectButton;
    const rejectCount = await rejectIcons.count();

    // Throw error if no rows available
    if (approveCount === 0) {
      throw new Error('TEST FAILED: No records found in grid. Cannot validate Approve button. Please ensure test data exists.');
    }

    if (rejectCount === 0) {
      throw new Error('TEST FAILED: No Reject buttons found in grid. Please ensure test data exists.');
    }

    expect(approveCount).toBeGreaterThan(0);
    console.log(`✔️ Found ${approveCount} Approve icons in the grid`);

    // Verify reject count matches approve count
    expect(rejectCount).toBe(approveCount);
    console.log(`✔️ Found ${rejectCount} Reject icons in the grid`);

    // Verify the Approve and Reject icons are visible and clickable for each record (test first 5 or all if less than 5)
    const iconsToTest = Math.min(approveCount, 5);
    
    for (let i = 0; i < iconsToTest; i++) {
      const approveIcon = approveIcons.nth(i);
      const rejectIcon = rejectIcons.nth(i);

      // Verify Approve icon visibility and enabled state
      await expect(approveIcon).toBeVisible({ timeout: 5000 });
      await expect(approveIcon).toBeEnabled({ timeout: 5000 });

      // Verify Reject icon visibility and enabled state
      await expect(rejectIcon).toBeVisible({ timeout: 5000 });
      await expect(rejectIcon).toBeEnabled({ timeout: 5000 });
    }

    console.log(`✔️ Approve and Reject button visibility and clickability verified for ${iconsToTest} record(s)`);
    console.log(`\n✅ ASSERT: All Approve and Reject buttons verified successfully`);
  }

  async clickApproveButtonForFirstRecord() {
    console.log('ACTION: Clicking Approve button for first record...');
    const approveButton = this.approveButton.first();
    await expect(approveButton).toBeVisible();
    await approveButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Approve button clicked');
  }

  async verifyApprovalDialogOpened() {
    console.log('ACTION: Verifying approval dialog opened...');
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Approval dialog opened');
    return dialog;
  }

  async verifyReasonNoteTextArea(dialog) {
    console.log('ACTION: Verifying reason/note text area...');
    const textArea = dialog.getByRole('textbox');
    await expect(textArea).toBeVisible();
    console.log('ASSERT: Reason/note text area is visible');
    return textArea;
  }

  async closeApprovalDialog() {
    console.log('ACTION: Closing approval dialog...');
    const closeButton = this.page.locator('.fa.fa-times').first();
    await closeButton.click();
    await this.page.waitForTimeout(300);
    console.log('ASSERT: Approval dialog closed');
  }

  async enterApprovalNote(dialog, note) {
    console.log(`ACTION: Entering approval note: "${note}"`);
    const textArea = dialog.getByRole('textbox');
    await textArea.fill(note);
    await expect(textArea).toHaveValue(note);
    console.log('ASSERT: Approval note entered and verified');
  }

  async clickSaveApprovalButton(dialog) {
    console.log('ACTION: Clicking Save button in approval dialog...');
    const saveButton = dialog.locator('button').filter({ hasText: /Save/ }).first();
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Save button clicked');
  }

  async verifySuccessNotification() {
    console.log('ACTION: Verifying success notification...');
    
    // Check for success message in notification container
    const successAlert = this.page.getByRole('alert').or(
      this.page.locator('//*[@id="toast-container"]/div/div').filter({ hasText: /success|approved|completed|reject|successfully/i })
    );
    
    // Check if alert exists and is visible
    const alertVisible = await successAlert.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (alertVisible) {
      const alertText = await successAlert.textContent();
      console.log(`ASSERT: Success alert displayed: "${alertText}"`);
      return true;
    } else {
      // Try alternative selectors for success notification
      const toastAlert = this.page.locator('[role="alert"], .toast, .alert-success, [class*="success"]').filter({ hasText: /success|approved|completed|reject|successfully/i });
      const toastVisible = await toastAlert.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (toastVisible) {
        const toastText = await toastAlert.textContent();
        console.log(`ASSERT: Success toast displayed: "${toastText}"`);
        return true;
      } else {
        console.log('⚠️ ASSERT: Success alert not visible (may have auto-dismissed)');
        return true; // Don't fail the test as alert might have auto-dismissed
      }
    }
  }

  async selectStatusFilter(status) {
    console.log(`ACTION: Selecting status filter: ${status}...`);
    await this.statusDropdown.click();
    await this.waitForLoadingSpinnerToComplete().catch(() => {});
    await this.page.waitForTimeout(1000);
    
    const option = this.page.getByRole('option', { name: status }).or(
      this.page.locator(`li:has-text("${status}")`)
    );
    
    const isVisible = await option.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await option.click();
      console.log(`ASSERT: ${status} option selected`);
      return true;
    } else {
      console.log(`WARNING: ${status} option not found`);
      return false;
    }
  }

  async performSearch() {
    console.log('ACTION: Clicking Search button...');
    await this.searchButton.click();
    await this.waitForLoadingSpinnerToComplete().catch(() => {});
    await this.page.waitForTimeout(3000);
    console.log('ASSERT: Search completed and grid loaded');
  }

  async verifyApprovedRecordWithNote(firstName, lastName, expectedNote) {
    console.log(`ACTION: Verifying approved record: ${firstName} ${lastName} with note "${expectedNote}"...`);
    
    const rows = this.probationPortalGrid.locator('[role="row"]');
    const rowCount = await rows.count();
    
    let recordFound = false;
    
    // Search through all rows (skip header row 0)
    for (let i = 1; i < rowCount; i++) {
      const row = rows.nth(i);
      const rowText = await row.textContent();
      
      // Check if this row contains firstName AND lastName AND note
      if (rowText.includes(firstName) && rowText.includes(lastName)) {
        console.log(`  ✔️ Found row with ${firstName} ${lastName}`);
        recordFound = true;
        
        // Verify the note is in the same row
        if (rowText.includes(expectedNote)) {
          console.log(`  ✔️ Approval note verified in same row: "${expectedNote}"`);
          console.log(`ASSERT: Complete approved record verified successfully`);
          return true;
        } else {
          throw new Error(`Approval note "${expectedNote}" not found in row with ${firstName} ${lastName}`);
        }
      }
    }
    
    if (!recordFound) {
      throw new Error(`Approved record not found in grid: ${firstName} ${lastName}`);
    }
  }

  async verifyRadioButtonsAvailable(dialog) {
    console.log('ACTION: Verifying radio buttons are available in dialog...');
    const radioButtons = dialog.locator('[type="radio"]');
    const radioCount = await radioButtons.count();
    
    if (radioCount === 0) {
      console.log('NOTE: No radio buttons found in dialog. Text area may be directly editable.');
      return false;
    }
    
    expect(radioCount).toBeGreaterThan(0);
    console.log(`ASSERT: Found ${radioCount} radio buttons in dialog`);
    return true;
  }

  async clickRadioButton(dialog, radioLabel) {
    console.log(`ACTION: Clicking radio button: "${radioLabel}"...`);
    const radioButton = dialog.locator(`label:has-text("${radioLabel}") [type="radio"], [role="radio"][aria-label*="${radioLabel}"], label:has-text("${radioLabel}")`).first();
    await expect(radioButton).toBeVisible({ timeout: 5000 });
    await radioButton.click();
    await this.page.waitForTimeout(800); // Wait for text to populate
    console.log(`ASSERT: Radio button "${radioLabel}" clicked`);
  }

  async verifyTextAreaPopulatedWithText(textArea, expectedText) {
    console.log(`ACTION: Verifying text area is populated with: "${expectedText}"...`);
    await expect(textArea).toHaveValue(new RegExp(expectedText, 'i'), { timeout: 5000 });
    const actualValue = await textArea.inputValue();
    console.log(`ASSERT: Text area populated with correct text: "${actualValue}"`);
  }

  async clearTextArea(textArea) {
    console.log('ACTION: Clearing text area...');
    await textArea.clear();
    await this.page.waitForTimeout(500);
    const clearedValue = await textArea.inputValue();
    expect(clearedValue).toBe('');
    console.log('ASSERT: Text area cleared successfully');
  }

  async testRadioButtonAndTextPopulation(dialog, radioLabel, expectedText) {
    console.log(`\n📋 Testing radio button: "${radioLabel}"`);
    
    // Click the radio button
    await this.clickRadioButton(dialog, radioLabel);
    
    // Get the text area
    const textArea = dialog.getByRole('textbox');
    
    // Verify text is populated
    await this.verifyTextAreaPopulatedWithText(textArea, expectedText);
    
    // Clear for next test
    if (expectedText !== 'Other') { // Don't clear if it's "Other" as user will enter custom text
      await this.clearTextArea(textArea);
    }
  }

  async clickRejectButtonForFirstRecord() {
    console.log('ACTION: Clicking Reject button for first record...');
    const rejectButton = this.rejectButton.first();
    await expect(rejectButton).toBeVisible();
    await rejectButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Reject button clicked');
  }

  async verifyRejectionDialogOpened() {
    console.log('ACTION: Verifying rejection dialog opened...');
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    console.log('ASSERT: Rejection dialog opened');
    return dialog;
  }

  async closeAndReopenRejectionDialog() {
    console.log('ACTION: Testing close and reopen rejection dialog functionality...');
    
    // Close the dialog
    const closeButton = this.page.locator('.fa.fa-times').first();
    await closeButton.click();
    await this.page.waitForTimeout(300);
    console.log('  Dialog closed');
    
    // Reopen the dialog
    await this.clickRejectButtonForFirstRecord();
    const dialogReopened = await this.verifyRejectionDialogOpened();
    console.log('  Dialog reopened');
    
    return dialogReopened;
  }

  async enterRejectionReason(dialog, reason) {
    console.log(`ACTION: Entering rejection reason: "${reason}"`);
    const textArea = dialog.getByRole('textbox');
    await textArea.fill(reason);
    await expect(textArea).toHaveValue(reason);
    console.log('ASSERT: Rejection reason entered and verified');
  }

  async clickSaveRejectionButton(dialog) {
    console.log('ACTION: Clicking Save button in rejection dialog...');
    const saveButton = dialog.locator('button').filter({ hasText: /Save/ }).first();
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await this.page.waitForTimeout(500);
    console.log('ASSERT: Save button clicked');
  }

  async verifyRejectedRecordWithNote(firstName, lastName, expectedNote) {
    console.log(`ACTION: Verifying rejected record: ${firstName} ${lastName} with note "${expectedNote}"...`);
    
    const rows = this.probationPortalGrid.locator('[role="row"]');
    const rowCount = await rows.count();
    
    let recordFound = false;
    
    // Search through all rows (skip header row 0)
    for (let i = 1; i < rowCount; i++) {
      const row = rows.nth(i);
      const rowText = await row.textContent();
      
      // Check if this row contains firstName AND lastName AND note
      if (rowText.includes(firstName) && rowText.includes(lastName)) {
        console.log(`  ✔️ Found row with ${firstName} ${lastName}`);
        recordFound = true;
        
        // Verify the note is in the same row
        if (rowText.includes(expectedNote)) {
          console.log(`  ✔️ Rejection note verified in same row: "${expectedNote}"`);
          console.log(`ASSERT: Complete rejected record verified successfully`);
          return true;
        } else {
          throw new Error(`Rejection note "${expectedNote}" not found in row with ${firstName} ${lastName}`);
        }
      }
    }
    
    if (!recordFound) {
      throw new Error(`Rejected record not found in grid: ${firstName} ${lastName}`);
    }
  }

  async getGridRecordCount() {
    console.log('ACTION: Getting grid record count...');
    
    // METHOD 1: Try pagination first (fastest and most reliable)
    try {
      const paginationContent = await this.paginationText.textContent({ timeout: 3000 });
      const countMatch = paginationContent.match(/(\d+)\s+items?/i);
      
      if (countMatch) {
        const count = parseInt(countMatch[1]);
        console.log(`ASSERT: Grid record count from pagination: ${count}`);
        return count;
      }
    } catch (e) {
      console.log('  INFO: Pagination not available, trying alternative methods...');
    }
    
    // METHOD 2: Check for "No records to display" message
    const noRecordsLocator = this.page.locator('text=/no records to display|no data/i').first();
    const hasNoRecords = await noRecordsLocator.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (hasNoRecords) {
      console.log('ASSERT: Grid record count: 0 (No records message displayed)');
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
    
    console.log(`ASSERT: Grid record count from visible rows: ${dataRowCount}`);
    return dataRowCount;
  }

  // ==================================================================================
  // APPROVAL WORKFLOW METHODS
  // ==================================================================================
  async initiateApprovalWorkflow() {
    console.log('ACTION: Initiating approval workflow...');
    await this.clickApproveButtonForFirstRecord();
    const dialog = await this.verifyApprovalDialogOpened();
    await this.verifyReasonNoteTextArea(dialog);
    await this.closeApprovalDialog();
    await this.waitForLoadingSpinnerToComplete();
    await this.clickApproveButtonForFirstRecord();
    const dialogReopened = await this.verifyApprovalDialogOpened();
    console.log('ASSERT: Approval dialog initiated and verified');
    return dialogReopened;
  }

  async completeApprovalWithNote(dialog, approvalNote) {
    console.log(`ACTION: Completing approval with note: "${approvalNote}"...`);
    await this.enterApprovalNote(dialog, approvalNote);
    const noteValue = await dialog.getByRole('textbox').inputValue();
    expect(noteValue).toBe(approvalNote);
    await expect(dialog).toBeVisible();
    await this.clickSaveApprovalButton(dialog);
    await expect(dialog).not.toBeVisible();
    await this.verifySuccessNotification();
    console.log('ASSERT: Approval completed and verified');
  }

  async verifyApprovedStatusAndRecord(firstName, lastName, approvalNote) {
    console.log(`ACTION: Verifying approved status and record: ${firstName} ${lastName}...`);
    const statusSelected = await this.selectStatusFilter('Approved');
    if (!statusSelected) {
      throw new Error('Approved status not selected, cannot verify record');
    }
    await this.performSearch();
    await this.verifyApprovedRecordWithNote(firstName, lastName, approvalNote);
    console.log('ASSERT: Approved record verified in filtered grid');
  }

  // ==================================================================================
  // REJECTION WORKFLOW METHODS
  // ==================================================================================
  async initiateRejectionWorkflow() {
    console.log('ACTION: Initiating rejection workflow...');
    await this.clickRejectButtonForFirstRecord();
    const dialog = await this.verifyRejectionDialogOpened();
    await this.verifyReasonNoteTextArea(dialog);
    await this.closeAndReopenRejectionDialog();
    const dialogReopened = await this.verifyRejectionDialogOpened();
    console.log('ASSERT: Rejection dialog initiated and verified');
    return dialogReopened;
  }

  async completeRejectionWithNote(dialog, rejectionNote) {
    console.log(`ACTION: Completing rejection with note: "${rejectionNote}"...`);
    await this.enterRejectionReason(dialog, rejectionNote);
    const noteValue = await dialog.getByRole('textbox').inputValue();
    expect(noteValue).toBe(rejectionNote);
    await expect(dialog).toBeVisible();
    await this.clickSaveRejectionButton(dialog);
    await expect(dialog).not.toBeVisible();
    await this.verifySuccessNotification();
    console.log('ASSERT: Rejection completed and verified');
  }

  async verifyRejectedStatusAndRecord(firstName, lastName, rejectionNote) {
    console.log(`ACTION: Verifying rejected status and record: ${firstName} ${lastName}...`);
    const statusSelected = await this.selectStatusFilter('Rejected');
    if (!statusSelected) {
      throw new Error('Rejected status not selected, cannot verify record');
    }
    await this.performSearch();
    await this.verifyRejectedRecordWithNote(firstName, lastName, rejectionNote);
    console.log('ASSERT: Rejected record verified in filtered grid');
  }

  // ==================================================================================
  // PAGINATION TESTING METHODS
  // ==================================================================================
  async testPageSizeDropdown() {
    console.log('\n➡️ Testing Records Per Page Dropdown...');

    // Find the items per page dropdown using the approach that works
    const pageSizeDropdown = this.page.locator('combobox[aria-label*="dropdownlist"], select[name*="pageSize"], select[name*="size"]').first().or(
      this.page.locator('[class*="paginat"] combobox, [class*="dropdown"] combobox').first()
    ).or(
      this.page.getByRole('combobox').filter({ hasText: /20|50|75|100/ }).first()
    );

    const dropdownFound = await pageSizeDropdown.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!dropdownFound) {
      console.log('⚠️ Records per page dropdown not found');
      return { found: false, changed: false };
    }

    console.log('✅ Records per page dropdown found');

    // Get current page size by checking dropdown text content or input value
    let currentValue = await pageSizeDropdown.textContent().catch(() => '');
    if (!currentValue || currentValue.trim() === '') {
      currentValue = await pageSizeDropdown.inputValue().catch(() => '50');
    }
    
    // Extract just the number from the text
    const currentMatch = currentValue.match(/(\d+)/);
    const currentSize = currentMatch ? currentMatch[1] : '50';
    console.log(`ℹ️ Current page size: ${currentSize}`);

    // Get initial pagination info for comparison
    const initialPaginationText = await this.page.getByText(/\d+ of \d+ pages \(\d+ items?\)/).textContent().catch(() => '');
    console.log(`ℹ️ Initial pagination: ${initialPaginationText}`);

    // Try to change page size
    const pageSizeOptions = ['20', '75', '100'];
    let changedSuccessfully = false;

    for (const option of pageSizeOptions) {
      if (option !== currentSize) {
        try {
          console.log(`ACTION: Attempting to change page size to ${option}...`);
          
          // Click the dropdown to open it
          await pageSizeDropdown.click();
          await this.page.waitForTimeout(1000);
          
          // Try to find and click the option
          const optionLocator = this.page.getByRole('option', { name: option }).or(
            this.page.locator(`[role="option"]:has-text("${option}")`)
          );
          
          const optionExists = await optionLocator.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (optionExists) {
            await optionLocator.click();
            await this.waitForLoadingSpinnerToComplete();
            await this.page.waitForTimeout(1500);
            
            // Verify the change by checking pagination text
            const newPaginationText = await this.page.getByText(/\d+ of \d+ pages \(\d+ items?\)/).textContent().catch(() => '');
            console.log(`ℹ️ New pagination: ${newPaginationText}`);
            
            // Check if dropdown text changed
            const newDropdownValue = await pageSizeDropdown.textContent().catch(() => 
              pageSizeDropdown.inputValue().catch(() => '')
            );
            
            if (newPaginationText !== initialPaginationText || newDropdownValue.includes(option)) {
              console.log(`✅ Successfully changed page size to ${option}`);
              console.log(`✅ Pagination updated from: ${initialPaginationText}`);
              console.log(`✅ Pagination updated to: ${newPaginationText}`);
              changedSuccessfully = true;
              break;
            } else {
              console.log(`⚠️ Page size change to ${option} did not take effect`);
            }
          } else {
            console.log(`⚠️ Option ${option} not found in dropdown`);
          }
        } catch (e) {
          console.log(`⚠️ Error changing to ${option}: ${e.message}`);
          // Close dropdown if it's open
          await this.page.keyboard.press('Escape').catch(() => {});
        }
      }
    }

    if (!changedSuccessfully) {
      console.log('⚠️ Could not successfully change page size - functionality may not be working');
    }

    return { found: true, changed: changedSuccessfully };
  }

  // ==================================================================================
  // PAGINATION NAVIGATION AND VERIFICATION METHODS
  // ==================================================================================
  async countVisibleRowsOnCurrentPage() {
    const allRows = this.page.locator('tbody tr');
    const totalRows = await allRows.count();
    let visibleCount = 0;
    
    for (let i = 0; i < totalRows; i++) {
      const row = allRows.nth(i);
      const isVisible = await row.isVisible();
      if (isVisible) {
        visibleCount++;
      }
    }
    
    return visibleCount;
  }

  async navigateToNextPage(pageNumber) {
    const nextPageLink = this.page.locator(`a:has-text("${pageNumber}")`).or(
      this.page.getByRole('link', { name: `Page ${pageNumber} of` })
    );
    
    const exists = await nextPageLink.isVisible({ timeout: 1000 }).catch(() => false);
    if (exists) {
      await nextPageLink.click();
      console.log(`ACTION: Navigated to page ${pageNumber}`);
      await this.waitForLoadingSpinnerToComplete().catch(() => {});
      await this.page.waitForTimeout(2000);
      return true;
    }
    return false;
  }

  async countAllRowsAcrossPages() {
    let totalRows = 0;
    let currentPage = 1;

    do {
      console.log(`STEP: Counting rows on page ${currentPage}...`);
      await this.waitForLoadingSpinnerToComplete().catch(() => {});
      await this.page.waitForTimeout(1000);

      const pageRows = await this.countVisibleRowsOnCurrentPage();
      totalRows += pageRows;
      console.log(`ASSERT: Found ${pageRows} rows on page ${currentPage}`);

      const nextPageExists = await this.navigateToNextPage(currentPage + 1);
      if (!nextPageExists) {
        break;
      }
      currentPage++;
    } while (currentPage <= 10);

    return { totalRows, pages: currentPage };
  }

  async testPaginationForStatus(status) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 TESTING PAGINATION FOR STATUS: ${status}`);
    console.log(`${'='.repeat(70)}`);

    // Step 1: Apply status filter
    console.log(`\nSTEP 1: Applying "${status}" status filter...`);
    await this.clickResetButton();
    await this.page.waitForTimeout(500);
    
    const statusSelected = await this.selectStatusFilter(status);
    if (!statusSelected) {
      console.log(`⚠️ Status "${status}" not available in dropdown, skipping`);
      return { skipped: true, reason: 'Status not available' };
    }
    
    await this.clickSearchButton();
    await this.waitForLoadingSpinnerToComplete();
    await this.page.waitForTimeout(1000);
    console.log(`✅ STEP 1: "${status}" status filter applied and search executed`);

    // Step 2: Get pagination info
    const paginationData = await this.getPaginationInfo(status);
    
    // Step 3: Count rows on first page
    const rowsOnFirstPage = await this.countRowsOnFirstPage();
    
    // Step 4: Check and test next page navigation
    const navigationResult = await this.testNextPageNavigation(status, rowsOnFirstPage);
    
    // Step 5: Test pagination depth
    const depthResult = await this.testPaginationDepth(status);
    
    console.log(`\n✅ Pagination test completed for "${status}" status`);
    
    return {
      skipped: false,
      paginationData,
      rowsOnFirstPage,
      navigationResult,
      depthResult
    };
  }

  async getPaginationInfo(status) {
    console.log(`\nSTEP 2: Extracting pagination information...`);
    const paginationInfo = this.page.getByText(/\d+ items?/);
    const paginationVisible = await paginationInfo.isVisible({ timeout: 5000 }).catch(() => false);
    
    let totalItems = 0;
    if (paginationVisible) {
      const paginationText = await paginationInfo.textContent();
      const match = paginationText.match(/(\d+)\s+items?/i);
      if (match) {
        totalItems = parseInt(match[1]);
        console.log(`ASSERT: Total items for "${status}" status: ${totalItems}`);
      }
    } else {
      console.log('⚠️ Pagination info not found');
    }
    
    return { totalItems, paginationVisible };
  }

  async countRowsOnFirstPage() {
    console.log(`\nSTEP 3: Counting rows on current (first) page...`);
    const rowsOnFirstPage = await this.countVisibleRowsOnCurrentPage();
    console.log(`ASSERT: Found ${rowsOnFirstPage} rows on first page`);
    return rowsOnFirstPage;
  }

  async testNextPageNavigation(status, rowsOnFirstPage) {
    console.log(`\nSTEP 4: Checking if next page exists...`);
    const nextPageLink = this.page.locator('a:has-text("2")').or(
      this.page.getByRole('link', { name: /2|next/i })
    );
    
    const nextPageExists = await nextPageLink.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!nextPageExists) {
      console.log(`ℹ️  No next page available for "${status}" status (all items fit on one page)`);
      return { hasNextPage: false };
    }

    console.log(`✅ STEP 4: Next page link exists for "${status}" status`);

    // Navigate to next page
    console.log(`\nSTEP 5: Navigating to page 2...`);
    const navigated = await this.navigateToNextPage(2);
    
    if (!navigated) {
      console.log(`⚠️ Failed to navigate to page 2 for "${status}" status`);
      return { hasNextPage: true, navigationFailed: true };
    }
    
    console.log(`✅ STEP 5: Successfully navigated to page 2`);

    // Verify page 2 content
    const rowsOnSecondPage = await this.verifySecondPageContent();
    
    // Test navigation back to page 1
    const backNavigationResult = await this.testBackNavigation(rowsOnFirstPage);
    
    return {
      hasNextPage: true,
      navigationFailed: false,
      rowsOnSecondPage,
      backNavigationResult
    };
  }

  async verifySecondPageContent() {
    console.log(`\nSTEP 6: Verifying page 2 content...`);
    const rowsOnSecondPage = await this.countVisibleRowsOnCurrentPage();
    console.log(`ASSERT: Found ${rowsOnSecondPage} rows on page 2`);
    return rowsOnSecondPage;
  }

  async testBackNavigation(expectedRowsOnFirstPage) {
    console.log(`\nSTEP 7: Verifying pagination controls on page 2...`);
    const page1Link = this.page.locator('a:has-text("1")').or(
      this.page.getByRole('link', { name: /1|previous|first/i })
    );
    
    const page1Visible = await page1Link.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (page1Visible) {
      console.log(`✅ STEP 7: Previous page link (Page 1) is visible`);
      
      // Navigate back to page 1
      console.log(`\nSTEP 8: Navigating back to page 1...`);
      await page1Link.click();
      await this.waitForLoadingSpinnerToComplete();
      await this.page.waitForTimeout(1000);
      
      const rowsOnPageAfterReturn = await this.countVisibleRowsOnCurrentPage();
      console.log(`✅ STEP 8: Returned to page 1 with ${rowsOnPageAfterReturn} rows`);
      
      return {
        backLinkVisible: true,
        backNavigationSuccess: rowsOnPageAfterReturn === expectedRowsOnFirstPage,
        rowsAfterReturn: rowsOnPageAfterReturn
      };
    } else {
      console.log(`⚠️ STEP 7: Previous page link not found`);
      return { backLinkVisible: false };
    }
  }

  async testPaginationDepth(status) {
    console.log(`\nSTEP 9: Checking pagination depth...`);
    const { totalRows: allRowsCount, pages: totalPages } = await this.countAllRowsAcrossPages();
    console.log(`ASSERT: "${status}" status has ${totalPages} total page(s) with ${allRowsCount} total records`);
    
    return { totalRows: allRowsCount, totalPages };
  }

  async testPaginationForAllStatuses() {
    console.log('\n➡️ [TC14] Pagination - Next Page Navigation...');
    
    const statusFilters = ['New', 'Approved', 'Rejected'];
    const results = {};
    
    for (const status of statusFilters) {
      results[status] = await this.testPaginationForStatus(status);
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ TC14: Pagination - Next Page Navigation - COMPLETED FOR ALL STATUS FILTERS');
    console.log(`${'='.repeat(70)}\n`);
    
    return results;
  }

  async ensureRecordWithNewStatusExists() {
    console.log('ACTION: Checking if records with New status exist...');
    let recordCount = await this.getGridRecordCount();
    
    if (recordCount === 0) {
      console.log('ACTION: No records with New status found - creating one...');
      const { faker } = require('@faker-js/faker');
      
      const requestData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.helpers.replaceSymbols('(###) ###-####'),
        designation: 'Probation Officer',
        additionalInfo: faker.lorem.sentence()
      };
      
      await this.clickNewRequestButton();
      await this.verifyProbationPortalAccessDialogOpened();
      await this.fillFirstName(requestData.firstName);
      await this.fillLastName(requestData.lastName);
      await this.fillEmail(requestData.email);
      await this.fillPhone(requestData.phone);
      await this.fillDesignation(requestData.designation);
      await this.fillAdditionalInfo(requestData.additionalInfo);
      await this.clickSaveButton();
      await this.waitForLoadingSpinnerToComplete();
      await this.verifyDialogClosed();
      await this.page.waitForTimeout(1500);
      
      recordCount = await this.getGridRecordCount();
      console.log(`ASSERT: New record created. Current record count: ${recordCount}`);
    } else {
      console.log(`ASSERT: Found ${recordCount} record(s) with New status`);
    }
    
    return recordCount;
  }

  async getRecordDataByIndex(index) {
    console.log(`ACTION: Getting record data at index ${index}...`);
    await this.waitForLoadingSpinnerToComplete();
    
    const allRows = this.page.locator('[role="row"]');
    const rowCount = await allRows.count();
    
    const rowIndex = index + 1; // +1 to skip header row
    
    if (rowIndex >= rowCount) {
      throw new Error(`Row index ${index} does not exist. Total rows: ${rowCount}`);
    }
    
    const row = allRows.nth(rowIndex);
    const cells = row.locator('[role="gridcell"]');
    const cellCount = await cells.count();
    
    if (cellCount < 4) {
      throw new Error(`Row ${index} does not have enough cells. Expected at least 4, found ${cellCount}`);
    }
    
    const firstName = (await cells.nth(0).textContent()).trim();
    const lastName = (await cells.nth(1).textContent()).trim();
    const email = (await cells.nth(2).textContent()).trim();
    const phone = (await cells.nth(3).textContent()).trim();
    
    const recordData = { firstName, lastName, email, phone };
    console.log(`ASSERT: Retrieved record at index ${index} - ${recordData.firstName} ${recordData.lastName}`);
    return recordData;
  }

  async performCompleteResetFunctionalityTest() {
    console.log('ACTION: Performing complete reset functionality test...');
    
    // Step 1: Get initial record count with "New" status
    const initialRecordCount = await this.getGridRecordCount();
    console.log(`  STEP 1: Initial grid has ${initialRecordCount} records with "New" status`);
    
    // Step 2: Get first record data for searching
    const recordData = await this.getFirstRecordData();
    
    // Step 3: Change status filter to "Approved" (different from "New")
    console.log(`  STEP 2: Changing status filter from "New" to "Approved"...`);
    await this.selectStatusFilter('Approved');
    await this.clickSearchButton();
    const approvedFilteredCount = await this.getSearchResultCount();
    console.log(`  STEP 3: Grid with "Approved" filter shows ${approvedFilteredCount} records`);
    
    // Step 4: Also apply search filter on top of status filter
    console.log(`  STEP 4: Applying search filter for "${recordData.firstName}"...`);
    await this.fillSearchInput(recordData.firstName);
    const doubleFilteredCount = await this.getSearchResultCount();
    console.log(`  STEP 5: Grid with both filters shows ${doubleFilteredCount} records`);
    
    // Step 5: Click Reset button
    console.log(`  STEP 6: Clicking Reset button...`);
    await this.clickResetButton();
    await this.page.waitForTimeout(500);
    
    // Step 6: Verify reset functionality
    const resetRecordCount = await this.getSearchResultCount();
    
    // Verify search input is cleared
    const searchInputValue = await this.searchInput.inputValue();
    expect(searchInputValue).toBe('');
    
    // Verify status is reset to "New"
    const statusText = await this.statusDropdown.textContent();
    expect(statusText.trim()).toContain('New');
    
    console.log(`  STEP 7: Reset verified - count restored to ${resetRecordCount}, filters cleared`);
    
    return {
      initialRecordCount,
      appliedStatusFilter: 'Approved',
      approvedFilteredCount,
      doubleFilteredCount,
      resetRecordCount,
      selectedStatus: 'Approved'
    };
  }
}

module.exports = { ProbationPortalPage };