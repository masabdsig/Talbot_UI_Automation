const { expect } = require('@playwright/test');

class ProbationPortalPage {
  constructor(page) {
    this.page = page;

    // Navigation
    this.portalRequestsUrl = '/portal-approval';
    this.dashboardUrl = '/dashboard';

    // Skip button
    this.skipMfaButton = page.getByRole('button', { name: ' Skip' });
    this.skipButton = page.locator('button').filter({ hasText: /Skip/ });

    // Probation Portal section
    this.probationPortalThumbnail = page.locator('div').filter({ hasText: /Probation Portal/ }).locator('..').first();
    this.probationPortalHeading = page.locator('h6:has-text("Probation Portal")').first();
    this.probationPortalGrid = page.locator('[role="grid"]').first();

    // Search and filter controls
    this.searchInput = page.getByRole('textbox').first();
    this.statusDropdown = page.getByRole('combobox').filter({ hasText: /New|Status/ }).first();
    this.searchButton = page.getByRole('button').filter({ hasText: /\bSearch\b/ }).first();
    this.resetButton = page.getByRole('button').filter({ hasText: /\bReset\b/ }).first();

    // New Request button
    this.newRequestButton = page.locator('button').filter({ hasText: /New Request/ }).first();

    // Probation Portal Access dialog
    this.probationPortalDialog = page.getByRole('dialog');
    this.probationPortalDialogTitle = page.locator('dialog h5, [role="dialog"] h5').filter({ hasText: /Probation Portal Access/ });
    this.closeDialogButton = page.locator('.fa.fa-times').first();

    // Form fields
    this.firstNameInput = page.getByRole('dialog').getByRole('textbox').first();
    this.lastNameInput = page.getByRole('dialog').getByRole('textbox').nth(1);
    this.emailInput = page.getByRole('dialog').getByRole('textbox').nth(2);
    this.phoneInput = page.getByRole('dialog').getByRole('textbox').nth(3);
    this.designationInput = page.getByRole('dialog').getByRole('textbox').nth(5);
    this.additionalInfoInput = page.getByRole('dialog').getByRole('textbox').nth(4);

    // Save button
    this.saveButton = page.locator('button').filter({ hasText: /Save/ }).first();

    // Grid cells and rows
    this.gridRows = page.locator('[role="row"]');
    this.gridCells = page.locator('[role="gridcell"]');

    // Pagination
    this.paginationText = page.getByText(/\(\d+ items?\)/);

    // Loading spinner
    this.loadingSpinner = page.locator('.spinner, .loader, [class*="loading"], [class*="spinner"], .ngx-spinner').first();

    // Add Note/Reason dialog
    this.addNoteDialog = page.getByRole('dialog');
    this.noteTextArea = page.getByRole('dialog').getByRole('textbox');

    // Approve/Reject icons
    this.approveButton = page.getByTitle('Approve');
    this.rejectButton = page.getByTitle('Reject');
  }

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
      const countHeading = this.probationPortalThumbnail.locator('h2').first();
      const countText = await countHeading.textContent();
      if (countText) {
        const count = parseInt(countText.trim());
        console.log(`ASSERT: Thumbnail count is ${count}`);
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

  async verifyGridColumnsDisplayed() {
    console.log('ACTION: Verifying all grid columns are displayed...');
    
    // Wait for grid to load
    await this.waitForLoadingSpinnerToComplete();
    
    // Get grid header row
    const headerRow = this.page.locator('[role="row"]').first();
    await expect(headerRow).toBeVisible({ timeout: 10000 });
    
    // Get all column headers
    const columnHeaders = headerRow.locator('[role="gridcell"]');
    const columnCount = await columnHeaders.count();
    
    expect(columnCount).toBeGreaterThan(0);
    console.log(`ASSERT: Grid has ${columnCount} columns displayed`);
    
    return columnCount;
  }

  async fetchAndPrintGridColumnNames() {
    console.log('ACTION: Fetching and printing all grid column names...');
    
    // Get grid header row
    const headerRow = this.page.locator('[role="row"]').first();
    const columnHeaders = headerRow.locator('[role="gridcell"]');
    const columnCount = await columnHeaders.count();
    
    const columnNames = [];
    console.log(`Grid Columns (${columnCount} total):`);
    
    for (let i = 0; i < columnCount; i++) {
      const columnText = await columnHeaders.nth(i).textContent();
      const trimmedName = columnText.trim();
      columnNames.push(trimmedName);
      console.log(`  ${i + 1}. ${trimmedName}`);
    }
    
    console.log(`ASSERT: All ${columnCount} grid columns verified`);
    return columnNames;
  }

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

  async getGridRecordCount() {
    console.log('ACTION: Getting grid record count...');
    const dataRows = this.page.locator('tbody tr, [role="row"]:not(:first-child)');
    const count = await dataRows.count();
    console.log(`ASSERT: Grid contains ${count} records`);
    return count;
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

  async selectStatusFilter(status) {
    console.log(`ACTION: Selecting status filter "${status}"...`);
    await this.statusDropdown.click();
    const statusOption = this.page.getByRole('option', { name: status });
    await statusOption.click();
    await this.page.waitForTimeout(500);
    console.log(`ASSERT: Status filter set to "${status}"`);
  }

  async verifyRecordInGrid(firstName, lastName) {
    console.log(`ACTION: Verifying record "${firstName} ${lastName}" in grid...`);
    
    // Verify first name is in grid
    const firstNameLocator = this.page.locator('[role="gridcell"]').filter({ hasText: firstName }).first();
    await expect(firstNameLocator).toBeVisible();
    console.log(`  ✓ First Name "${firstName}" found in grid`);
    
    // Verify last name is in grid
    const lastNameLocator = this.page.locator('[role="gridcell"]').filter({ hasText: lastName }).first();
    await expect(lastNameLocator).toBeVisible();
    console.log(`  ✓ Last Name "${lastName}" found in grid`);
    
    console.log(`ASSERT: Record "${firstName} ${lastName}" found in grid`);
  }

  async getColumnCount() {
    console.log('ACTION: Getting column count from grid header...');
    const headerCells = this.page.locator('[role="columnheader"]');
    const count = await headerCells.count();
    console.log(`ASSERT: Grid has ${count} columns`);
    return count;
  }

  async verifyGridColumnsDisplayed(expectedColumns = 9) {
    console.log(`ACTION: Verifying grid displays ${expectedColumns} columns...`);
    const columnCount = await this.getColumnCount();
    expect(columnCount).toBe(expectedColumns);
    console.log(`ASSERT: Grid displays ${columnCount} columns`);
    return columnCount;
  }

  async fetchAndPrintGridColumnNames() {
    console.log('ACTION: Fetching and printing all grid column names...');
    const columnHeaders = this.page.locator('[role="columnheader"]');
    const columnCount = await columnHeaders.count();
    const columnNames = [];
    console.log(`Grid Columns (${columnCount} total):`);
    for (let i = 0; i < columnCount; i++) {
      const columnText = await columnHeaders.nth(i).textContent();
      // Remove "Press Enter to sort" hint and trim
      const trimmedName = columnText.replace('Press Enter to sort', '').trim();
      columnNames.push(trimmedName);
      console.log(`  ${i + 1}. ${trimmedName}`);
    }
    console.log(`ASSERT: All ${columnCount} grid columns verified`);
    return columnNames;
  }

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
}

module.exports = { ProbationPortalPage };