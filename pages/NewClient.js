// pages/NewClient.js
const { expect } = require('@playwright/test');

class NewClientPage {
  constructor(page) {
    this.page = page;
    // Widget & Section
    this.widget = page.locator('p', { hasText: /New Client Referrals To Be Called/i });
    this.sectionTitle = page.getByRole('heading', { name: /New Client Referrals To Be Called/i });
    this.grid = page.getByRole('grid').last();
    // Headers
    this.firstNameHeader = page.getByRole('columnheader', { name: 'First Name' });
    this.lastNameHeader = page.getByRole('columnheader', { name: 'Last Name' });
    this.phoneNumberHeader = page.getByRole('columnheader', { name: 'Phone Number' });
    this.emailHeader = page.getByRole('columnheader', { name: 'Email' });
    this.reasonHeader = page.getByRole('columnheader', { name: 'Reason For Referral' });
    this.statusHeader = page.getByRole('columnheader', { name: 'Status' });
    this.actionHeader = page.getByRole('columnheader', { name: 'Action' });
    // Pagination
    this.paginationInfo = page.getByText(/\d+ of \d+ pages \(\d+ items?\)/);
    this.itemsPerPageLabel = page.getByText('Items per page');
    this.itemsPerPageDropdown = page.getByRole('combobox', { name: '50' });
    // Modal & Controls
    this.addNoteModal = page.getByRole('dialog').first();
    this.addNoteModalTitle = page.getByRole('heading', { name: 'Add Note' });
    this.addNoteTextbox = page.getByRole('dialog').getByRole('textbox');
    this.statusDropdown = page.getByRole('dialog').locator('.e-ddl').first();
    this.saveButton = page.getByRole('button', { name: ' Save' });
    this.cancelButton = page.getByRole('button', { name: ' Cancel' });
    this.modalCloseIcon = page.locator('i.fa.fa-times.fa-lg');
    this.successAlert = page.getByRole('alert').first();
    // Status Options
    this.statusOptionNew = page.getByRole('option', { name: 'New' });
    this.statusOptionPending = page.getByRole('option', { name: 'Pending- Attempted To Contact Client' });
    this.statusOptionAppointmentScheduled = page.getByRole('option', { name: 'Completed-Appointment Scheduled' });
    this.statusOptionNonResponsive = page.getByRole('option', { name: 'Completed-Non Responsive Client' });
    this.statusOptionRejected = page.getByRole('option', { name: 'Rejected' });
    // MFA
    this.skipMfaButton = page.getByRole('button', { name: ' Skip' });
  }

  async skipMfa() {
    await this.skipMfaButton.click();
  }

  async isWidgetAvailable() {
    return await this.widget.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async getWidgetCount() {
    const widgetParagraph = this.page.locator('p').filter({ hasText: 'New Client Referrals To Be Called' });
    await widgetParagraph.waitFor({ state: 'visible' });
    const widgetContainer = widgetParagraph.locator('xpath=../..');
    const countHeading = widgetContainer.locator('h5');
    const countText = (await countHeading.textContent())?.trim() || '';
    const match = countText.match(/\d+/);
    return parseInt(match ? match[0] : '0', 10);
  }

  async clickWidget() {
    await this.widget.click();
  }

  async waitForGridStable() {
    const loader = this.page.locator('[class*="loader"], [class*="spinner"], .e-spinner');
    await loader.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await this.sectionTitle.waitFor({ state: 'visible' });
    await this.grid.waitFor({ state: 'visible' });
    await this.paginationInfo.waitFor({ state: 'visible' }).catch(() => {});
  }

  async getGridRowCount() {
    const rows = this.grid.getByRole('row');
    const total = await rows.count();
    return Math.max(0, total - 1);
  }

  async getGridRowCountWithRetry(expectedCount, retries = 3, delay = 500) {
    for (let i = 0; i < retries; i++) {
      await this.waitForGridStable();
      const rows = this.grid.getByRole('row');
      const total = await rows.count();
      const dataRows = Math.max(0, total - 1);
      if (expectedCount === undefined || dataRows === expectedCount) {
        return dataRows;
      }
      await this.page.waitForTimeout(delay);
    }
    const rows = this.grid.getByRole('row');
    const total = await rows.count();
    return Math.max(0, total - 1);
  }

  async getDataRowCount() {
    const rows = this.grid.getByRole('row');
    const totalRows = await rows.count();
    return totalRows - 1;
  }

  getRowCompleteButton(rowIndex) {
    const row = this.grid.getByRole('row').nth(rowIndex + 1);
    return row.getByTitle('Complete');
  }

  getRowRejectButton(rowIndex) {
    const row = this.grid.getByRole('row').nth(rowIndex + 1);
    return row.getByTitle('Reject');
  }

  async getRowEmail(rowIndex) {
    const row = this.grid.getByRole('row').nth(rowIndex + 1);
    const emailCell = row.getByRole('gridcell').nth(3);
    return (await emailCell.textContent())?.trim() || '';
  }

  async getRowFirstName(rowIndex) {
    const row = this.grid.getByRole('row').nth(rowIndex + 1);
    const firstNameCell = row.getByRole('gridcell').nth(0);
    return (await firstNameCell.textContent())?.trim() || '';
  }

  async findRowIndexByEmailAndFirstName(email, firstName) {
    const rows = this.grid.getByRole('row');
    const totalRows = await rows.count();
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      const cells = row.getByRole('gridcell');
      const rowFirstName = (await cells.nth(0).textContent())?.trim() || '';
      const rowEmail = (await cells.nth(3).textContent())?.trim() || '';
      if (rowFirstName === firstName && rowEmail === email) {
        return i - 1;
      }
    }
    return -1;
  }

  async openReferralsAndClickComplete() {
    await this.clickWidget();
    await this.sectionTitle.waitFor({ state: 'visible' });
    await this.getRowCompleteButton(0).click();
    await this.addNoteModalTitle.waitFor({ state: 'visible' });
  }

  async enterNote(noteText) {
    await this.addNoteTextbox.fill(noteText);
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async clickCloseIcon() {
    await this.modalCloseIcon.click();
  }

  async waitForModalClosed() {
    await this.addNoteModal.waitFor({ state: 'hidden' });
  }

  async waitForSuccessAlert() {
    await this.successAlert.waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickStatusDropdown() {
    await this.statusDropdown.click();
  }

  async selectStatus(statusName) {
    await this.statusDropdown.click();
    await this.page.waitForSelector('.e-popup-open .e-list-item', { timeout: 3000 });
    const options = this.page.locator('.e-popup-open .e-list-item');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text && text.trim() === statusName) {
        await options.nth(i).click();
        break;
      }
    }
    await this.page.waitForTimeout(500);
  }

  async getSelectedStatus() {
    const statusInput = this.statusDropdown.locator('input');
    return (await statusInput.inputValue())?.trim() || '';
  }
}

module.exports = { NewClientPage };
