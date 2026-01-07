// pages/Appointocon.js
import { expect } from '@playwright/test';

export class Appointocon {
  constructor(page) {
    this.page = page;
    this.skipMfaButton = page.getByRole('button', { name: ' Skip' });
    this.widget = page.locator('p:has-text("Appointments To Confirm For Today")');
    this.title = page.getByRole('heading', { name: /Appointments To Confirm For Today/i });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.grid = page.getByRole('grid').last();
    this.actionHeader = page.getByRole('columnheader', { name: 'Action' });
    this.editIcon = page.getByTitle('Edit Appointment').first();
    this.sendMsgIcon = page.getByTitle('Send Message').first();
    this.verifyPolicyIcon = page.getByTitle('View & Verify Policy').first();
    this.editDialog = page.locator('[role="dialog"]').first();
    this.dialogSaveButton = this.editDialog.locator('button').filter({ has: page.getByText('Save') }).first();
    this.dialogCancelButton = this.editDialog.locator('button').filter({ has: page.getByText('Cancel') }).first();
    this.calendarSelectButton = this.editDialog.getByRole('button', { name: /select/i });
    this.calendarDisabledCell = page.locator('.e-calendar .e-cell.e-disabled').nth(1);
    this.validationToast = page.locator('[role="alert"], .toast').filter({ hasText: /date|invalid|past/i });
    // Updated Provider field locator to use the provided XPath
    this.providerField = page.locator('xpath=//*[@id="ej2_dropdownlist_559"]/div/input');
  }

  async skipMfa() {
    console.log('➡️ Clicking Skip MFA button...');
    await this.skipMfaButton.click();
    console.log('✔️ MFA skipped');
  }

  async openWidget() {
    console.log('➡️ Clicking Appointments To Confirm widget...');
    await this.widget.click();
    await this.title.waitFor({ state: 'visible' });
    console.log('✔️ Widget expanded and title visible');
  }

  async getWidgetCount() {
    console.log('➡️ Getting widget count...');
    const widgetBox = this.page.locator('xpath=//*[@id="canvas-bookmark"]/div/div/main/patient-dashboard-widgets/div[1]/div[2]/div').first();
    await widgetBox.waitFor({ state: 'visible' });
    const headingWithDigits = widgetBox.getByRole('heading', { name: /\d+/ });
    await headingWithDigits.waitFor({ state: 'visible' });
    const countText = (await headingWithDigits.textContent())?.trim() || '';
    const match = countText.match(/\d+/);
    const count = parseInt(match ? match[0] : '0', 10);
    console.log(`✔️ Widget count: ${count}`);
    return count;
  }

  async getGridRowCount() {
    console.log('➡️ Getting grid row count...');
    const paginationText = await this.page.getByText(/\(\d+\s+items?\)/).textContent();
    if (!paginationText) {
      console.log('⚠️ No pagination text found, returning 0');
      return 0;
    }
    const match = paginationText.match(/\((\d+)\s+items?\)/);
    const count = parseInt(match ? match[1] : '0', 10);
    console.log(`✔️ Grid row count: ${count}`);
    return count;
  }

  async isWidgetAvailable() {
    console.log('➡️ Checking if widget is available...');
    const widget = this.widget;
    const heading = this.page.locator('h6.card-title-text', { hasText: /Appointments To Confirm For Today/i }).first();
    let widgetVisible = false;
    let headingVisible = false;
    try {
      widgetVisible = await widget.isVisible({ timeout: 5000 });
    } catch (e) {
      console.warn('Widget locator not visible:', e);
    }
    try {
      headingVisible = await heading.isVisible({ timeout: 2000 });
    } catch (e) {
      console.warn('Heading locator not visible:', e);
    }
    if (!widgetVisible && !headingVisible) {
      // Try to expand the widget if neither is visible
      try {
        await widget.click({ timeout: 2000 });
        await heading.waitFor({ state: 'visible', timeout: 3000 });
        widgetVisible = await widget.isVisible().catch(() => false);
        headingVisible = await heading.isVisible().catch(() => false);
      } catch (e) {
        console.warn('Widget could not be expanded:', e);
      }
    }
    const result = widgetVisible || headingVisible;
    console.log(`✔️ Widget is ${result ? 'available' : 'not available'}`);
    if (!result) {
      // Extra debug info for troubleshooting
      const allTabs = await this.page.locator('p').allTextContents();
      console.log('All visible dashboard tabs:', allTabs);
    }
    return result;
  }


