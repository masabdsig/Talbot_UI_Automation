// pages/Dashboard.js
export class Dashboard {
  constructor(page) {
    this.page = page;

    // --- AUTHENTICATION & GENERAL ---
    this.skipMfaButton = page.getByRole('button', { name: ' Skip' });

    // --- APPOINTMENTS TO CONFIRM WIDGET (on main dashboard) ---
    // Widget text may be prefixed with a number (count), so use a regex match instead of exact text
    this.appointmentsToConfirmWidget = page.getByText(/Appointments To Confirm For Today/i);

    // --- APPOINTMENTS TO CONFIRM SECTION (expanded details) ---
    // Title can also include the count, so use a relaxed regex matcher
    this.appointmentsToConfirmTitle = page.getByRole('heading', { name: /Appointments To Confirm For Today/i });
    
    // Filters
    this.locationFilterDropdown = page.locator('combobox').filter({ has: page.locator('text=Location') }).first();
    this.providerFilterDropdown = page.locator('combobox').filter({ has: page.locator('text=Provider') }).first();
    this.resetButton = page.getByRole('button', { name: 'Reset' });

    // --- GRID ---
    this.appointmentsGrid = page.getByRole('grid').last();
    
    // Column Headers
    this.patientNameHeader = page.getByRole('columnheader', { name: 'Patient Name' });
    this.phoneNumberHeader = page.getByRole('columnheader', { name: 'Phone Number' });
    this.providerNameHeader = page.getByRole('columnheader', { name: 'Provider Name' });
    this.appointmentLocationHeader = page.getByRole('columnheader', { name: 'Appointment Location' });
    this.clientLocationHeader = page.getByRole('columnheader', { name: 'Client Location' });
    this.dateHeader = page.getByRole('columnheader', { name: 'Date' });
    this.appointmentTimeHeader = page.getByRole('columnheader', { name: 'Appointment Time' });
    this.insuranceTypeHeader = page.getByRole('columnheader', { name: 'Insurance Type' });
    this.actionHeader = page.getByRole('columnheader', { name: 'Action' });

    // Action icons in grid rows
    this.editAppointmentIcon = page.getByTitle('Edit Appointment').first();
    this.sendMessageIcon = page.getByTitle('Send Message').first();
    this.sendVideoLinkIcon = page.getByTitle('View & Verify Policy').first();

    // Pagination info
    this.paginationInfo = page.locator('text=/\\d+ of \\d+ pages/').last();

    // --- EDIT APPOINTMENT DIALOG ---
    this.editDialog = page.locator('[role="dialog"]').first();
    this.editDialogTitle = this.editDialog.getByRole('heading', { name: /Edit Appointment/i });
    this.dialogSaveButton = this.editDialog.locator('button').filter({ has: page.getByText('Save') }).first();
    this.dialogCancelButton = this.editDialog.locator('button').filter({ has: page.getByText('Cancel') }).first();
    // Top-right close icon (X) is a generic with pointer cursor in header
    this.dialogCloseIcon = this.editDialog.locator('[cursor="pointer"]').first();
    
    // Calendar/Datepicker elements
    this.calendarSelectButton = this.editDialog.getByRole('button', { name: /select/i });
    this.calendarDisabledCell = page.locator('.e-calendar .e-cell.e-disabled').nth(1);
    this.validationToast = page.locator('[role="alert"], .toast').filter({ hasText: /date|invalid|past/i });
  }

  // --- ACTIONS ---
  async skipMfa() {
    await this.skipMfaButton.click();
  }

  async clickAppointmentsToConfirmWidget() {
    await this.appointmentsToConfirmWidget.click();
  }

  // Simple helpers for this test style
  async openAppointmentsToConfirmSection() {
    await this.clickAppointmentsToConfirmWidget();
    await this.appointmentsToConfirmTitle.waitFor({ state: 'visible' });
  }

  async resetFilters() {
    await this.resetButton.click();
  }

  async openEditAppointmentDialog() {
    await this.editAppointmentIcon.click();
    await this.editDialog.waitFor({ state: 'visible' });
  }

  async closeEditDialogViaCancel() {
    await this.dialogCancelButton.click();
    await this.editDialog.waitFor({ state: 'hidden' });
  }

  // Check if Appointments To Confirm widget/tab is available on the dashboard
  // Returns true if widget is visible, false if no appointments (widget hidden)
  async isAppointmentsToConfirmAvailable() {
    return await this.appointmentsToConfirmWidget.isVisible({ timeout: 5000 }).catch(() => false);
  }

    async getAppointmentCount() {
      // Use the specific widget container and a heading with digits to read the dynamic count
      const widgetBox = this.page.locator("//body/patient-root/patient-master-layout[@class='ng-tns-c310-0 ng-star-inserted']/div[@class='ng-tns-c310-0 light-only ltr']/div[@id='main-menu-btn-list']/div[@id='canvas-bookmark']/div[@class='ng-tns-c310-0 page-body-height page-body-wrapper']/div[@class='page-body px-1 ng-tns-c310-0']/main[@class='ng-tns-c310-0']/patient-dashboard-widgets[@class='ng-star-inserted']/div[@class='container cards-block ng-star-inserted']/div[2]/div[1]");
      await widgetBox.waitFor({ state: 'visible' });
  
      const headingWithDigits = widgetBox.getByRole('heading', { name: /\d+/ });
      await headingWithDigits.waitFor({ state: 'visible' });
  
      const countText = (await headingWithDigits.textContent())?.trim() || '';
      const match = countText.match(/\d+/);
      return parseInt(match ? match[0] : '0', 10);
    }

