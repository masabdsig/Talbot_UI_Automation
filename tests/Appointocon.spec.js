import { test, expect } from '@playwright/test';
import { Appointocon } from '../pages/Appointocon.js';
test.use({ storageState: 'authState.json' });

test.describe('Appointments To Confirm Feature', () => {
  let appointocon;

  test.beforeEach(async ({ page }) => {
    appointocon = new Appointocon(page);
    await page.goto('/dashboard');
    const skipMfaVisible = await appointocon.skipMfaButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (skipMfaVisible) {
      await appointocon.skipMfa();
      console.log('✔️ MFA skipped');
    }
    if (!(await appointocon.isWidgetAvailable())) {
      test.skip('No Appointments To Confirm available in the system - widget not visible on dashboard. Tests skipped.');
    }
  });

  test('TC01: Widget displays with dynamic count', async () => {
    console.log('\n➡️ [TC01] Checking widget visibility and count...');
    await expect(appointocon.widget).toBeVisible();
    const widgetCount = await appointocon.getWidgetCount();
    expect(typeof widgetCount).toBe('number');
    expect(widgetCount).toBeGreaterThanOrEqual(0);
    console.log(`✔️ Widget is visible with count: ${widgetCount}`);
  });

  test('TC02: Click widget displays grid and columns', async () => {
    console.log('\n➡️ [TC02] Expanding widget and checking columns...');
    await appointocon.openWidget();
    await expect(appointocon.title).toBeVisible();
    const headers = [
      'Patient Name', 'Phone Number', 'Provider Name', 'Appointment Location',
      'Client Location', 'Date', 'Appointment Time', 'Insurance Type', 'Action'];
    for (const header of headers) {
      console.log(`➡️ Checking column header: ${header}`);
      await expect(appointocon.page.getByRole('columnheader', { name: header })).toBeVisible();
      console.log(`✔️ Column header visible: ${header}`);
    }
    console.log('✔️ All required columns are visible');
  });

  test('TC03: Widget count matches grid row count', async () => {
    console.log('\n➡️ [TC03] Comparing widget count and grid row count...');
    const widgetCount = await appointocon.getWidgetCount();
    await appointocon.openWidget();
    await appointocon.resetButton.click();
    await appointocon.page.waitForTimeout(500);
    const gridRowCount = await appointocon.getGridRowCount();
    console.log(`Widget count: ${widgetCount}, Grid row count: ${gridRowCount}`);
    expect(gridRowCount).toBe(widgetCount);
    expect(widgetCount).toBeGreaterThan(0);
    console.log('✔️ Widget count matches grid row count');
  });

  test('TC04: Action icons visible in Actions column', async () => {
    console.log('\n➡️ [TC04] Checking action icons in Actions column...');
    await appointocon.openWidget();
    await expect(appointocon.actionHeader).toBeVisible();
    const icons = [
      { name: 'Edit Appointment', locator: appointocon.editIcon },
      { name: 'Send Message', locator: appointocon.sendMsgIcon },
      { name: 'View & Verify Policy', locator: appointocon.verifyPolicyIcon }
    ];
    for (const icon of icons) {
      console.log(`➡️ Checking icon: ${icon.name}`);
      await expect(icon.locator).toBeVisible();
      console.log(`✔️ Icon visible: ${icon.name}`);
    }
    console.log('✔️ All action icons are visible');
  });

  test('TC05: Clicking Patient Name navigates to detail', async () => {
    console.log('\n➡️ [TC05] Clicking patient name and verifying navigation...');
    await appointocon.openWidget();
    await expect(appointocon.title).toBeVisible();
    // Click first patient name link in the grid (same as working test)
    const firstPatientLink = appointocon.page.locator('[role="row"] a').first();
    await expect(firstPatientLink).toBeVisible();
    const patientName = (await firstPatientLink.textContent())?.trim() || '';
    expect(patientName.length).toBeGreaterThan(0);
    await firstPatientLink.click();
    await expect(appointocon.page.getByRole('heading', { name: patientName })).toBeVisible();
    await expect(appointocon.page.url()).toContain('/summary/home?patientId=');
    console.log(`✔️ Navigated to patient detail for: ${patientName}`);
  });

  test('TC06: Edit dialog fields enabled/disabled', async () => {
    console.log('\n➡️ [TC06] Checking enabled/disabled fields in Edit dialog...');
    await appointocon.openWidget();
    await appointocon.resetButton.click();
    await appointocon.page.waitForTimeout(500);
    await appointocon.openEditDialog();
    await expect(appointocon.editDialog).toBeVisible();
    const disabledFields = [
      'Appointment Type', 'Provider', 'Patient', 'Place Of Service',
      'Type Of Service', 'Appointment End Time', 'Facility'];
    for (const field of disabledFields) {
      console.log(`➡️ Checking disabled field: ${field}`);
      await expect(appointocon.getDialogCombobox(field)).toBeDisabled();
      console.log(`✔️ Field disabled: ${field}`);
    }
    const enabledFields = ['Appointment Start Date', 'Appointment Start Time', 'Status'];
    for (const field of enabledFields) {
      console.log(`➡️ Checking enabled field: ${field}`);
      await expect(appointocon.getDialogCombobox(field)).toBeEnabled();
      console.log(`✔️ Field enabled: ${field}`);
    }
    await expect(appointocon.dialogSaveButton).toBeVisible();
    await expect(appointocon.dialogCancelButton).toBeVisible();
    await appointocon.closeEditDialog();
    console.log('✔️ Edit dialog field checks complete');
  });

    test('TC07: Reason, Comments, Duration, Status fields editable and persist ', async () => {
  console.log('\n➡️ [TC07] Editing and verifying Reason, Comments, Duration, Status fields...');
  
  await appointocon.openWidget();
  await appointocon.resetButton.click();
  await appointocon.page.waitForTimeout(500);
  await appointocon.openWidget();
  
  // Execute complete workflow in one method call
  await appointocon.editAndVerifyReasonCommentsDurationStatus();
  
  console.log('✓ TC07 Complete');
});

  test('TC08: Past dates cannot be selected in Appointment Start Date', async () => {
    console.log('\n➡️ [TC08] Verifying past dates cannot be selected...');
    await appointocon.openWidget();
    await appointocon.resetButton.click();
    await appointocon.openEditDialog();
    await appointocon.expectPastDateNotAllowed();
    await appointocon.closeEditDialog();
    console.log('✔️ Past date selection test complete');
  });

  test('TC09: Chat popup end-to-end', async () => {
    console.log('\n➡️ [TC09] Chat popup end-to-end test...');
    await appointocon.openWidget();
    const patientName = await appointocon.getPatientNameForFirstRow();
    const phoneNumber = await appointocon.getPhoneNumberForFirstRow();
    await appointocon.openChatForFirstAppointment();
    const chatDialog = appointocon.chatDialogForPatient(patientName);
    await expect(chatDialog).toBeVisible();
    await expect(chatDialog.getByText(patientName, { exact: false })).toBeVisible();
    await expect(chatDialog.getByText(phoneNumber, { exact: false })).toBeVisible();
    await appointocon.closeChatDialog(chatDialog);
    await expect(chatDialog).toBeHidden();
    await expect(appointocon.grid).toBeVisible();
    await appointocon.openChatForFirstAppointment();
    await expect(chatDialog).toBeVisible();
    const messageInput = appointocon.chatMessageInput(chatDialog);
    await expect(messageInput).toBeVisible();
    const testMessage = `Automation chat ${Date.now()}`;
    await messageInput.fill(testMessage);
    await expect(messageInput).toHaveValue(testMessage);
    const sendButton = appointocon.chatSendButton(chatDialog);
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    await expect(chatDialog.getByText(testMessage, { exact: false })).toBeVisible();
    await appointocon.successToast().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await appointocon.closeChatDialog(chatDialog);
    await expect(chatDialog).toBeHidden();
    console.log('✔️ Chat popup end-to-end test complete');
  });
  test('TC10: Add message template (save delete template workflow)', async () => {
    console.log('\n➡️ [TC10] Add message template (save/delete template workflow)...');
    await appointocon.addAndDeleteMessageTemplate();
    console.log('✔️ Message template add/delete workflow completed');
  });

  test('TC11: Edit dialog fields are prepopulated', async () => {
    console.log('\n➡️ [TC11] Checking prepopulated fields in Edit dialog...');
    await appointocon.openWidget();
    await appointocon.resetButton.click();
    await appointocon.page.waitForTimeout(500);
    await appointocon.openEditDialog();
    await appointocon.expectPrepopulatedFields(['Provider', 'Appointment Type', 'Patient']);
    await appointocon.closeEditDialog();
    console.log('✔️ Prepopulated fields test complete');
  });

});