  async openEditDialog() {
    console.log('➡️ Opening Edit Appointment dialog...');
    await this.editIcon.click();
    await this.editDialog.waitFor({ state: 'visible' });
    console.log('✔️ Edit dialog opened');
  }

  async closeEditDialog() {
    console.log('➡️ Closing Edit Appointment dialog...');
    await this.dialogCancelButton.click();
    await this.editDialog.waitFor({ state: 'hidden' });
    console.log('✔️ Edit dialog closed');
  }

  getDialogCombobox(namePattern) {
    const combo = this.editDialog.getByRole('combobox', { name: new RegExp(namePattern, 'i') }).first();
    console.log(`➡️ Getting combobox for: ${namePattern}`);
    return combo;
  }

  // New method to get the value of a combobox in the edit dialog
  async getDialogComboboxValue(fieldName) {
    if (fieldName === 'Provider') {
      // Try robust locator for Provider field
      try {
        if (await this.providerField.isVisible({ timeout: 2000 })) {
          return await this.providerField.inputValue();
        }
      } catch (e) {
        // fallback to combobox
      }
    }
    const combobox = this.getDialogCombobox(fieldName);
    if (combobox) {
      try {
        if (await combobox.isVisible({ timeout: 2000 })) {
          return await combobox.inputValue();
        }
      } catch (e) {
        // fallback
      }
    }
    return '';
  }