    async getGridRowCount() {
      // Get the count from the pagination info that shows "(X items)"
      const paginationText = await this.page.getByText(/\(\d+\s+items?\)/).textContent();
      
      if (!paginationText) {
        return 0;
      }
      // Extract the number from the text like "(3 items)"
      const match = paginationText.match(/\((\d+)\s+items?\)/);
      return parseInt(match ? match[1] : '0', 10);
    }

    async checkSortIndicator(columnHeader) {
      // Check if sort indicator is visible (arrow up for ascending or arrow down for descending)
      const sortIndicator = columnHeader.locator('svg, [class*="sort"], [class*="arrow"]');
      return await sortIndicator.isVisible();
    }

    // --- EDIT APPOINTMENT DIALOG HELPERS ---
    getDialogCombobox(namePattern) {
      return this.editDialog.getByRole('combobox', { name: new RegExp(namePattern, 'i') }).first();
    }

    async openCalendarPicker() {
      await this.calendarSelectButton.click();
    }

    async closeCalendarPicker() {
      await this.page.keyboard.press('Escape');
    }

    async isCalendarCellDisabled() {
      return await this.calendarDisabledCell.isVisible();
    }

    async verifyCalendarCellHasDisabledClass() {
      await this.calendarDisabledCell.waitFor({ state: 'visible' });
      await this.calendarDisabledCell.evaluate(el => {
        if (!el.classList.contains('e-disabled')) {
          throw new Error('Calendar cell does not have e-disabled class');
        }
      });
    }

    // --- CHAT HELPERS ---
    getFirstAppointmentRow() {
      return this.appointmentsGrid.getByRole('row').nth(1);
    }

    async getPatientNameForFirstRow() {
      const row = this.getFirstAppointmentRow();
      const cell = row.getByRole('gridcell').nth(0);
      const text = await cell.innerText();
      return (text || '').trim();
    }

    async getPhoneNumberForFirstRow() {
      const row = this.getFirstAppointmentRow();
      const cell = row.getByRole('gridcell').nth(1);
      const text = await cell.innerText();
      return (text || '').trim();
    }

    async openChatForFirstAppointment() {
      await this.sendMessageIcon.click();
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

    chatCloseIcon(chatDialog) {
      return chatDialog.locator('.fa-close, .fa-times, .e-dialog-close, .k-i-close, [aria-label="Close"], [title="Close"], span:has-text("×"), i:has-text("×"), div:has-text("×")').first();
    }

    async closeChatDialog(chatDialog) {
      const closeIcon = this.chatCloseIcon(chatDialog);
      const visible = await closeIcon.isVisible().catch(() => false);
      if (visible) {
        await closeIcon.click();
      } else {
        await this.page.keyboard.press('Escape');
      }
    }

    successToast() {
      return this.page.locator('[role="alert"], .toast').filter({ hasText: /sent|success|delivered/i }).first();
    }

    // --- TEMPLATE HELPERS ---
    addTemplateButton(chatDialog) {
      return chatDialog.locator('[title*="Save"], [aria-label*="Save"], .fa-plus, button:has-text("+")').first();
    }

    templateDialog() {
      return this.page.getByRole('dialog').filter({ hasText: /Template|Name|Save/i }).last();
    }

    templateNameInput(templateDialog) {
      return templateDialog.getByRole('textbox').first();
    }

    templateSaveButton(templateDialog) {
      return templateDialog.getByRole('button', { name: /Save|Ok/i }).first();
    }

    templateItemContainer(chatDialog, templateName) {
      // Try common list/table containers first
      let container = chatDialog.locator('li', { hasText: templateName }).first();
      return container.isVisible().catch(() => false).then(visible => {
        if (visible) return container;
        container = chatDialog.locator('tr', { hasText: templateName }).first();
        return container.isVisible().catch(() => false).then(visible2 => {
          if (visible2) return container;
          const nameLabel = chatDialog.getByText(templateName, { exact: true }).first();
          return nameLabel.locator('xpath=ancestor::div[contains(@class, "template") or contains(@class, "item") or contains(@class, "row")][1]').first();
        });
      });
    }

    deleteTemplateButton(itemContainer) {
      const withinText = itemContainer.getByText(/Delete Template/i).first();
      return withinText.isVisible().catch(() => false).then(visible => {
        if (visible) return withinText;
        return itemContainer.locator('[title*="Delete"], .fa-trash, .fa-remove, button:has-text("Delete")').first();
      });
    }

    confirmDeleteDialog() {
      return this.page.getByRole('dialog').filter({ hasText: /Delete|Confirm|Remove/i }).last();
    }

    confirmDeleteButton(confirmDialog) {
      return confirmDialog.getByRole('button', { name: /Ok|Yes|Confirm|Delete/i }).first();
    }

    deleteToast() {
      return this.page.locator('[role="alert"], .toast').filter({ hasText: /deleted|success|removed|template/i }).first();
    }
}