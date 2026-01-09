import { test, expect } from '@playwright/test';
const { NewClientPage } = require('../pages/NewClient');
const { BasicTables } = require('../pages/basictables');

test.use({ storageState: 'authState.json' });

test.describe('New Client Referrals To Be Called (Refactored)', () => {
  let newClient;

  test.beforeEach(async ({ page }) => {
    newClient = new NewClientPage(page);
    await page.goto('/dashboard');
    const skipMfaVisible = await newClient.skipMfaButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (skipMfaVisible) {
      await newClient.skipMfa();
      console.log('✔️ MFA skipped');
    }
    const available = await newClient.isWidgetAvailable();
    if (!available) {
      test.skip('No New Client Referrals available in the system - widget not visible on dashboard. Tests skipped.');
    }
  });

  test('TC01: Widget Count and Grid Match', async () => {
    await expect(newClient.widget).toBeVisible();
    const widgetCount = await newClient.getWidgetCount();
    expect(typeof widgetCount).toBe('number');
    expect(widgetCount).toBeGreaterThanOrEqual(0);
    await newClient.clickWidget();
    // Wait for at least one data row to be visible 
    const firstDataRow = newClient.grid.getByRole('row').nth(1);
    await firstDataRow.waitFor({ state: 'visible', timeout: 5000 });
    await newClient.waitForGridStable();
    const gridRowCount = await newClient.getGridRowCountWithRetry(widgetCount);
    if (widgetCount > 0) {
      expect(gridRowCount).toBeGreaterThan(0);
    }
    expect(gridRowCount).toBe(widgetCount);
    console.log(`Widget count: ${widgetCount}, Grid row count: ${gridRowCount}`);
  });

  test('TC02: Verify List Display, Pagination and Row Selection', async () => {
    await newClient.clickWidget();
    await newClient.waitForGridStable();
    await expect(newClient.sectionTitle).toBeVisible();
    await expect(newClient.firstNameHeader).toBeVisible();
    await expect(newClient.lastNameHeader).toBeVisible();
    await expect(newClient.phoneNumberHeader).toBeVisible();
    await expect(newClient.emailHeader).toBeVisible();
    await expect(newClient.reasonHeader).toBeVisible();
    await expect(newClient.statusHeader).toBeVisible();
    await expect(newClient.actionHeader).toBeVisible();
    await expect(newClient.paginationInfo).toBeVisible();
    await expect(newClient.itemsPerPageLabel).toBeVisible();
    await expect(newClient.itemsPerPageDropdown).toBeVisible();
    const rowCount = await newClient.getDataRowCount();
    // Verify all rows have Complete and Reject buttons
    for (let i = 0; i < rowCount; i++) {
      await expect(newClient.getRowCompleteButton(i)).toBeVisible();
      await expect(newClient.getRowRejectButton(i)).toBeVisible();
    }
  });

  test('TC03: Verify Modal and Status Options', async () => {
    await newClient.openReferralsAndClickComplete();
    await expect(newClient.addNoteTextbox).toBeVisible();
    await expect(newClient.statusDropdown).toBeVisible();
    await expect(newClient.saveButton).toBeVisible();
    await expect(newClient.cancelButton).toBeVisible();
    await expect(newClient.modalCloseIcon).toBeVisible();
    await newClient.clickStatusDropdown();
    await expect(newClient.statusOptionNew).toBeVisible();
    await expect(newClient.statusOptionPending).toBeVisible();
    await expect(newClient.statusOptionAppointmentScheduled).toBeVisible();
    await expect(newClient.statusOptionNonResponsive).toBeVisible();
    await expect(newClient.statusOptionRejected).toBeVisible();
    await newClient.addNoteModalTitle.click();
    await newClient.clickCancel();
    await newClient.waitForModalClosed();
    await expect(newClient.addNoteModal).not.toBeVisible();
  });

  test('TC04: Complete with Note Only', async () => {
    await newClient.clickWidget();
    await newClient.waitForGridStable();
    const rowCount = await newClient.getGridRowCount();
    if (rowCount < 1) {
      test.skip('No referrals available to test Complete with Note Only.');
      return;
    }
    const firstRowEmail = await newClient.getRowEmail(0);
    const firstRowFirstName = await newClient.getRowFirstName(0);
    await newClient.getRowCompleteButton(0).click();
    const noteText = 'Client called - needs additional info';
    await newClient.enterNote(noteText);
    await expect(newClient.addNoteTextbox).toHaveValue(noteText);
    await newClient.clickSave();
    await newClient.waitForSuccessAlert();
    await expect(newClient.successAlert).toBeVisible();
    await newClient.waitForModalClosed();
    await expect(newClient.addNoteModal).not.toBeVisible();
    await newClient.clickWidget();
    await newClient.waitForGridStable();
    const rowIndex = await newClient.findRowIndexByEmailAndFirstName(firstRowEmail, firstRowFirstName);
    if (rowIndex === -1) throw new Error('Could not find the referral row after save.');
    await newClient.getRowCompleteButton(rowIndex).click();
    await expect(newClient.addNoteModal).toBeVisible();
    await expect(newClient.addNoteTextbox).toHaveValue(noteText);
    await newClient.clickCancel();
    await newClient.waitForModalClosed();
  });

  test('TC05: Complete with Status Only', async () => {
    await newClient.clickWidget();
    const firstRowEmail = await newClient.getRowEmail(0);
    const firstRowFirstName = await newClient.getRowFirstName(0);
    await newClient.getRowCompleteButton(0).click();
    const statusBefore = await newClient.getSelectedStatus();
    const statusToSelect = 'Pending- Attempted To Contact Client';
    await newClient.selectStatus(statusToSelect);
    const statusAfter = await newClient.getSelectedStatus();
    await newClient.clickSave();
    await newClient.waitForSuccessAlert();
    await newClient.waitForGridStable();
    const rowIndex = await newClient.findRowIndexByEmailAndFirstName(firstRowEmail, firstRowFirstName);
    if (statusAfter === 'New') {
      expect(rowIndex).not.toBe(-1);
    } else {
      expect(rowIndex).toBe(-1);
    }
  });

  test('TC06: Complete Without Note or Status Change', async () => {
    await newClient.openReferralsAndClickComplete();
    await newClient.clickSave();
    await newClient.waitForSuccessAlert();
    await expect(newClient.successAlert).toBeVisible();
    await newClient.waitForModalClosed();
  });

  test('TC07: Add Note Modal: Close, Cancel, Save', async () => {
    for (const closeAction of [
      async () => await newClient.clickCloseIcon(),
      async () => await newClient.clickCancel()
    ]) {
      await newClient.openReferralsAndClickComplete();
      await expect(newClient.addNoteModal).toBeVisible();
      await closeAction();
      await newClient.waitForModalClosed();
    }
    await newClient.openReferralsAndClickComplete();
    await newClient.enterNote('Test note');
    await newClient.selectStatus('Completed-Appointment Scheduled');
    await newClient.clickSave();
    await newClient.waitForSuccessAlert();
    await expect(newClient.successAlert).toBeVisible();
  });

  test('TC08: Add Note Popup Behaviors for Reject Button', async () => {
    await newClient.clickWidget();
    await newClient.waitForGridStable();
    const firstRowEmail = await newClient.getRowEmail(0);
    const firstRowFirstName = await newClient.getRowFirstName(0);
    await newClient.getRowRejectButton(0).click();
    await expect(newClient.addNoteModal).toBeVisible();
    await newClient.clickCloseIcon();
    await newClient.waitForModalClosed();
    await expect(newClient.addNoteModal).not.toBeVisible();
    await newClient.getRowRejectButton(0).click();
    await expect(newClient.addNoteModal).toBeVisible();
    await newClient.clickCancel();
    await newClient.waitForModalClosed();
    await newClient.getRowRejectButton(0).click();
    const noteText = 'Test reason test note';
    await newClient.enterNote(noteText);
    await newClient.clickSave();
    await newClient.waitForSuccessAlert();
    await expect(newClient.successAlert).toBeVisible();
    const alertText = await newClient.successAlert.textContent();
    expect(alertText).toMatch(/successfully reject/i);
    await newClient.clickWidget();
    await newClient.waitForGridStable();
    const rowIndex = await newClient.findRowIndexByEmailAndFirstName(firstRowEmail, firstRowFirstName);
    expect(rowIndex).toBe(-1);
  });

  test('TC09: Verify Column Sorting', async () => {
    const columns = [
      { name: 'First Name', type: 'string' },
      { name: 'Last Name', type: 'string' },
      { name: 'Phone Number', type: 'string' },
      { name: 'Email', type: 'string' },
      { name: 'Reason For Referral', type: 'string' },
      { name: 'Status', type: 'string' }
    ];

    const basicTables = new BasicTables(newClient.page);
    await newClient.clickWidget();
    await newClient.waitForGridStable();

    for (const col of columns) {
      const colIndex = columns.findIndex(c => c.name === col.name);
      const headerLocator = newClient.page.locator('div').filter({ hasText: new RegExp(`^${col.name}$`) });
      // Ascending
      await headerLocator.first().click();
      await newClient.page.waitForTimeout(1000);
      const valuesAsc = await basicTables.getColumnValues('#grid_212521791_2', colIndex);
      const sortedAsc = [...valuesAsc].sort((a, b) => col.type === 'number' ? Number(a) - Number(b) : a.localeCompare(b));
      expect(valuesAsc).toEqual(sortedAsc);
      // Descending
      await headerLocator.first().click();
      await newClient.page.waitForTimeout(1000);
      const valuesDesc = await basicTables.getColumnValues('#grid_212521791_2', colIndex);
      const sortedDesc = [...valuesDesc].sort((a, b) => col.type === 'number' ? Number(b) - Number(a) : b.localeCompare(a));
      expect(valuesDesc).toEqual(sortedDesc);
    }
  });

});
