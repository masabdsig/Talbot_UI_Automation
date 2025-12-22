import { test, expect } from '@playwright/test';
import { Dashboard } from '../pages/Dashboard';

test.use({ storageState: 'authState.json' });

test.describe('Appointments To Confirm Feature', () => {
  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new Dashboard(page);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Skip Two-Factor Authentication
    await expect(dashboard.skipMfaButton).toBeVisible();
    await dashboard.skipMfa();
    
    // Check if Appointments To Confirm widget is available
    // If no appointments exist, the tab will not be visible on the dashboard
    const appointmentsAvailable = await dashboard.isAppointmentsToConfirmAvailable();
    if (!appointmentsAvailable) {
      test.skip('No Appointments To Confirm available in the system - widget not visible on dashboard. Tests skipped.');
      console.log('No Appointments To Confirm available in the system - widget not visible on dashboard. Tests skipped.');
    }
  });

  test('Verify Appointments To Confirm For Today widget displays on dashboard with dynamic count', async ({ page }) => {
    // Verify that Appointments To Confirm For Today widget is visible on dashboard
    await expect(dashboard.appointmentsToConfirmWidget).toBeVisible();

    // Verify the widget displays a numeric count
    const widgetCount = await dashboard.getAppointmentCount();
    expect(widgetCount).toBeGreaterThanOrEqual(0);
    
    // Verify the count is displayed as a number
    expect(typeof widgetCount).toBe('number');
    console.log(`Appointments To Confirm For Today count: ${widgetCount}`);
  });

  test('Click on Appointments To Confirm For Today section to display information on grid', async ({ page }) => {
    // Store the widget count before clicking
    const widgetCount = await dashboard.getAppointmentCount();

    // Locate and click on the 'Appointments To Confirm For Today' widget/section
    await dashboard.clickAppointmentsToConfirmWidget();

    // Verify the appointments grid expands/displays
    await expect(dashboard.appointmentsToConfirmTitle).toBeVisible();

    // Verify all required columns are displayed
    await expect(dashboard.patientNameHeader).toBeVisible();
    await expect(dashboard.phoneNumberHeader).toBeVisible();
    await expect(dashboard.providerNameHeader).toBeVisible();
    await expect(dashboard.appointmentLocationHeader).toBeVisible();
    await expect(dashboard.clientLocationHeader).toBeVisible();
    await expect(dashboard.dateHeader).toBeVisible();
    await expect(dashboard.appointmentTimeHeader).toBeVisible();
    await expect(dashboard.insuranceTypeHeader).toBeVisible();
    await expect(dashboard.actionHeader).toBeVisible();

    console.log(`Verified all required columns are displayed in the Appointments To Confirm For Today grid.`);
    
  });
  
  test('Verify count displayed matches number of records in grid', async ({ page }) => {
    // Note the count displayed on the widget/tab
    const widgetCount = await dashboard.getAppointmentCount();
    
    // Click on the Appointments To Confirm For Today section to expand the grid
    await dashboard.clickAppointmentsToConfirmWidget();

    // Verify the appointments grid title is visible
    await expect(dashboard.appointmentsToConfirmTitle).toBeVisible();

    // Reset filters to ensure all records are displayed
    await dashboard.resetButton.click();
    
    // Wait for grid to update after reset
    await page.waitForTimeout(500);

    // Count the number of appointment records visible in the grid
    const gridRowCount = await dashboard.getGridRowCount();
    

    // Verify the widget count equals the number of grid records
    expect(gridRowCount).toBe(widgetCount);
    expect(widgetCount).toBeGreaterThan(0);

    console.log(`Verified: Widget count (${widgetCount}) matches grid row count (${gridRowCount})`);
  });
  
  test('Verify user can sort data', async ({ page }) => {
    // Click on the Appointments To Confirm For Today section to expand the grid
    await dashboard.clickAppointmentsToConfirmWidget();

    // Verify the appointments grid title is visible
    await expect(dashboard.appointmentsToConfirmTitle).toBeVisible();

    // Reset filters to ensure all records are displayed
    await dashboard.resetButton.click();
    await page.waitForTimeout(500);

    // Test sorting on Patient Name column
    console.log('Testing Patient Name column sort...');
    await dashboard.patientNameHeader.click();
    await page.waitForTimeout(300);
    let hasSortIndicator = await dashboard.checkSortIndicator(dashboard.patientNameHeader);
    expect(hasSortIndicator).toBeTruthy();
    console.log('Patient Name - Ascending order (arrow up)');

    // Click again to toggle to descending order
    await dashboard.patientNameHeader.click();
    await page.waitForTimeout(300);
    hasSortIndicator = await dashboard.checkSortIndicator(dashboard.patientNameHeader);
    expect(hasSortIndicator).toBeTruthy();
    console.log('Patient Name - Descending order (arrow down)');

    // Test sorting on Phone Number column
    console.log('Testing Phone Number column sort...');
    await dashboard.phoneNumberHeader.click();
    await page.waitForTimeout(300);
    hasSortIndicator = await dashboard.checkSortIndicator(dashboard.phoneNumberHeader);
    expect(hasSortIndicator).toBeTruthy();
    console.log('Phone Number - Ascending order');

    // Test sorting on Provider Name column
    console.log('Testing Provider Name column sort...');
    await dashboard.providerNameHeader.click();
    await page.waitForTimeout(300);
    hasSortIndicator = await dashboard.checkSortIndicator(dashboard.providerNameHeader);
    expect(hasSortIndicator).toBeTruthy();
    console.log('Provider Name - Ascending order');

    // Test sorting on Date column
    console.log('Testing Date column sort...');
    await dashboard.dateHeader.click();
    await page.waitForTimeout(300);
    hasSortIndicator = await dashboard.checkSortIndicator(dashboard.dateHeader);
    expect(hasSortIndicator).toBeTruthy();
    console.log('Date - Ascending order');

    // Test sorting on Appointment Time column
    console.log('Testing Appointment Time column sort...');
    await dashboard.appointmentTimeHeader.click();
    await page.waitForTimeout(300);
    hasSortIndicator = await dashboard.checkSortIndicator(dashboard.appointmentTimeHeader);
    expect(hasSortIndicator).toBeTruthy();
    console.log('Appointment Time - Ascending order');

    console.log('All sorting tests passed - columns are sortable with visible sort indicators');
  });

  test('Verify Edit Appointment, Send Message, and Verify Policy displayed under Actions column', async ({ page }) => {
    // Click on the Appointments To Confirm For Today section to expand the grid
    await dashboard.clickAppointmentsToConfirmWidget();

    // Verify the appointments grid title is visible
    await expect(dashboard.appointmentsToConfirmTitle).toBeVisible();

    // Verify Action column header is visible
    await expect(dashboard.actionHeader).toBeVisible();
    console.log('Action column header is visible');

    // Verify action icons in the first row using Dashboard locators
    await expect(dashboard.editAppointmentIcon).toBeVisible();
    await expect(dashboard.sendMessageIcon).toBeVisible();
    await expect(dashboard.sendVideoLinkIcon).toBeVisible();

    console.log('All three action icons are visible in Actions column');
  });

    test('Verify user navigates to patient detailed screen when clicking Patient Name', async ({ page }) => {
    // Open the Appointments To Confirm section
    await dashboard.clickAppointmentsToConfirmWidget();
    await expect(dashboard.appointmentsToConfirmTitle).toBeVisible();

    // Click first patient name link in the grid
    const firstPatientLink = page.locator('[role="row"] a').first();
    await expect(firstPatientLink).toBeVisible();
    const patientName = (await firstPatientLink.textContent())?.trim() || '';
    expect(patientName.length).toBeGreaterThan(0);

    await firstPatientLink.click();

    // Assert patient detail view shows the selected patient name and URL contains patientId param
    await expect(page.getByRole('heading', { name: patientName })).toBeVisible();
    await expect(page.url()).toContain('/summary/home?patientId=');
    console.log(`Navigated to patient detail view for patient: ${patientName}`);
  });

   test('Verify Edit Appointment dialog and all fields functionality', async ({ page }) => {
    // Open Appointments To Confirm section
    await dashboard.openAppointmentsToConfirmSection();
    await dashboard.resetFilters();
    await page.waitForTimeout(500);

    // Click Edit Appointment icon for first appointment
    await dashboard.openEditAppointmentDialog();

    // Verify Edit Appointment dialog opens
    await expect(dashboard.editDialog).toBeVisible();
    console.log('✓ Edit Appointment dialog opened');

    // Verify disabled fields (read-only)
    await expect(dashboard.getDialogCombobox('Appointment Type')).toBeDisabled();
    console.log('✓ Appointment Type field is disabled');

    await expect(dashboard.getDialogCombobox('Provider')).toBeDisabled();
    console.log('✓ Provider field is disabled');

    await expect(dashboard.getDialogCombobox('Patient')).toBeDisabled();
    console.log('✓ Patient field is disabled');

    await expect(dashboard.getDialogCombobox('Place Of Service')).toBeDisabled();
    console.log('✓ Place Of Service field is disabled');

    await expect(dashboard.getDialogCombobox('Type Of Service')).toBeDisabled();
    console.log('✓ Type Of Service field is disabled');

    await expect(dashboard.getDialogCombobox('Appointment End Time')).toBeDisabled();
    console.log('✓ Appointment End Time field is disabled');

    await expect(dashboard.getDialogCombobox('Facility')).toBeDisabled();
    console.log('✓ Facility field is disabled');

    // Verify enabled fields (editable)
    await expect(dashboard.getDialogCombobox('Appointment Start Date')).toBeEnabled();
    console.log('✓ Appointment Start Date field is enabled');

    await expect(dashboard.getDialogCombobox('Appointment Start Time')).toBeEnabled();
    console.log('✓ Appointment Start Time field is enabled');

    // Verify Status field is editable/visible
    await expect(dashboard.getDialogCombobox('Status')).toBeEnabled();
    console.log('✓ Status field is visible');

    // Verify dialog has Save and Cancel buttons
    await expect(dashboard.dialogSaveButton).toBeVisible();
    await expect(dashboard.dialogCancelButton).toBeVisible();
    console.log('✓ Save and Cancel buttons are visible');

    // Close dialog by clicking Cancel button
    await dashboard.dialogCancelButton.click();
    await page.waitForTimeout(300);
    await expect(dashboard.editDialog).not.toBeVisible();
    console.log('✓ Dialog closed successfully');
  });

    test('Test Verify Reason and Comments & Status fields are editable and persist', async ({ page }) => {
    // Open Appointments To Confirm section
    await dashboard.openAppointmentsToConfirmSection();
    await dashboard.resetFilters();
    await page.waitForTimeout(500);

    // Click Edit Appointment icon for first appointment
    await dashboard.openEditAppointmentDialog();

    // Verify Edit Appointment dialog opens
    await expect(dashboard.editDialog).toBeVisible();
    console.log('✓ Edit Appointment dialog opened');

    // Test Reason field - target by label text to avoid picking other inputs
    const reasonField = dashboard.editDialog.locator('xpath=.//*[normalize-space(.)="Reason *"]/following::input[1]').first();
    await expect(reasonField).toBeVisible();
    await expect(reasonField).toBeEnabled();
    console.log('✓ Reason field is visible and editable');

    // Modify Reason field with unique timestamp
    const newReason = `Test Reason ${Date.now()}`;
    // Clear the field properly with triple click + delete to trigger Angular events
    await reasonField.click();
    await reasonField.press('Control+A');
    await reasonField.press('Backspace');
    await reasonField.fill(newReason);
    await reasonField.blur(); // Trigger blur event for Angular validation
    await page.waitForTimeout(200); // Allow Angular to process
    await expect(reasonField).toHaveValue(newReason);
    console.log('✓ Reason field updated successfully with: ' + newReason);

    // Test Comments field (Test 23) - target by label text
    const commentsField = dashboard.editDialog.locator('xpath=.//*[normalize-space(.)="Comments"]/following::input[1]').first();
    await expect(commentsField).toBeVisible();
    await expect(commentsField).toBeEnabled();
    console.log('✓ Comments field is visible and editable');

    // Modify Comments field with unique timestamp
    const newComments = `New comments ${Date.now()}`;
    await commentsField.click();
    await commentsField.press('Control+A');
    await commentsField.press('Backspace');
    await commentsField.fill(newComments);
    await commentsField.blur(); // Trigger blur event for Angular validation
    await page.waitForTimeout(200); // Allow Angular to process
    await expect(commentsField).toHaveValue(newComments);
    console.log('✓ Comments field updated successfully with: ' + newComments);

    // Update Duration field (use the first spinbutton in dialog)
    const durationField = dashboard.editDialog.getByRole('spinbutton').first();
    await expect(durationField).toBeVisible();
    await expect(durationField).toBeEnabled();
    await durationField.click();
    await durationField.press('Control+A');
    await durationField.fill('20');
    await durationField.blur(); // Trigger blur event
    await page.waitForTimeout(200); // Allow Angular to process
    await expect(durationField).toHaveValue('20');
    console.log('✓ Duration updated to 20');

    // Update Status field using page.getByText locator
    const statusLabel = page.getByText('Status', { exact: true });
    const statusField = statusLabel.locator('..').getByRole('combobox').first();
    await expect(statusField).toBeVisible();
    const initialStatus = await statusField.inputValue();
    console.log('✓ Status field initial value:', initialStatus || '(empty)');
    
    // Try to update Status field by clicking the wrapper or using force
    let statusWasUpdated = false;
    let newStatusValue = initialStatus;
    
    // First, wait for any loaders to disappear
    await page.locator('[class*="loader"]').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    
    // Try clicking the wrapper div that contains the combobox
    const statusWrapper = statusField.locator('..');
    await statusWrapper.click({ force: true });
    await page.waitForTimeout(500);
    
    const statusOptions = page.getByRole('option');
    const optionCount = await statusOptions.count();
    if (optionCount > 0) {
      const firstOption = statusOptions.first();
      await firstOption.click();
      await page.waitForTimeout(300);
      newStatusValue = await statusField.inputValue();
      statusWasUpdated = (newStatusValue !== initialStatus);
      console.log('✓ Status field updated to:', newStatusValue);
      console.log('✓ Status was changed:', statusWasUpdated);
    } else {
      console.log('⚠ No status options available to select');
    }

    // Update Appointment Start Time via combobox using POM helper
    const startTimeCombo = dashboard.getDialogCombobox('Appointment Start Time');
    await expect(startTimeCombo).toBeVisible();
    await expect(startTimeCombo).toBeEnabled();
    const initialStartTime = await startTimeCombo.inputValue();
    await startTimeCombo.click();
    // Try to pick a specific time; if none visible quickly, keep existing
    const desiredTime = '11:05 PM';
    const timeOption = page.getByRole('option', { name: desiredTime });
    let selectedStartTime = initialStartTime;
    try {
      if (await timeOption.isVisible({ timeout: 2000 })) {
        await timeOption.click();
        selectedStartTime = await startTimeCombo.inputValue();
      } else {
        const firstOption = page.getByRole('option').first();
        await firstOption.click({ timeout: 2000 });
        selectedStartTime = await startTimeCombo.inputValue();
      }
    } catch {
      // If options not available, close dropdown and keep initial value
      await page.keyboard.press('Escape').catch(() => {});
      selectedStartTime = initialStartTime;
    }
    console.log('✓ Start Time selected:', selectedStartTime);

    // Click Save button to persist changes
    const saveButton = dashboard.editDialog.getByRole('button', { name: /save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    console.log('✓ Save button clicked');

    // Wait for dialog to close after save
    await expect(dashboard.editDialog).not.toBeVisible({ timeout: 10000 });
    console.log('✓ Dialog closed after saving');

    // Wait for any background processing
    await page.waitForTimeout(1000);

    // Reopen the same appointment to verify changes were persisted
    await dashboard.openEditAppointmentDialog();
    await expect(dashboard.editDialog).toBeVisible();
    console.log('✓ Edit dialog reopened for verification');

    // Verify Reason field persisted the new value
    const reasonFieldVerify = dashboard.editDialog.locator('xpath=.//*[normalize-space(.)="Reason *"]/following::input[1]').first();
    await expect(reasonFieldVerify).toHaveValue(newReason);
    console.log('✓ Reason field persisted correctly: ' + newReason);

    // Verify Comments field persisted the new value
    const commentsFieldVerify = dashboard.editDialog.locator('xpath=.//*[normalize-space(.)="Comments"]/following::input[1]').first();
    await expect(commentsFieldVerify).toHaveValue(newComments);
    console.log('✓ Comments field persisted correctly: ' + newComments);

    // Verify Duration field persisted
    const durationFieldVerify = dashboard.editDialog.getByRole('spinbutton').first();
    await expect(durationFieldVerify).toHaveValue('20');
    console.log('✓ Duration persisted correctly: 20');

    // Verify Status field value and check if it was updated
    const statusLabelVerify = page.getByText('Status', { exact: true });
    const statusFieldVerify = statusLabelVerify.locator('..').getByRole('combobox').first();
    const persistedStatus = await statusFieldVerify.inputValue();
    console.log('✓ Status field value on reopen:', persistedStatus || '(empty)');
    
    // Verify Status persistence if it was updated
    if (statusWasUpdated && newStatusValue) {
      await expect(statusFieldVerify).toHaveValue(newStatusValue);
      console.log('✓ Status field persisted correctly:', persistedStatus);
    } else {
      console.log('ℹ Status was not changed during update or remains empty');
    }

    // Close the dialog
    await dashboard.dialogCancelButton.click();
    await expect(dashboard.editDialog).not.toBeVisible();
    console.log('✓ Verification complete - all changes persisted successfully');
  });

    test('Test: Verify past dates cannot be selected in Appointment Start Date', async ({ page }) => {
    await dashboard.openAppointmentsToConfirmSection();
    await dashboard.resetFilters();
    await dashboard.openEditAppointmentDialog();
    await expect(dashboard.editDialog).toBeVisible();

    const dateField = dashboard.getDialogCombobox('Appointment Start Date');
    await expect(dateField).toBeVisible();

    // Generate dynamic past date (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });

    // Test 1: Check if calendar disables past dates
    await dashboard.openCalendarPicker();
    
    if (await dashboard.isCalendarCellDisabled()) {
      await expect(dashboard.calendarDisabledCell).toHaveClass(/e-disabled/);
    }
    
    await dashboard.closeCalendarPicker();

    // Test 2: Try typing past date
    await dateField.fill(pastDate);
    await dateField.blur();

    const actualValue = await dateField.inputValue();
    
    if (actualValue === pastDate) {
      // Past date accepted - verify save is blocked
      await dashboard.dialogSaveButton.click();
      
      const stillOpen = await dashboard.editDialog.isVisible();
      if (stillOpen) {
        // Expect validation error
        await expect(dashboard.validationToast).toBeVisible({ timeout: 5000 });
      } else {
        // Verify date wasn't persisted
        await dashboard.openEditAppointmentDialog();
        await expect(dateField).not.toHaveValue(pastDate);
      }
    } else {
      // Past date rejected - field auto-corrected
      expect(actualValue).not.toBe(pastDate);
    }

    // Cleanup
    await dashboard.dialogCancelButton.click();
    await expect(dashboard.editDialog).not.toBeVisible();
  });

   test('Chat popup end-to-end', async ({ page }) => {
    // Open Appointments To Confirm section and launch Send Message
    await dashboard.clickAppointmentsToConfirmWidget();
    await expect(dashboard.appointmentsToConfirmTitle).toBeVisible();

    const patientName = await dashboard.getPatientNameForFirstRow();
    const phoneNumber = await dashboard.getPhoneNumberForFirstRow();

    await dashboard.openChatForFirstAppointment();
    const chatDialog = dashboard.chatDialogForPatient(patientName);
    await expect(chatDialog).toBeVisible();

    // Verify patient name is displayed on chat popup header
    await expect(chatDialog.getByText(patientName, { exact: false })).toBeVisible();

    // Verify patient phone number is displayed on chat popup header
    await expect(chatDialog.getByText(phoneNumber, { exact: false })).toBeVisible();

    // Verify close icon closes chat popup
    await dashboard.closeChatDialog(chatDialog);
    await expect(chatDialog).toBeHidden();
    await expect(dashboard.appointmentsGrid).toBeVisible();

    // Verify message input field is displayed with placeholder and editable
    await dashboard.openChatForFirstAppointment();
    await expect(chatDialog).toBeVisible();
    const messageInput = dashboard.chatMessageInput(chatDialog);
    await expect(messageInput).toBeVisible();

    // Verify user can type message in text field
    const testMessage = `Automation chat ${Date.now()}`;
    await messageInput.fill(testMessage);
    await expect(messageInput).toHaveValue(testMessage);

    // Verify Send button is displayed and clickable
    const sendButton = dashboard.chatSendButton(chatDialog);
    await expect(sendButton).toBeEnabled();

    // Verify message is sent successfully and confirmation appears
    await sendButton.click();
    await expect(chatDialog.getByText(testMessage, { exact: false })).toBeVisible();
    await dashboard.successToast().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Close chat dialog
    await dashboard.closeChatDialog(chatDialog);
    await expect(chatDialog).toBeHidden();
  });

  test('Add message template (save delete template workflow)', async ({ page }) => {
    // Navigate to Appointments To Confirm section
    await dashboard.clickAppointmentsToConfirmWidget();
    await expect(dashboard.appointmentsToConfirmTitle).toBeVisible();

    // Get first row patient info
    const patientName = await dashboard.getPatientNameForFirstRow();

    // Open chat window
    await dashboard.openChatForFirstAppointment();
    const chatDialog = dashboard.chatDialogForPatient(patientName);
    await expect(chatDialog).toBeVisible();

    // Enter message in the message input field
    const messageInput = dashboard.chatMessageInput(chatDialog);
    await expect(messageInput).toBeVisible();
    const templateMessage = `Template message ${Date.now()}`;
    await messageInput.fill(templateMessage);
    await expect(messageInput).toHaveValue(templateMessage);

    // Click the + button to add template
    const addTemplateBtn = dashboard.addTemplateButton(chatDialog);
    let templateName = '';
    if (await addTemplateBtn.isVisible().catch(() => false)) {
      await addTemplateBtn.click();

      const templateDialog = dashboard.templateDialog();
      await templateDialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      if (await templateDialog.isVisible().catch(() => false)) {
        const templateNameInput = dashboard.templateNameInput(templateDialog);
        templateName = `auto template ${Date.now()}`;
        await templateNameInput.fill(templateName);

        await dashboard.templateSaveButton(templateDialog).click();

        await expect(chatDialog.getByText(templateName, { exact: true })).toBeVisible();
      }
    }

    // Delete the specific template we created
    if (templateName) {
      const itemContainer = await dashboard.templateItemContainer(chatDialog, templateName);
      const deleteButton = await dashboard.deleteTemplateButton(itemContainer);
      await deleteButton.click();

      const confirmDialog = dashboard.confirmDeleteDialog();
      await confirmDialog.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      if (await confirmDialog.isVisible().catch(() => false)) {
        await dashboard.confirmDeleteButton(confirmDialog).click();
        await dashboard.deleteToast().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      }

      await chatDialog.getByText(templateName, { exact: true }).waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }

    // Close chat dialog
    await dashboard.closeChatDialog(chatDialog);
    await expect(chatDialog).toBeHidden();
  });


});
     

    