  async fillAndSaveReasonCommentsDurationStatus(reason, comments, duration, status, time) {
    console.log('➡️ Filling Reason, Comments, Duration, Status, and Time fields...');
    const reasonField = this.editDialog.locator('xpath=.//*[normalize-space(.)="Reason *"]/following::input[1]').first();
    await reasonField.fill(reason);
    await reasonField.blur();
    console.log(`✔️ Reason set: ${reason}`);
    const commentsField = this.editDialog.locator('xpath=.//*[normalize-space(.)="Comments"]/following::input[1]').first();
    await commentsField.fill(comments);
    await commentsField.blur();
    console.log(`✔️ Comments set: ${comments}`);
    const durationField = this.editDialog.getByRole('spinbutton').first();
    await durationField.fill(duration);
    await durationField.blur();
    console.log(`✔️ Duration set: ${duration}`);
    const statusField = this.getDialogCombobox('Status');
    await statusField.click({ force: true });
    const statusOption = this.page.getByRole('option').first();
    if (await statusOption.isVisible().catch(() => false)) {
      await statusOption.click();
      console.log('✔️ Status updated');
    }
    const startTimeCombo = this.getDialogCombobox('Appointment Start Time');
    await startTimeCombo.click();
    const timeOption = this.page.getByRole('option', { name: time });
    if (await timeOption.isVisible().catch(() => false)) {
      await timeOption.click();
      console.log(`✔️ Start Time set: ${time}`);
    } else {
      const firstOption = this.page.getByRole('option').first();
      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click();
        console.log('✔️ Start Time set to first available');
      }
    }
    await this.dialogSaveButton.click();
    await this.editDialog.waitFor({ state: 'hidden' });
    console.log('✔️ Saved and dialog closed');
  }

  async verifyReasonCommentsDurationStatus(reason, comments, duration) {
    console.log('➡️ Verifying Reason, Comments, and Duration fields...');
    // Wait for the correct dialog to be visible
    await this.editDialog.waitFor({ state: 'visible', timeout: 10000 });
    // Defensive: check the label for the field to ensure it's the right dialog
    const reasonLabel = await this.editDialog.locator('xpath=.//*[normalize-space(.)="Reason *"]').first();
    if (!(await reasonLabel.isVisible())) {
      throw new Error('Reason label not found in the edit dialog. Possibly wrong dialog.');
    }
    const reasonField = this.editDialog.locator('xpath=.//*[normalize-space(.)="Reason *"]/following::input[1]').first();
    const actualReason = await reasonField.inputValue();
    if (actualReason !== reason) {
      console.error(`Reason field value mismatch. Expected: '${reason}', Actual: '${actualReason}'`);
    }
    await expect(reasonField).toHaveValue(reason);
    console.log('✔️ Reason verified');
    const commentsField = this.editDialog.locator('xpath=.//*[normalize-space(.)="Comments"]/following::input[1]').first();
    const actualComments = await commentsField.inputValue();
    if (actualComments !== comments) {
      console.error(`Comments field value mismatch. Expected: '${comments}', Actual: '${actualComments}'`);
    }
    await expect(commentsField).toHaveValue(comments);
    console.log('✔️ Comments verified');
    const durationField = this.editDialog.getByRole('spinbutton').first();
    const actualDuration = await durationField.inputValue();
    if (actualDuration !== duration) {
      console.error(`Duration field value mismatch. Expected: '${duration}', Actual: '${actualDuration}'`);
    }
    await expect(durationField).toHaveValue(duration);
    console.log('✔️ Duration verified');
  }

  async openCalendarPicker() {
    console.log('➡️ Opening calendar picker...');
    await this.calendarSelectButton.click();
    console.log('✔️ Calendar picker opened');
  }

  async closeCalendarPicker() {
    console.log('➡️ Closing calendar picker...');
    await this.page.keyboard.press('Escape');
    console.log('✔️ Calendar picker closed');
  }

  async isCalendarCellDisabled() {
    const disabled = await this.calendarDisabledCell.isVisible();
    console.log(`✔️ Calendar cell disabled: ${disabled}`);
    return disabled;
  }

  async trySetPastDate(pastDate) {
    console.log(`➡️ Trying to set past date: ${pastDate}`);
    const dateField = this.getDialogCombobox('Appointment Start Date');
    await dateField.fill(pastDate);
    await dateField.blur();
    const value = await dateField.inputValue();
    console.log(`✔️ Date field value after input: ${value}`);
    return value;
  }

  async clickFirstPatientName() {
    console.log('➡️ Clicking first patient name link in grid...');
    const firstPatientLink = this.page.locator('[role="row"] a').first();
    await firstPatientLink.click();
    const name = (await firstPatientLink.textContent())?.trim() || '';
    console.log(`✔️ Clicked patient: ${name}`);
    return name;
  }

  async getPatientNameForFirstRow() {
    const row = this.grid.getByRole('row').nth(1);
    const cell = row.getByRole('gridcell').nth(0);
    const name = (await cell.innerText()).trim();
    console.log(`✔️ First row patient name: ${name}`);
    return name;
  }

  async getPhoneNumberForFirstRow() {
    const row = this.grid.getByRole('row').nth(1);
    const cell = row.getByRole('gridcell').nth(1);
    const phone = (await cell.innerText()).trim();
    console.log(`✔️ First row phone number: ${phone}`);
    return phone;
  }

  async openChatForFirstAppointment() {
    console.log('➡️ Opening chat for first appointment...');
    await this.sendMsgIcon.click();
    console.log('✔️ Chat dialog opened');
  }

  chatDialogForPatient(patientName) {
    return this.page.locator('[role="dialog"]').filter({ hasText: patientName }).first();
  }

  chatMessageInput(chatDialog) {
    return chatDialog.getByPlaceholder(/type your message/i).first();
  }

  chatSendButton(chatDialog) {
    return chatDialog.getByRole('button', { name: /send/i }).first();
  }

  async closeChatDialog(chatDialog) {
    console.log('➡️ Closing chat dialog...');
    const closeIcon = chatDialog.locator('i.fa.fa-times.fa-lg').first();
    if (await closeIcon.isVisible().catch(() => false)) {
      await closeIcon.click();
      console.log('✔️ Chat dialog closed via icon');
    } else {
      await this.page.keyboard.press('Escape');
      console.log('✔️ Chat dialog closed via Escape');
    }
  }

  successToast() {
    return this.page.locator('[role="alert"], .toast').filter({ hasText: /sent|success|delivered/i }).first();
  }
    // --- MESSAGE TEMPLATE WORKFLOW ---
  async addAndDeleteMessageTemplate() {
    // Open widget and chat for first appointment
    await this.openWidget();
    const patientName = await this.getPatientNameForFirstRow();
    await this.openChatForFirstAppointment();
    const chatDialog = this.chatDialogForPatient(patientName);
    await expect(chatDialog).toBeVisible();

    // Enter message in the message input field
    const messageInput = this.chatMessageInput(chatDialog);
    await expect(messageInput).toBeVisible();
    const templateMessage = `Template message ${Date.now()}`;
    await messageInput.fill(templateMessage);
    await expect(messageInput).toHaveValue(templateMessage);

    // Click the + button to add template
    const addTemplateBtn = chatDialog.locator('[title*="Save"], [aria-label*="Save"], .fa-plus, button:has-text("+")').first();
    let templateName = '';
    if (await addTemplateBtn.isVisible().catch(() => false)) {
      await addTemplateBtn.click();
      const templateDialog = this.page.getByRole('dialog').filter({ hasText: /Template|Name|Save/i }).last();
      await templateDialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      if (await templateDialog.isVisible().catch(() => false)) {
        const templateNameInput = templateDialog.getByRole('textbox').first();
        templateName = `auto template ${Date.now()}`;
        await templateNameInput.fill(templateName);
        const saveBtn = templateDialog.getByRole('button', { name: /Save|Ok/i }).first();
        await saveBtn.click();
        await expect(chatDialog.getByText(templateName, { exact: true })).toBeVisible();
      }
    }

    // Delete the specific template we created
    if (templateName) {
      let itemContainer = chatDialog.locator('li', { hasText: templateName }).first();
      if (!(await itemContainer.isVisible().catch(() => false))) {
        itemContainer = chatDialog.locator('tr', { hasText: templateName }).first();
      }
      if (!(await itemContainer.isVisible().catch(() => false))) {
        const nameLabel = chatDialog.getByText(templateName, { exact: true }).first();
        itemContainer = nameLabel.locator('xpath=ancestor::div[contains(@class, "template") or contains(@class, "item") or contains(@class, "row")][1]').first();
      }
      let deleteButton = itemContainer.getByText(/Delete Template/i).first();
      if (!(await deleteButton.isVisible().catch(() => false))) {
        deleteButton = itemContainer.locator('[title*="Delete"], .fa-trash, .fa-remove, button:has-text("Delete")').first();
      }
      await deleteButton.click();
      const confirmDialog = this.page.getByRole('dialog').filter({ hasText: /Delete|Confirm|Remove/i }).last();
      await confirmDialog.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      if (await confirmDialog.isVisible().catch(() => false)) {
        const confirmBtn = confirmDialog.getByRole('button', { name: /Ok|Yes|Confirm|Delete/i }).first();
        await confirmBtn.click();
        const deleteToast = this.page.locator('[role="alert"], .toast').filter({ hasText: /deleted|success|removed|template/i }).first();
        await deleteToast.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      }
      await chatDialog.getByText(templateName, { exact: true }).waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }

    // Close chat dialog
    await this.closeChatDialog(chatDialog);
    await expect(chatDialog).toBeHidden();
  }
    // Utility to check prepopulated fields concisely
  async expectPrepopulatedFields(fieldNames) {
    for (const field of fieldNames) {
      const combo = this.getDialogCombobox(field);
      await expect(combo).toBeVisible({ timeout: 5000 });
      let value = '';
      for (let i = 0; i < 10; i++) {
        value = await this.getDialogComboboxValue(field);
        if (value) break;
        await this.page.waitForTimeout(300);
      }
      expect(value).toBeTruthy();
      console.log(`✔️ ${field} field prepopulated: ${value}`);
    }
  }
    // Utility to check that past dates cannot be selected in Appointment Start Date
  async expectPastDateNotAllowed() {
    const dateField = this.getDialogCombobox('Appointment Start Date');
    await expect(dateField).toBeVisible();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    await this.openCalendarPicker();
    if (await this.isCalendarCellDisabled()) {
      await expect(this.calendarDisabledCell).toHaveClass(/e-disabled/);
      console.log('✔️ Calendar disables past dates');
    }
    await this.closeCalendarPicker();
    const actualValue = await this.trySetPastDate(pastDate);
    if (actualValue === pastDate) {
      await this.dialogSaveButton.click();
      const stillOpen = await this.editDialog.isVisible();
      if (stillOpen) {
        await expect(this.validationToast).toBeVisible({ timeout: 5000 });
        console.log('✔️ Validation toast shown for past date');
      } else {
        await this.openEditDialog();
        await expect(dateField).not.toHaveValue(pastDate);
        console.log('✔️ Past date not persisted');
      }
    } else {
      expect(actualValue).not.toBe(pastDate);
      console.log('✔️ Past date auto-corrected');
    }
  }

  /**
 * Complete TC07 workflow: Edit all fields, save, reopen, and verify persistence
 */
async editAndVerifyReasonCommentsDurationStatus() {
  console.log('\n➡️ Starting TC07 comprehensive workflow...');
  
  // Open edit dialog
  await this.openEditDialog();
  
  // Generate unique values
  const timestamp = Date.now();
  const newReason = `TC07 Reason ${timestamp}`;
  const newComments = `TC07 Comments ${timestamp}`;
  
  // Reason field
  console.log('➡️ Filling Reason field');
  const reasonField = this.editDialog.locator('xpath=.//*[normalize-space(.)="Reason *"]/following::input[1]').first();
  await expect(reasonField).toBeVisible();
  await expect(reasonField).toBeEnabled();
  await reasonField.click();
  await reasonField.press('Control+A');
  await reasonField.press('Backspace');
  await reasonField.fill(newReason);
  await reasonField.blur();
  await this.page.waitForTimeout(200);
  await expect(reasonField).toHaveValue(newReason);
  console.log(`✔️ Reason updated: ${newReason}`);
  
  // Comments field
  console.log('➡️ Filling Comments field');
  const commentsField = this.editDialog.locator('xpath=.//*[normalize-space(.)="Comments"]/following::input[1]').first();
  await expect(commentsField).toBeVisible();
  await expect(commentsField).toBeEnabled();
  await commentsField.click();
  await commentsField.press('Control+A');
  await commentsField.press('Backspace');
  await commentsField.fill(newComments);
  await commentsField.blur();
  await this.page.waitForTimeout(200);
  await expect(commentsField).toHaveValue(newComments);
  console.log(`✔️ Comments updated: ${newComments}`);
  
  // Duration field
  console.log('➡️ Filling Duration field');
  const durationField = this.editDialog.getByRole('spinbutton').first();
  await expect(durationField).toBeVisible();
  await expect(durationField).toBeEnabled();
  let currentDuration = await durationField.inputValue();
  let newDuration = '20';
  if (currentDuration === '20') {
    newDuration = '25';
  }
  await durationField.click();
  await durationField.press('Control+A');
  await durationField.fill(newDuration);
  await durationField.blur();
  await this.page.waitForTimeout(200);
  await expect(durationField).toHaveValue(newDuration);
  console.log(`✔️ Duration updated: ${newDuration}`);
  
  // Status field
  console.log('➡️ Updating Status field');
  const statusLabel = this.page.locator(':text-is("Status")');
  const statusField = statusLabel.locator('..').getByRole('combobox').first();
  await expect(statusField).toBeVisible();
  const initialStatus = await statusField.inputValue();
  let statusWasUpdated = false;
  let newStatusValue = initialStatus;
  
  await this.page.locator('[class*="loader"]').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  await this.page.waitForTimeout(500);
  
  const statusWrapper = statusField.locator('..');
  await statusWrapper.click({ force: true });
  await this.page.waitForTimeout(500);
  
  const statusOptions = this.page.getByRole('option');
  const optionCount = await statusOptions.count();
  
  if (optionCount > 0) {
    const firstOption = statusOptions.first();
    const firstOptionText = await firstOption.textContent();
    
    if (initialStatus !== firstOptionText) {
      await firstOption.click();
      await this.page.waitForTimeout(300);
      newStatusValue = await statusField.inputValue();
      statusWasUpdated = (newStatusValue !== initialStatus);
      console.log(`✔️ Status updated: ${newStatusValue}`);
    } else if (optionCount > 1) {
      const secondOption = statusOptions.nth(1);
      const secondOptionText = await secondOption.textContent();
      await secondOption.click();
      await this.page.waitForTimeout(300);
      newStatusValue = await statusField.inputValue();
      statusWasUpdated = (newStatusValue !== initialStatus);
      console.log(`✔️ Status updated to second option: ${secondOptionText}`);
    } else {
      console.log('ℹ Only one status option available');
    }
  } else {
    console.log('⚠ No status options available');
  }
  
  // Appointment Start Time
  console.log('➡️ Selecting Appointment Start Time');
  const startTimeCombo = this.getDialogCombobox('Appointment Start Time');
  await expect(startTimeCombo).toBeVisible();
  await expect(startTimeCombo).toBeEnabled();
  const initialStartTime = await startTimeCombo.inputValue();
  
  // Calculate time: current + 10 minutes
  const now = new Date();
  now.setMinutes(now.getMinutes() + 10);
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const pad = (n) => n.toString().padStart(2, '0');
  const desiredTime = `${hours}:${pad(minutes)} ${ampm}`;
  
  let selectedStartTime = initialStartTime;
  if (initialStartTime !== desiredTime) {
    const timeDropdownIcon = this.page.locator('span.e-input-group-icon.e-time-icon.e-icons.e-input-btn-ripple');
    
    if (await timeDropdownIcon.isVisible().catch(() => false)) {
      await timeDropdownIcon.click();
    } else {
      await startTimeCombo.click();
    }
    
    await this.page.waitForTimeout(500);
    const timeOptions = this.page.getByRole('option');
    const count = await timeOptions.count();
    let found = false;
    
    for (let i = 0; i < count; i++) {
      const optionText = (await timeOptions.nth(i).textContent()).trim();
      if (optionText === desiredTime) {
        await timeOptions.nth(i).click();
        selectedStartTime = await startTimeCombo.inputValue();
        found = true;
        break;
      }
    }
    
    if (!found && count > 0) {
      await timeOptions.first().click();
      selectedStartTime = await startTimeCombo.inputValue();
      console.log(`⚠ Desired time (${desiredTime}) not found, selected: ${selectedStartTime}`);
    } else if (found) {
      console.log(`✔️ Selected time: ${selectedStartTime}`);
    }
  }
  
  // Save
  console.log('➡️ Saving dialog');
  await expect(this.dialogSaveButton).toBeVisible();
  await this.dialogSaveButton.click();
  
  try {
    await expect(this.editDialog).not.toBeVisible({ timeout: 10000 });
    console.log('✔️ Dialog closed');
  } catch (e) {
    const toast = this.page.locator('[role="alert"], .toast').filter({ hasText: /success|saved|updated/i }).first();
    await toast.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
    await expect(this.editDialog).not.toBeVisible({ timeout: 5000 });
    console.log('✔️ Dialog closed after retry');
  }
  
  await this.page.waitForTimeout(500);
  
  // Reopen and verify
  console.log('➡️ Reopening to verify persistence');
  await this.openEditDialog();
  await expect(this.editDialog).toBeVisible();
  
  const reasonFieldVerify = this.editDialog.locator('xpath=.//*[normalize-space(.)="Reason *"]/following::input[1]').first();
  await expect(reasonFieldVerify).toHaveValue(newReason);
  console.log('✔️ Reason verified');
  
  const commentsFieldVerify = this.editDialog.locator('xpath=.//*[normalize-space(.)="Comments"]/following::input[1]').first();
  await expect(commentsFieldVerify).toHaveValue(newComments);
  console.log('✔️ Comments verified');
  
  const durationFieldVerify = this.editDialog.getByRole('spinbutton').first();
  await expect(durationFieldVerify).toHaveValue(newDuration);
  console.log('✔️ Duration verified');
  
  const statusLabelVerify = this.page.locator(':text-is("Status")');
  const statusFieldVerify = statusLabelVerify.locator('..').getByRole('combobox').first();
  
  if (statusWasUpdated && newStatusValue) {
    await expect(statusFieldVerify).toHaveValue(newStatusValue);
    console.log(`✔️ Status verified: ${newStatusValue}`);
  } else {
    await expect(statusFieldVerify).toHaveValue(initialStatus);
    console.log('ℹ Status unchanged');
  }
  
  await this.dialogCancelButton.click();
  await expect(this.editDialog).not.toBeVisible();
  
  console.log('✔️ TC07 verification complete - all changes persisted successfully\n');
}

  
    
}
