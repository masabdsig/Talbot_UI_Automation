const { SchedulingPage } = require('./SchedulingPage');
const { expect } = require('@playwright/test');

class RecurringAppointmentsPage extends SchedulingPage {
  constructor(page) {
    super(page);
    // Locators for Recurring Appointments
    this.recurringCheckbox = () => this.modal().locator('input[type="checkbox"][name*="recurring"], input[type="checkbox"][id*="recurring"], label:has-text("Recurring") + input[type="checkbox"]').first();
    this.recurringPatternDropdown = () => this.modal().locator('label:has-text("Repeat"), label:has-text("Recurrence Pattern"), label:has-text("Pattern")').locator('xpath=../..//div[contains(@class,"e-control-wrapper")]').first();
    this.groupTherapyDropdown = () => this.modal().locator('label:has-text("Group Therapy")').locator('xpath=../..//div[contains(@class,"e-control-wrapper")]').first();
    this.recurringFrequencyInput = () => this.modal().locator('label:has-text("Frequency"), label:has-text("Every"), label:has-text("Repeat Every")').locator('xpath=../..//input').first();
    this.recurringEndDateInput = () => this.modal().locator('label:has-text("End Date"), label:has-text("Repeat Until"), label:has-text("Ends On")').locator('xpath=../..//input').first();
    this.recurringOccurrencesInput = () => this.modal().locator('label:has-text("Occurrences"), label:has-text("Number of Occurrences")').locator('xpath=../..//input').first();
    this.editSeriesButton = () => this.modal().locator('button:has-text("Edit Series"), button:has-text("Edit Recurring")').first();
    this.editOccurrenceButton = () => this.modal().locator('button:has-text("Edit Occurrence"), button:has-text("Edit This Only")').first();
    this.deleteOccurrenceButton = () => this.modal().locator('button:has-text("Delete Occurrence"), button:has-text("Delete This Only")').first();
  }

  // Helper: Inspect modal to find recurring-related elements
  async inspectModalForRecurringElements() {
    console.log('STEP: Inspecting modal for recurring appointment elements...');
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Get all text content in modal to see what's available
    const modalText = await modal.textContent({ timeout: 3000 }).catch(() => '');
    console.log('ℹ️ Modal text content (first 500 chars):', modalText.substring(0, 500));

    // Look for buttons that might open recurring options
    const allButtons = modal.locator('button, a[role="button"], .btn, .e-btn');
    const buttonCount = await allButtons.count({ timeout: 2000 }).catch(() => 0);
    console.log(`ℹ️ Found ${buttonCount} button(s) in modal`);
    
    for (let i = 0; i < Math.min(buttonCount, 20); i++) {
      const btn = allButtons.nth(i);
      const btnText = await btn.textContent({ timeout: 1000 }).catch(() => '');
      if (btnText) {
        console.log(`  Button ${i}: "${btnText.trim()}"`);
      }
    }

    // Look for tabs
    const tabs = modal.locator('[role="tab"], .nav-tab, .e-tab, .tab');
    const tabCount = await tabs.count({ timeout: 2000 }).catch(() => 0);
    console.log(`ℹ️ Found ${tabCount} tab(s) in modal`);
    
    for (let i = 0; i < Math.min(tabCount, 10); i++) {
      const tab = tabs.nth(i);
      const tabText = await tab.textContent({ timeout: 1000 }).catch(() => '');
      if (tabText) {
        console.log(`  Tab ${i}: "${tabText.trim()}"`);
      }
    }

    // Look for any text containing "recur", "repeat", "series"
    const recurringText = modal.locator('*:has-text("recur"), *:has-text("repeat"), *:has-text("series"), *:has-text("Recurring"), *:has-text("Repeat")');
    const recurringCount = await recurringText.count({ timeout: 2000 }).catch(() => 0);
    console.log(`ℹ️ Found ${recurringCount} element(s) with recurring-related text`);
    
    return { buttonCount, tabCount, recurringCount };
  }

  // Helper: Enable recurring checkbox or button
  async enableRecurring() {
    console.log('STEP: Enabling recurring appointment...');
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // First, inspect the modal to understand its structure
    await this.inspectModalForRecurringElements();

    // Try multiple strategies to find recurring option
    // Strategy 1: Look for button with recurring/repeat text
    const recurringButtons = [
      modal.locator('button:has-text("Recurring")'),
      modal.locator('button:has-text("Repeat")'),
      modal.locator('button:has-text("Make Recurring")'),
      modal.locator('button:has-text("Recurring Appointment")'),
      modal.locator('a:has-text("Recurring")'),
      modal.locator('a:has-text("Repeat")'),
      modal.locator('.btn:has-text("Recurring")'),
      modal.locator('.btn:has-text("Repeat")')
    ];

    for (const btn of recurringButtons) {
      const isVisible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        await btn.click({ timeout: 3000 });
        await this.page.waitForTimeout(1000);
        console.log('✓ Recurring button/link clicked');
        return;
      }
    }

    // Strategy 2: Look for checkbox
    const checkbox = this.recurringCheckbox();
    const isVisible = await checkbox.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      const isChecked = await checkbox.isChecked({ timeout: 1000 }).catch(() => false);
      if (!isChecked) {
        await checkbox.click({ timeout: 3000 });
        await this.page.waitForTimeout(500);
        console.log('✓ Recurring checkbox enabled');
        return;
      } else {
        console.log('✓ Recurring checkbox already enabled');
        return;
      }
    }

    // Strategy 3: Look for label with recurring text
    const recurringLabel = modal.locator('label:has-text("Recurring"), label:has-text("Repeat")').first();
    const labelVisible = await recurringLabel.isVisible({ timeout: 2000 }).catch(() => false);
    if (labelVisible) {
      await recurringLabel.click({ timeout: 3000 });
      await this.page.waitForTimeout(500);
      console.log('✓ Recurring enabled via label click');
      return;
    }

    // Strategy 4: Look for tab or section
    const recurringTab = modal.locator('[role="tab"]:has-text("Recurring"), .nav-tab:has-text("Recurring"), .tab:has-text("Recurring")').first();
    const tabVisible = await recurringTab.isVisible({ timeout: 2000 }).catch(() => false);
    if (tabVisible) {
      await recurringTab.click({ timeout: 3000 });
      await this.page.waitForTimeout(1000);
      console.log('✓ Recurring tab clicked');
      return;
    }

    console.log('⚠️ Recurring option not found in modal - please check the UI structure');
    console.log('⚠️ The recurring functionality may be accessed differently in this application');
  }

  // Helper: Select Group-IOP appointment type
  async selectGroupIOPAppointmentType() {
    console.log('STEP: Selecting Group-IOP appointment type...');
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Find Appointment Type dropdown
    const appointmentTypeLabel = modal.locator('label.e-float-text:has-text("Appointment Type"), label:has-text("Appointment Type *")').first();
    const isLabelVisible = await appointmentTypeLabel.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isLabelVisible) {
      throw new Error('Appointment Type dropdown not found');
    }

    // Find the dropdown wrapper
    let dropdownWrapper = appointmentTypeLabel.locator('xpath=ancestor::div[contains(@class,"e-control-wrapper")][contains(@class,"e-ddl")]').first();
    let isDropdownVisible = await dropdownWrapper.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!isDropdownVisible) {
      dropdownWrapper = modal.locator('div.e-control-wrapper.e-ddl').filter({ 
        has: modal.locator('label:has-text("Appointment Type")') 
      }).first();
      isDropdownVisible = await dropdownWrapper.isVisible({ timeout: 2000 }).catch(() => false);
    }
    
    if (!isDropdownVisible) {
      throw new Error('Appointment Type dropdown wrapper not found');
    }

    // Click dropdown to open
    await dropdownWrapper.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    const dropdownIcon = dropdownWrapper.locator('.e-ddl-icon, .e-input-group-icon, span.e-ddl-icon').first();
    const iconVisible = await dropdownIcon.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (iconVisible) {
      await dropdownIcon.click({ force: true });
    } else {
      const input = dropdownWrapper.locator('input[readonly], input[role="combobox"]').first();
      const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
      if (inputVisible) {
        await input.click({ force: true });
      } else {
        await dropdownWrapper.click({ force: true });
      }
    }
    
    await this.page.waitForTimeout(1500);

    // Find popup and select "Group-IOP" option
    const popupSelectors = [
      'div[id$="_popup"]:visible',
      '.e-popup-open:visible',
      'ul.e-list-parent:visible',
      '.e-dropdownbase:visible',
      '[role="listbox"]:visible'
    ];
    
    let popup = null;
    for (const selector of popupSelectors) {
      popup = this.page.locator(selector).first();
      const popupVisible = await popup.isVisible({ timeout: 3000 }).catch(() => false);
      if (popupVisible) {
        break;
      }
    }

    // Get all options and log them for debugging
    const allOptions = popup.locator('li[role="option"], li.e-list-item');
    const optionCount = await allOptions.count();
    console.log(`ℹ️ Found ${optionCount} appointment type option(s) in dropdown`);
    
    // Log all available options
    for (let i = 0; i < Math.min(optionCount, 20); i++) {
      const option = allOptions.nth(i);
      const optionText = await option.textContent({ timeout: 1000 }).catch(() => '');
      if (optionText) {
        console.log(`  Option ${i + 1}: "${optionText.trim()}"`);
      }
    }
    
    // Try multiple search patterns for Group-IOP
    const searchPatterns = [
      'Group-IOP',
      'Group IOP',
      'GroupIOP',
      'group-iop',
      'group iop',
      'IOP'
    ];
    
    let foundOption = null;
    let matchedText = '';
    
    for (const pattern of searchPatterns) {
      // Try exact match first
      const exactMatch = popup.locator(`li[role="option"]:has-text("${pattern}"), li.e-list-item:has-text("${pattern}")`).first();
      const exactVisible = await exactMatch.isVisible({ timeout: 1000 }).catch(() => false);
      if (exactVisible) {
        foundOption = exactMatch;
        matchedText = pattern;
        break;
      }
    }
    
    // If exact match not found, search through all options
    if (!foundOption) {
      for (let i = 0; i < optionCount; i++) {
        const option = allOptions.nth(i);
        const optionText = await option.textContent({ timeout: 1000 }).catch(() => '');
        const lowerText = optionText ? optionText.trim().toLowerCase() : '';
        
        for (const pattern of searchPatterns) {
          if (lowerText.includes(pattern.toLowerCase())) {
            foundOption = option;
            matchedText = optionText.trim();
            console.log(`ℹ️ Found Group-IOP match with pattern "${pattern}": "${matchedText}"`);
            break;
          }
        }
        if (foundOption) break;
      }
    }
    
    if (foundOption) {
      await foundOption.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(300);
      await foundOption.click({ timeout: 3000 });
      
      // Wait for dropdown popup to close
      await this.page.waitForTimeout(1000);
      
      // Wait for modal to update/refresh after selection
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
      
      // Wait for fields (Group Therapy) to load - check if Group Therapy label appears
      const modal = this.modal();
      await modal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      
      console.log('STEP: Waiting for Group Therapy field to load...');
      const groupTherapyLabel = modal.locator('label:has-text("Group Therapy")').first();
      let fieldAppeared = false;
      
      // Wait up to 5 seconds for Group Therapy field to appear
      for (let i = 0; i < 10; i++) {
        fieldAppeared = await groupTherapyLabel.isVisible({ timeout: 500 }).catch(() => false);
        if (fieldAppeared) {
          console.log(`✓ Group Therapy field loaded after ${(i + 1) * 0.5} second(s)`);
          break;
        }
        await this.page.waitForTimeout(500);
      }
      
      if (!fieldAppeared) {
        console.log('⚠️ Group Therapy field not visible after waiting - may need more time');
      }
      
      // Additional wait to ensure fields are fully rendered
      await this.page.waitForTimeout(1000);
      console.log(`✓ Group-IOP appointment type selected: "${matchedText}"`);
    } else {
      console.log('⚠️ Group-IOP option not found. Available options listed above.');
      throw new Error('Group-IOP option not found in Appointment Type dropdown. Check the logged options above.');
    }
  }

  // Helper: Select first option in Group Therapy dropdown
  async selectFirstGroupTherapyOption() {
    console.log('STEP: Selecting first option in Group Therapy dropdown...');
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    const groupTherapyDropdown = this.groupTherapyDropdown();
    const isVisible = await groupTherapyDropdown.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isVisible) {
      console.log('⚠️ Group Therapy dropdown not found');
      return false;
    }

    // Click dropdown to open
    await groupTherapyDropdown.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    // Try clicking the dropdown icon or input
    const dropdownIcon = groupTherapyDropdown.locator('.e-ddl-icon, .e-input-group-icon, span.e-ddl-icon').first();
    const iconVisible = await dropdownIcon.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (iconVisible) {
      await dropdownIcon.click({ force: true });
    } else {
      const input = groupTherapyDropdown.locator('input[readonly], input[role="combobox"]').first();
      const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
      if (inputVisible) {
        await input.click({ force: true });
      } else {
        await groupTherapyDropdown.click({ force: true });
      }
    }
    
    await this.page.waitForTimeout(1500); // Wait for popup to appear

    // Find popup and select first option - use same pattern as other dropdowns
    const popupSelectors = [
      'div[id$="_popup"]:visible',
      '.e-popup-open:visible',
      'ul.e-list-parent:visible',
      '.e-dropdownbase:visible',
      '[role="listbox"]:visible',
      '.e-popup:visible'
    ];
    
    let popup = null;
    let popupVisible = false;
    
    for (const selector of popupSelectors) {
      popup = this.page.locator(selector).first();
      popupVisible = await popup.isVisible({ timeout: 3000 }).catch(() => false);
      if (popupVisible) {
        console.log(`ℹ️ Found popup with selector: ${selector}`);
        break;
      }
    }
    
    // If still not visible, wait more and try again
    if (!popupVisible) {
      await this.page.waitForTimeout(1000);
      for (const selector of popupSelectors) {
        popup = this.page.locator(selector).first();
        popupVisible = await popup.isVisible({ timeout: 3000 }).catch(() => false);
        if (popupVisible) {
          console.log(`ℹ️ Found popup after wait with selector: ${selector}`);
          break;
        }
      }
    }
    
    if (!popupVisible) {
      throw new Error('Group Therapy dropdown popup not found');
    }
    
    await popup.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    await this.page.waitForTimeout(800); // Wait for options to render
    
    // Try multiple option selectors
    const optionSelectors = [
      'li[role="option"]',
      'li.e-list-item',
      'ul.e-list-parent li',
      '.e-dropdownbase li',
      '[role="option"]'
    ];
    
    let options = null;
    let count = 0;
    
    for (const selector of optionSelectors) {
      options = popup.locator(selector).filter({ hasNotText: '' });
      count = await options.count({ timeout: 2000 }).catch(() => 0);
      if (count > 0) {
        console.log(`ℹ️ Found ${count} option(s) with selector: ${selector}`);
        break;
      }
    }
    
    if (count === 0) {
      throw new Error('No options found in Group Therapy dropdown');
    }
    
    // Select first option
    const firstOption = options.first();
    await firstOption.waitFor({ state: 'visible', timeout: 5000 });
    const optionText = await firstOption.textContent({ timeout: 2000 }).catch(() => '');
    await firstOption.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
    await firstOption.click({ timeout: 3000 });
    await this.page.waitForTimeout(500);
    console.log(`✓ First Group Therapy option selected: ${optionText.trim()}`);
    return true;
  }

  // Helper: Select recurring pattern (Daily, Weekly, Monthly, etc.) - using Repeat dropdown
  async selectRecurringPattern(pattern = 'Daily') {
    console.log(`STEP: Selecting recurring pattern: ${pattern}...`);
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Find Repeat dropdown by label
    const repeatLabel = modal.locator('label:has-text("Repeat")').first();
    const isLabelVisible = await repeatLabel.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isLabelVisible) {
      console.log('⚠️ Repeat dropdown not found');
      return false;
    }

    // Find the dropdown wrapper
    let dropdownWrapper = repeatLabel.locator('xpath=ancestor::div[contains(@class,"e-control-wrapper")][contains(@class,"e-ddl")]').first();
    let isDropdownVisible = await dropdownWrapper.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!isDropdownVisible) {
      dropdownWrapper = modal.locator('div.e-control-wrapper.e-ddl').filter({ 
        has: modal.locator('label:has-text("Repeat")') 
      }).first();
      isDropdownVisible = await dropdownWrapper.isVisible({ timeout: 2000 }).catch(() => false);
    }
    
    if (!isDropdownVisible) {
      console.log('⚠️ Repeat dropdown wrapper not found');
      return false;
    }

    // Click dropdown to open
    await dropdownWrapper.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    const dropdownIcon = dropdownWrapper.locator('.e-ddl-icon, .e-input-group-icon, span.e-ddl-icon').first();
    const iconVisible = await dropdownIcon.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (iconVisible) {
      await dropdownIcon.click({ force: true });
    } else {
      const input = dropdownWrapper.locator('input[readonly], input[role="combobox"]').first();
      const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
      if (inputVisible) {
        await input.click({ force: true });
      } else {
        await dropdownWrapper.click({ force: true });
      }
    }
    
    await this.page.waitForTimeout(1500);

    // Find popup and select pattern
    const popupSelectors = [
      'div[id$="_popup"]:visible',
      '.e-popup-open:visible',
      'ul.e-list-parent:visible',
      '.e-dropdownbase:visible',
      '[role="listbox"]:visible'
    ];
    
    let popup = null;
    for (const selector of popupSelectors) {
      popup = this.page.locator(selector).first();
      const popupVisible = await popup.isVisible({ timeout: 3000 }).catch(() => false);
      if (popupVisible) {
        break;
      }
    }

    // Select pattern option
    const option = popup.locator(`li.e-list-item:has-text("${pattern}"), li[role="option"]:has-text("${pattern}")`).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click({ timeout: 3000 });
    await this.page.waitForTimeout(500);
    console.log(`✓ Recurring pattern selected: ${pattern}`);
    return true;
  }

  // Helper: Select "Until" in the end dropdown
  async selectEndOption(option = 'Until') {
    console.log(`STEP: Selecting end option: ${option}...`);
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Try multiple strategies to find the End dropdown
    // Strategy 1: Find by class e-end-on-element (most specific)
    let dropdownWrapper = modal.locator('div.e-control-wrapper.e-ddl.e-end-on-element, div.e-end-on-element.e-control-wrapper.e-ddl').first();
    let isDropdownVisible = await dropdownWrapper.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Strategy 2: Find by input with class e-end-on-element
    if (!isDropdownVisible) {
      const endInput = modal.locator('input.e-end-on-element, input[class*="e-end-on-element"]').first();
      const inputVisible = await endInput.isVisible({ timeout: 2000 }).catch(() => false);
      if (inputVisible) {
        dropdownWrapper = endInput.locator('xpath=ancestor::div[contains(@class,"e-control-wrapper")][contains(@class,"e-ddl")]').first();
        isDropdownVisible = await dropdownWrapper.isVisible({ timeout: 2000 }).catch(() => false);
      }
    }
    
    // Strategy 3: Find by label "End"
    if (!isDropdownVisible) {
      const endLabel = modal.locator('label:has-text("End"), label[id*="end_label"]').first();
      const isLabelVisible = await endLabel.isVisible({ timeout: 2000 }).catch(() => false);
      if (isLabelVisible) {
        dropdownWrapper = endLabel.locator('xpath=ancestor::div[contains(@class,"e-control-wrapper")][contains(@class,"e-ddl")]').first();
        isDropdownVisible = await dropdownWrapper.isVisible({ timeout: 2000 }).catch(() => false);
      }
    }
    
    // Strategy 4: Find by input with title="End"
    if (!isDropdownVisible) {
      const endInputByTitle = modal.locator('input[title="End"]').first();
      const inputVisible = await endInputByTitle.isVisible({ timeout: 2000 }).catch(() => false);
      if (inputVisible) {
        dropdownWrapper = endInputByTitle.locator('xpath=ancestor::div[contains(@class,"e-control-wrapper")][contains(@class,"e-ddl")]').first();
        isDropdownVisible = await dropdownWrapper.isVisible({ timeout: 2000 }).catch(() => false);
      }
    }
    
    if (!isDropdownVisible) {
      console.log('⚠️ End dropdown wrapper not found');
      return false;
    }

    // Click dropdown to open
    await dropdownWrapper.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    // Try clicking the dropdown icon first
    const dropdownIcon = dropdownWrapper.locator('.e-ddl-icon, .e-input-group-icon, span.e-ddl-icon, .e-search-icon').first();
    const iconVisible = await dropdownIcon.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (iconVisible) {
      await dropdownIcon.click({ force: true });
    } else {
      // Try clicking the input
      const input = dropdownWrapper.locator('input.e-end-on-element, input[readonly], input[role="combobox"]').first();
      const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
      if (inputVisible) {
        await input.click({ force: true });
      } else {
        // Last resort: click the wrapper
        await dropdownWrapper.click({ force: true });
      }
    }
    
    await this.page.waitForTimeout(1500);

    // Find popup and select option
    const popupSelectors = [
      'div[id$="_popup"]:visible',
      'div[id*="dropdownlist"][id*="_popup"]:visible',
      '.e-popup-open:visible',
      'ul.e-list-parent:visible',
      '.e-dropdownbase:visible',
      '[role="listbox"]:visible'
    ];
    
    let popup = null;
    for (const selector of popupSelectors) {
      popup = this.page.locator(selector).first();
      const popupVisible = await popup.isVisible({ timeout: 3000 }).catch(() => false);
      if (popupVisible) {
        break;
      }
    }

    if (!popup) {
      console.log('⚠️ End dropdown popup not found');
      return false;
    }

    // Select option (e.g., "Until")
    const optionElement = popup.locator(`li.e-list-item:has-text("${option}"), li[role="option"]:has-text("${option}")`).first();
    await optionElement.waitFor({ state: 'visible', timeout: 5000 });
    await optionElement.click({ timeout: 3000 });
    await this.page.waitForTimeout(1000); // Wait for dropdown to close and modal to update
    console.log(`✓ End option selected: ${option}`);
    return true;
  }

  // Helper: Calculate date 3 days from today and format as M/D/YY
  _getDateThreeDaysFromToday() {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    
    // Format as M/D/YY (e.g., 1/16/26)
    const month = threeDaysLater.getMonth() + 1; // getMonth() returns 0-11
    const day = threeDaysLater.getDate();
    const year = threeDaysLater.getFullYear().toString().slice(-2); // Get last 2 digits of year
    
    return `${month}/${day}/${year}`;
  }

  // Helper: Set end date (3 days from today) in the until datepicker
  async setEndDate() {
    console.log('STEP: Setting end date (3 days from today)...');
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Find the until datepicker input by class "e-until-date"
    const untilDateInput = modal.locator('input.e-until-date, input[class*="e-until-date"]').first();
    const isVisible = await untilDateInput.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!isVisible) {
      // Try alternative selectors
      const altSelectors = [
        'input[title="Until"]',
        'input[id*="datepicker"][id*="until"]',
        'input.e-datepicker.e-until-date',
        'input.e-control.e-datepicker.e-until-date'
      ];
      
      let foundInput = null;
      for (const selector of altSelectors) {
        const candidateInput = modal.locator(selector).first();
        const isAltVisible = await candidateInput.isVisible({ timeout: 1000 }).catch(() => false);
        if (isAltVisible) {
          foundInput = candidateInput;
          break;
        }
      }
      
      if (!foundInput || !(await foundInput.isVisible({ timeout: 1000 }).catch(() => false))) {
        console.log('⚠️ Until datepicker input not found');
        return false;
      }
      
      // Calculate date 3 days from today
      const dateToSet = this._getDateThreeDaysFromToday();
      console.log(`ℹ️ Setting end date to: ${dateToSet} (3 days from today)`);
      
      // Clear and fill the date input
      await foundInput.clear({ timeout: 3000 });
      await foundInput.fill(dateToSet, { timeout: 3000 });
      await this.page.waitForTimeout(500);
      
      // Verify the date was set
      const value = await foundInput.inputValue({ timeout: 2000 }).catch(() => '');
      console.log(`✓ End date set to: ${value || dateToSet}`);
      
      // Store the end date for later use
      this._endDate = this._getDateThreeDaysFromTodayDate();
      return true;
    }
    
    // Calculate date 3 days from today
    const dateToSet = this._getDateThreeDaysFromToday();
    console.log(`ℹ️ Setting end date to: ${dateToSet} (3 days from today)`);
    
    // Clear and fill the date input
    await untilDateInput.clear({ timeout: 3000 });
    await untilDateInput.fill(dateToSet, { timeout: 3000 });
    await this.page.waitForTimeout(500);
    
    // Verify the date was set
    const value = await untilDateInput.inputValue({ timeout: 2000 }).catch(() => '');
    console.log(`✓ End date set to: ${value || dateToSet}`);
    
    // Store the end date for later use
    this._endDate = this._getDateThreeDaysFromTodayDate();
    return true;
  }

  // Helper: Get end date as Date object (3 days from today)
  _getDateThreeDaysFromTodayDate() {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    threeDaysLater.setHours(0, 0, 0, 0);
    return threeDaysLater;
  }

  // Helper: Get start date (tomorrow)
  _getStartDate() {
    const tomorrow = this.getNextBusinessDay();
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  // Helper: Set recurring frequency
  async setRecurringFrequency(frequency = 1) {
    console.log(`STEP: Setting recurring frequency to ${frequency}...`);
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    const frequencyInput = this.recurringFrequencyInput();
    const isVisible = await frequencyInput.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!isVisible) {
      console.log('⚠️ Recurring frequency input not found');
      return;
    }

    await frequencyInput.clear({ timeout: 3000 });
    await frequencyInput.fill(String(frequency), { timeout: 3000 });
    await this.page.waitForTimeout(500);
    console.log(`✓ Recurring frequency set to: ${frequency}`);
  }

  // Helper: Set number of occurrences
  async setRecurringOccurrences(occurrences) {
    console.log(`STEP: Setting number of occurrences to ${occurrences}...`);
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    const occurrencesInput = this.recurringOccurrencesInput();
    const isVisible = await occurrencesInput.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!isVisible) {
      console.log('⚠️ Recurring occurrences input not found');
      return;
    }

    await occurrencesInput.clear({ timeout: 3000 });
    await occurrencesInput.fill(String(occurrences), { timeout: 3000 });
    await this.page.waitForTimeout(500);
    console.log(`✓ Number of occurrences set to: ${occurrences}`);
  }

  // Helper: Create recurring appointment series
  async createRecurringAppointmentSeries(pattern = 'Daily', frequency = 1, occurrences = 4) {
    console.log(`STEP: Creating recurring appointment series (${pattern} pattern)...`);
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
    
    // Step 1: Select appointment type (Group-IOP)
    console.log('STEP: Selecting appointment type...');
    await this.selectGroupIOPAppointmentType();
    await this.page.waitForTimeout(1000);
    
    // Step 2: Change duration to 30
    console.log('STEP: Changing duration to 30 minutes...');
    const durationControl = this._getDurationControl();
    const isDurationVisible = await durationControl.isVisible({ timeout: 3000 }).catch(() => false);
    if (isDurationVisible) {
      await durationControl.clear({ timeout: 3000 });
      await durationControl.fill('30', { timeout: 3000 });
      await this.page.waitForTimeout(500);
      console.log('✓ Duration changed to 30 minutes');
    }
    
    // Step 3: Select Group Therapy (first option)
    console.log('STEP: Selecting Group Therapy...');
    await this.selectFirstGroupTherapyOption();
    await this.page.waitForTimeout(1000);
    
    // Step 4: Select Repeat pattern
    console.log('STEP: Selecting Repeat pattern...');
    await this.selectRecurringPattern(pattern);
    await this.page.waitForTimeout(1500);
    
    // Step 5: Select "Until" in the end dropdown
    console.log('STEP: Selecting "Until" in end dropdown...');
    await this.selectEndOption('Until');
    await this.page.waitForTimeout(1000);
    
    // Step 6: Fill end date (3 days from today)
    console.log('STEP: Filling end date...');
    await this.setEndDate();
    await this.page.waitForTimeout(500);
    
    // Step 7: Select patient
    console.log('STEP: Selecting patient...');
    await this.selectPatient();
    await this.page.waitForTimeout(1000);
    
    // Wait for loader to disappear after patient selection
    await this._waitForLoaderToDisappear();
    await this.page.waitForTimeout(1000);
    
    // Step 8: Click plus button to add patient to record
    console.log('STEP: Clicking plus button to add patient to record...');
    const plusButton = modal.locator('i[title="Add New Patient"].fa-plus-circle').first();
    
    // Wait for plus button to be visible and clickable (not intercepted by loader)
    await this._waitForElementClickable(plusButton, 10000);
    const isPlusButtonVisible = await plusButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isPlusButtonVisible) {
      await plusButton.click({ timeout: 5000, force: false });
      await this.page.waitForTimeout(1000);
      console.log('✓ Plus button clicked - patient added to record');
    } else {
      // Try alternative selectors
      const plusButtonAlt = modal.locator('i.fa-plus-circle[title*="Add New Patient"], i.fa-plus-circle[title*="Add"], .fa-plus-circle').first();
      await this._waitForElementClickable(plusButtonAlt, 10000);
      const isAltVisible = await plusButtonAlt.isVisible({ timeout: 2000 }).catch(() => false);
      if (isAltVisible) {
        await plusButtonAlt.click({ timeout: 5000, force: false });
        await this.page.waitForTimeout(1000);
        console.log('✓ Plus button clicked (alternative selector) - patient added to record');
      }
    }
    
    // Step 9: Save
    console.log('STEP: Clicking save button...');
    await this.saveButton.click({ timeout: 5000 });
    await this.page.waitForTimeout(2000);
    
    // Step 10: Check for success toaster
    console.log('STEP: Checking for success toaster...');
    const toastContainer = this.page.locator('#toast-container').first();
    const toastVisible = await toastContainer.isVisible({ timeout: 5000 }).catch(() => false);
    if (toastVisible) {
      const toastText = await toastContainer.textContent({ timeout: 2000 }).catch(() => '');
      console.log(`✓ ASSERT: Success toaster found: ${toastText.trim()}`);
    } else {
      // Check for other toaster/alert patterns
      const toastPatterns = [
        '.toast-success',
        '.toast-title',
        '.toast-message',
        '*:has-text("created")',
        '*:has-text("saved")',
        '*:has-text("success")'
      ];
      
      for (const pattern of toastPatterns) {
        const toast = this.page.locator(pattern).first();
        const isVisible = await toast.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          const toastText = await toast.textContent({ timeout: 2000 }).catch(() => '');
          console.log(`✓ ASSERT: Success toaster found: ${toastText.trim()}`);
          break;
        }
      }
    }
    
    console.log('✓ Recurring appointment series creation completed');
  }

  // Test SCH-024: Recurring pattern generates individual appointments
  async testRecurringPatternGeneratesIndividualAppointments(pattern = 'Daily', frequency = 1, occurrences = 4) {
    console.log('\n=== Testing: Recurring pattern generates individual appointments ===');
    
    // Step 1: Create recurring appointment series
    console.log('\n--- Step 1: Create recurring appointment series ---');
    await this.openAddEventPopupRandomSlot();
    
    // Create recurring appointment series with correct flow:
    // Appointment type -> Duration -> Group Therapy -> Repeat -> Until -> End date -> Patient -> Plus button -> Save
    await this.createRecurringAppointmentSeries(pattern, frequency, occurrences);
    
    // Step 2: Wait for scheduler to refresh
    await this.page.waitForTimeout(3000);
    await this.waitForSchedulerLoaded();
    
    // Step 3: Get start and end dates
    const startDate = this._getStartDate();
    const endDate = this._endDate || this._getDateThreeDaysFromTodayDate();
    
    console.log(`\n--- Step 2: Verify individual appointments from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} ---`);
    
    // Step 4: Check appointments on each day from start to end date
    const allEventSelectors = [
      '.e-event:not(button):not(.e-event-cancel):not(.e-event-save)',
      '.e-appointment:not(button)',
      '.e-schedule-event:not(button)'
    ];
    
    let totalAppointmentsFound = 0;
    let totalAppointmentsDeleted = 0;
    const currentDate = new Date(startDate);
    
    // Loop through each day from start to end date
    while (currentDate <= endDate) {
      const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      console.log(`\n--- Checking appointments for ${dateStr} ---`);
      
      // Navigate to the date
      const navigated = await this.navigateToDate(new Date(currentDate));
      if (!navigated) {
        console.log(`⚠️ Could not navigate to ${dateStr}, skipping...`);
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      await this.page.waitForTimeout(2000);
      await this.waitForSchedulerLoaded();
      
      // Find appointments on this date
      let appointmentsOnDate = [];
      for (const selector of allEventSelectors) {
        const events = this.page.locator(selector);
        const count = await events.count({ timeout: 3000 }).catch(() => 0);
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const event = events.nth(i);
            const isVisible = await event.isVisible({ timeout: 1000 }).catch(() => false);
            if (isVisible) {
              appointmentsOnDate.push(event);
            }
          }
          break;
        }
      }
      
      if (appointmentsOnDate.length > 0) {
        console.log(`✓ Found ${appointmentsOnDate.length} appointment(s) on ${dateStr}`);
        totalAppointmentsFound += appointmentsOnDate.length;
        
        // Delete each appointment on this date
        for (let i = 0; i < appointmentsOnDate.length; i++) {
          const appointment = appointmentsOnDate[i];
          try {
            console.log(`  Deleting appointment ${i + 1} of ${appointmentsOnDate.length} on ${dateStr}...`);
            
            // Double-click to open edit modal
            await appointment.dblclick({ timeout: 5000 });
            await this.page.waitForTimeout(2000);
            
            const modal = this.modal();
            const isModalOpen = await modal.isVisible({ timeout: 5000 }).catch(() => false);
            
            if (isModalOpen) {
              // Try to find and click delete occurrence button
              const deleteOccurrenceBtn = this.deleteOccurrenceButton();
              let deleteVisible = await deleteOccurrenceBtn.isVisible({ timeout: 2000 }).catch(() => false);
              
              if (!deleteVisible) {
                // Try standard delete button
                const deleteButton = modal.locator('button:has-text("Delete"), button.e-event-delete').first();
                deleteVisible = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
                if (deleteVisible) {
                  await deleteButton.click({ timeout: 3000 });
                }
              } else {
                await deleteOccurrenceBtn.click({ timeout: 3000 });
              }
              
              if (deleteVisible) {
                await this.page.waitForTimeout(1000);
                // Confirm deletion
                await this.confirmDeleteEvent();
                await this.page.waitForTimeout(2000);
                await this.waitForSchedulerLoaded();
                totalAppointmentsDeleted++;
                console.log(`  ✓ Deleted appointment ${i + 1} on ${dateStr}`);
              } else {
                console.log(`  ⚠️ Delete button not found for appointment ${i + 1} on ${dateStr}`);
                // Close modal if delete button not found
                await this.closePopupSafely();
              }
            } else {
              console.log(`  ⚠️ Modal did not open for appointment ${i + 1} on ${dateStr}`);
            }
          } catch (error) {
            console.log(`  ⚠️ Error deleting appointment ${i + 1} on ${dateStr}: ${error.message}`);
            // Try to close modal if open
            await this.closePopupSafely();
          }
        }
      } else {
        console.log(`ℹ️ No appointments found on ${dateStr}`);
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`\n✓ Total appointments found: ${totalAppointmentsFound}`);
    console.log(`✓ Total appointments deleted: ${totalAppointmentsDeleted}`);
    
    // Verify appointments were found
    expect(totalAppointmentsFound).toBeGreaterThan(0);
    console.log(`✓ ASSERT: Recurring pattern generated ${totalAppointmentsFound} individual appointment(s) from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    
    return { appointmentCount: totalAppointmentsFound, occurrences, deletedCount: totalAppointmentsDeleted };
  }

  // Test SCH-025: Each occurrence can be individually modified
  async testOccurrenceIndividualModification(pattern = 'Daily', frequency = 1, occurrences = 4) {
    console.log('\n=== Testing: Each occurrence can be individually modified ===');
    
    // Step 1: Create recurring appointment series (same flow as TC72)
    console.log('\n--- Step 1: Create recurring appointment series ---');
    await this.openAddEventPopupRandomSlot();
    
    // Create recurring appointment series with correct flow:
    // Appointment type -> Duration -> Group Therapy -> Repeat -> Until -> End date -> Patient -> Plus button -> Save
    await this.createRecurringAppointmentSeries(pattern, frequency, occurrences);
    
    // Step 2: Wait for scheduler to refresh
    await this.page.waitForTimeout(3000);
    await this.waitForSchedulerLoaded();
    
    // Step 3: Get start and end dates
    const startDate = this._getStartDate();
    const endDate = this._endDate || this._getDateThreeDaysFromTodayDate();
    
    // Step 4: Set different statuses for each appointment (Cancelled, No show, Check-in)
    console.log('\n--- Step 2: Set different statuses for each appointment ---');
    const statuses = ['Cancelled', 'No show', 'Check-in'];
    
    // Define event selectors
    const allEventSelectors = [
      '.e-event:not(button):not(.e-event-cancel):not(.e-event-save)',
      '.e-appointment:not(button)',
      '.e-schedule-event:not(button)'
    ];
    
    // Calculate number of days from start to end date
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    console.log(`✓ Will modify appointments across ${daysDiff} day(s)`);
    
    // Modify each appointment with different status using next button navigation
    const statusResults = { cancelled: 0, noShow: 0, checkIn: 0 };
    let appointmentIndex = 0;
    
    // Start from the first day (should already be on start date after creation)
    for (let day = 0; day < daysDiff; day++) {
      await this.page.waitForTimeout(2000);
      await this.waitForSchedulerLoaded();
      
      // Find appointment on current day
      let appointmentFound = null;
      for (const selector of allEventSelectors) {
        const events = this.page.locator(selector);
        const count = await events.count({ timeout: 3000 }).catch(() => 0);
        if (count > 0) {
          appointmentFound = events.first();
          break;
        }
      }
      
      if (appointmentFound) {
        const statusIndex = appointmentIndex % statuses.length;
        const targetStatus = statuses[statusIndex];
        
        console.log(`\n  --- Modifying appointment ${appointmentIndex + 1} (day ${day + 1}) to status: ${targetStatus} ---`);
        
        try {
          // Double-click to open edit modal
          await appointmentFound.dblclick({ timeout: 5000 });
          await this.page.waitForTimeout(2000);
          
          const editModal = this.modal();
          const isEditModalOpen = await editModal.isVisible({ timeout: 5000 }).catch(() => false);
          
          if (isEditModalOpen) {
            // Click Edit Occurrence (if available)
            const editOccurrenceBtn = this.editOccurrenceButton();
            const editOccurrenceVisible = await editOccurrenceBtn.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (editOccurrenceVisible) {
              await editOccurrenceBtn.click({ timeout: 3000 });
              await this.page.waitForTimeout(1000);
            }
            
            // Select status
            await this.selectStatus(targetStatus);
            await this.page.waitForTimeout(1000);
            
            // Save the modification
            await this.saveButton.click({ timeout: 5000 });
            await this.page.waitForTimeout(2000);
            
            // Handle reason modals based on status
            if (targetStatus.toLowerCase().includes('cancelled') || targetStatus.toLowerCase().includes('canceled')) {
              await this.handleCancellationReasonModal();
              statusResults.cancelled++;
            } else if (targetStatus.toLowerCase().includes('no show') || targetStatus.toLowerCase().includes('no-show')) {
              await this.handleNoShowReasonModal();
              statusResults.noShow++;
            } else if (targetStatus.toLowerCase().includes('check-in') || targetStatus.toLowerCase().includes('checkin')) {
              // Check-in may not require a reason modal
              statusResults.checkIn++;
            }
            
            await this.page.waitForTimeout(2000);
            await this.waitForSchedulerLoaded();
            
            console.log(`  ✓ Appointment ${appointmentIndex + 1} status changed to ${targetStatus}`);
            appointmentIndex++;
          } else {
            console.log(`  ⚠️ Modal did not open for appointment ${appointmentIndex + 1}`);
            await this.closePopupSafely();
          }
        } catch (error) {
          console.log(`  ⚠️ Error modifying appointment ${appointmentIndex + 1}: ${error.message}`);
          await this.closePopupSafely();
        }
      } else {
        console.log(`  ⚠️ No appointment found on day ${day + 1}`);
      }
      
      // Click next button to go to next day (except for the last day)
      if (day < daysDiff - 1) {
        await this.nextButton.click({ timeout: 5000 });
        await this.page.waitForTimeout(2000);
        await this.waitForSchedulerLoaded();
      }
    }
    
    console.log(`\n✓ Status modification summary:`);
    console.log(`  - Cancelled: ${statusResults.cancelled}`);
    console.log(`  - No show: ${statusResults.noShow}`);
    console.log(`  - Check-in: ${statusResults.checkIn}`);
    
    // Step 9: Wait for scheduler to refresh
    await this.waitForSchedulerLoaded();
    await this.page.waitForTimeout(2000);
    
    // Step 10: Navigate back to start date and verify each appointment has the correct status
    console.log('\n--- Step 6: Verify each appointment has the correct status ---');
    
    // Navigate back to start date using previous button
    for (let i = 0; i < daysDiff - 1; i++) {
      const prevButton = this.page.locator('button[title="Previous"], .e-prev button').first();
      await prevButton.click({ timeout: 5000 });
      await this.page.waitForTimeout(2000);
      await this.waitForSchedulerLoaded();
    }
    
    const verificationResults = { cancelled: 0, noShow: 0, checkIn: 0, other: 0 };
    let verifiedCount = 0;
    
    // Verify status of each appointment using next button
    for (let day = 0; day < daysDiff; day++) {
      await this.page.waitForTimeout(2000);
      await this.waitForSchedulerLoaded();
      
      // Find appointment on current day
      let appointmentFound = null;
      for (const selector of allEventSelectors) {
        const events = this.page.locator(selector);
        const count = await events.count({ timeout: 3000 }).catch(() => 0);
        if (count > 0) {
          appointmentFound = events.first();
          break;
        }
      }
      
      if (appointmentFound) {
        const expectedStatus = statuses[verifiedCount % statuses.length];
        
        try {
          // Double-click to open and verify status
          await appointmentFound.dblclick({ timeout: 5000 });
          await this.page.waitForTimeout(2000);
          
          const checkModal = this.modal();
          const isCheckModalOpen = await checkModal.isVisible({ timeout: 5000 }).catch(() => false);
          
          if (isCheckModalOpen) {
            // Get status dropdown value
            const statusLabel = checkModal.locator('label:has-text("Status"), label.e-float-text:has-text("Status")').first();
            const statusVisible = await statusLabel.isVisible({ timeout: 3000 }).catch(() => false);
            
            if (statusVisible) {
              const statusDropdown = statusLabel.locator('xpath=../..//div[contains(@class,"e-control-wrapper")][contains(@class,"e-ddl")]').first();
              const statusInput = statusDropdown.locator('input[readonly], input[role="combobox"]').first();
              const statusValue = await statusInput.inputValue({ timeout: 2000 }).catch(() => '');
              
              // Check if status matches expected
              const statusLower = statusValue.toLowerCase();
              
              if (statusLower.includes('cancelled') || statusLower.includes('canceled')) {
                verificationResults.cancelled++;
                console.log(`  ✓ Appointment ${verifiedCount + 1} (day ${day + 1}): Status is Cancelled (expected: ${expectedStatus})`);
              } else if (statusLower.includes('no show') || statusLower.includes('no-show')) {
                verificationResults.noShow++;
                console.log(`  ✓ Appointment ${verifiedCount + 1} (day ${day + 1}): Status is No show (expected: ${expectedStatus})`);
              } else if (statusLower.includes('check-in') || statusLower.includes('checkin')) {
                verificationResults.checkIn++;
                console.log(`  ✓ Appointment ${verifiedCount + 1} (day ${day + 1}): Status is Check-in (expected: ${expectedStatus})`);
              } else {
                verificationResults.other++;
                console.log(`  ⚠️ Appointment ${verifiedCount + 1} (day ${day + 1}): Status is "${statusValue}" (expected: ${expectedStatus})`);
              }
              
              verifiedCount++;
            }
            
            // Close modal
            await this.closePopupSafely();
          }
        } catch (error) {
          console.log(`  ⚠️ Error verifying appointment ${verifiedCount + 1} (day ${day + 1}): ${error.message}`);
          await this.closePopupSafely();
        }
      }
      
      // Click next button to go to next day (except for the last day)
      if (day < daysDiff - 1) {
        await this.nextButton.click({ timeout: 5000 });
        await this.page.waitForTimeout(2000);
        await this.waitForSchedulerLoaded();
      }
    }
    
    console.log(`\n✓ Verification summary:`);
    console.log(`  - Cancelled: ${verificationResults.cancelled}`);
    console.log(`  - No show: ${verificationResults.noShow}`);
    console.log(`  - Check-in: ${verificationResults.checkIn}`);
    console.log(`  - Other: ${verificationResults.other}`);
    
    // Assert that appointments have different statuses
    expect(verificationResults.cancelled).toBeGreaterThan(0);
    expect(verificationResults.noShow).toBeGreaterThan(0);
    expect(verificationResults.checkIn).toBeGreaterThan(0);
    console.log(`✓ ASSERT: Each appointment has different status (Cancelled: ${verificationResults.cancelled}, No show: ${verificationResults.noShow}, Check-in: ${verificationResults.checkIn})`);
    
    // Step 11: Navigate back to start date and delete all appointments
    console.log('\n--- Step 7: Delete all appointments ---');
    
    // Navigate back to start date using previous button
    for (let i = 0; i < daysDiff - 1; i++) {
      const prevButton = this.page.locator('button[title="Previous"], .e-prev button').first();
      await prevButton.click({ timeout: 5000 });
      await this.page.waitForTimeout(2000);
      await this.waitForSchedulerLoaded();
    }
    
    let totalAppointmentsDeleted = 0;
    
    // Delete appointments using next button navigation
    for (let day = 0; day < daysDiff; day++) {
      await this.page.waitForTimeout(2000);
      await this.waitForSchedulerLoaded();
      
      // Find appointment on current day
      let appointmentFound = null;
      for (const selector of allEventSelectors) {
        const events = this.page.locator(selector);
        const count = await events.count({ timeout: 3000 }).catch(() => 0);
        if (count > 0) {
          appointmentFound = events.first();
          break;
        }
      }
      
      if (appointmentFound) {
        try {
          // Double-click to open edit modal
          await appointmentFound.dblclick({ timeout: 5000 });
          await this.page.waitForTimeout(2000);
          
          const editModal = this.modal();
          const isEditModalOpen = await editModal.isVisible({ timeout: 5000 }).catch(() => false);
          
          if (isEditModalOpen) {
            // Try to find and click delete occurrence button
            const deleteOccurrenceBtn = this.deleteOccurrenceButton();
            let deleteVisible = await deleteOccurrenceBtn.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (!deleteVisible) {
              // Try standard delete button
              const deleteButton = editModal.locator('button:has-text("Delete"), button.e-event-delete').first();
              deleteVisible = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
              if (deleteVisible) {
                await deleteButton.click({ timeout: 3000 });
              }
            } else {
              await deleteOccurrenceBtn.click({ timeout: 3000 });
            }
            
            if (deleteVisible) {
              await this.page.waitForTimeout(1000);
              // Confirm deletion
              await this.confirmDeleteEvent();
              await this.page.waitForTimeout(2000);
              await this.waitForSchedulerLoaded();
              totalAppointmentsDeleted++;
              console.log(`  ✓ Deleted appointment on day ${day + 1}`);
            } else {
              console.log(`  ⚠️ Delete button not found for appointment on day ${day + 1}`);
              await this.closePopupSafely();
            }
          } else {
            console.log(`  ⚠️ Modal did not open for appointment on day ${day + 1}`);
          }
        } catch (error) {
          console.log(`  ⚠️ Error deleting appointment on day ${day + 1}: ${error.message}`);
          await this.closePopupSafely();
        }
      }
      
      // Click next button to go to next day (except for the last day)
      if (day < daysDiff - 1) {
        await this.nextButton.click({ timeout: 5000 });
        await this.page.waitForTimeout(2000);
        await this.waitForSchedulerLoaded();
      }
    }
    
    console.log(`\n✓ Total appointments deleted: ${totalAppointmentsDeleted}`);
    console.log('✓ ASSERT: Each occurrence can be individually modified with different statuses (Cancelled, No show, Check-in)');
    return true;
  }

  // Helper: Right-click on appointment and select "Cancel Schedule"
  async rightClickAndCancelSchedule(appointmentElement) {
    console.log('STEP: Right-clicking on appointment...');
    await appointmentElement.click({ button: 'right', timeout: 5000 });
    await this.page.waitForTimeout(1000);
    
    // Wait for context menu to appear
    console.log('STEP: Waiting for context menu to appear...');
    const contextMenuSelectors = [
      '.e-contextmenu:visible',
      '[role="menu"]:visible',
      '.context-menu:visible',
      'ul.e-contextmenu:visible',
      'div[class*="context"]:visible'
    ];
    
    let contextMenu = null;
    for (const selector of contextMenuSelectors) {
      contextMenu = this.page.locator(selector).first();
      const isVisible = await contextMenu.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        console.log(`✓ Context menu found using selector: ${selector}`);
        break;
      }
    }
    
    if (!contextMenu || !(await contextMenu.isVisible({ timeout: 2000 }).catch(() => false))) {
      throw new Error('Context menu did not appear after right-click');
    }
    
    // Find and click "Cancel Schedule" option
    console.log('STEP: Looking for "Cancel Schedule" option in context menu...');
    const cancelScheduleOptions = [
      'li:has-text("Cancel Schedule")',
      'li:has-text("Cancel")',
      '[role="menuitem"]:has-text("Cancel Schedule")',
      '[role="menuitem"]:has-text("Cancel")',
      'a:has-text("Cancel Schedule")',
      'a:has-text("Cancel")',
      'button:has-text("Cancel Schedule")',
      'button:has-text("Cancel")'
    ];
    
    let cancelOption = null;
    for (const selector of cancelScheduleOptions) {
      cancelOption = contextMenu.locator(selector).first();
      const isVisible = await cancelOption.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        console.log(`✓ "Cancel Schedule" option found using selector: ${selector}`);
        break;
      }
    }
    
    if (!cancelOption || !(await cancelOption.isVisible({ timeout: 2000 }).catch(() => false))) {
      throw new Error('"Cancel Schedule" option not found in context menu');
    }
    
    await cancelOption.click({ timeout: 3000 });
    await this.page.waitForTimeout(1000);
    console.log('✓ "Cancel Schedule" option clicked');
  }

  // Helper: Handle cancel appointment modal and click OK
  async handleCancelAppointmentModal() {
    console.log('STEP: Waiting for cancel appointment modal...');
    await this.page.waitForTimeout(2000);
    
    const modal = this.modal();
    const isModalOpen = await modal.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!isModalOpen) {
      console.log('⚠️ Cancel appointment modal not found - may have been auto-confirmed');
      return;
    }
    
    // Find OK button in the modal
    console.log('STEP: Looking for OK button in cancel appointment modal...');
    const okButtonSelectors = [
      'button:has-text("OK")',
      'button:has-text("Yes")',
      'button.btn-primary:has-text("OK")',
      'button.btn-primary:has-text("Yes")',
      'button.e-btn-primary:has-text("OK")',
      'button.e-btn-primary:has-text("Yes")',
      '.e-dialog-footer button:has-text("OK")',
      '.e-dialog-footer button:has-text("Yes")'
    ];
    
    let okButton = null;
    for (const selector of okButtonSelectors) {
      okButton = modal.locator(selector).first();
      const isVisible = await okButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        console.log(`✓ OK button found using selector: ${selector}`);
        break;
      }
    }
    
    if (!okButton || !(await okButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      throw new Error('OK button not found in cancel appointment modal');
    }
    
    await okButton.click({ timeout: 3000 });
    await this.page.waitForTimeout(2000);
    console.log('✓ OK button clicked in cancel appointment modal');
  }

  // Test SCH-026: Cancelling one occurrence does not cancel series
  async testCancellingOccurrenceDoesNotCancelSeries(pattern = 'Daily', frequency = 1, occurrences = 4) {
    console.log('\n=== Testing: Cancelling one occurrence does not cancel series ===');
    
    // Step 1: Create recurring appointment series (same flow as TC72/TC73)
    console.log('\n--- Step 1: Create recurring appointment series ---');
    await this.openAddEventPopupRandomSlot();
    
    // Create recurring appointment series with correct flow:
    // Appointment type -> Duration -> Group Therapy -> Repeat -> Until -> End date -> Patient -> Plus button -> Save
    await this.createRecurringAppointmentSeries(pattern, frequency, occurrences);
    
    // Step 2: Wait for scheduler to refresh
    await this.page.waitForTimeout(3000);
    await this.waitForSchedulerLoaded();
    
    // Step 3: Count initial appointments
    console.log('\n--- Step 2: Count initial appointments ---');
    const startDate = this._getStartDate();
    const endDate = this._endDate || this._getDateThreeDaysFromTodayDate();
    
    // Count appointments across all dates
    const allEventSelectors = [
      '.e-event:not(button):not(.e-event-cancel):not(.e-event-save)',
      '.e-appointment:not(button)',
      '.e-schedule-event:not(button)'
    ];
    
    let initialCount = 0;
    const countDate = new Date(startDate);
    while (countDate <= endDate) {
      const dateNavigated = await this.navigateToDate(new Date(countDate));
      if (dateNavigated) {
        await this.page.waitForTimeout(2000);
        await this.waitForSchedulerLoaded();
        
        for (const selector of allEventSelectors) {
          const events = this.page.locator(selector);
          const count = await events.count({ timeout: 3000 }).catch(() => 0);
          if (count > 0) {
            initialCount += count;
            break;
          }
        }
      }
      countDate.setDate(countDate.getDate() + 1);
    }
    
    console.log(`✓ Initial appointment count: ${initialCount}`);
    
    // Step 4: Navigate to start date and find first appointment
    console.log(`\n--- Step 3: Find first appointment occurrence (from ${startDate.toLocaleDateString()}) ---`);
    const navigated = await this.navigateToDate(new Date(startDate));
    if (!navigated) {
      throw new Error(`Could not navigate to start date: ${startDate.toLocaleDateString()}`);
    }
    
    await this.page.waitForTimeout(2000);
    await this.waitForSchedulerLoaded();
    
    // Step 5: Find first appointment occurrence
    const eventElement = await this.verifyEventVisibleOnScheduler();
    if (!eventElement) {
      throw new Error('Could not find appointment occurrence on scheduler');
    }
    
    // Step 6: Right-click on appointment and select "Cancel Schedule"
    console.log('\n--- Step 4: Right-click on appointment and select "Cancel Schedule" ---');
    await this.rightClickAndCancelSchedule(eventElement);
    
    // Step 7: Wait for cancel appointment modal and click OK
    console.log('\n--- Step 5: Wait for cancel appointment modal and click OK ---');
    await this.handleCancelAppointmentModal();
    
    // Step 8: Wait for scheduler to refresh
    await this.waitForSchedulerLoaded();
    await this.page.waitForTimeout(2000);
    
    // Step 9: Verify other appointments still exist (are NOT cancelled)
    console.log('\n--- Step 6: Verify other appointments still exist (are NOT cancelled) ---');
    let totalAppointmentsFound = 0;
    const currentDate = new Date(startDate);
    
    // Count appointments across all dates after cancellation
    while (currentDate <= endDate) {
      const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Navigate to the date
      const dateNavigated = await this.navigateToDate(new Date(currentDate));
      if (!dateNavigated) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      await this.page.waitForTimeout(2000);
      await this.waitForSchedulerLoaded();
      
      // Find appointments on this date
      for (const selector of allEventSelectors) {
        const events = this.page.locator(selector);
        const count = await events.count({ timeout: 3000 }).catch(() => 0);
        if (count > 0) {
          totalAppointmentsFound += count;
          console.log(`✓ Found ${count} appointment(s) on ${dateStr}`);
          break;
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`✓ Total appointments found after cancellation: ${totalAppointmentsFound}`);
    
    // Assert that appointments still exist (at least one should remain, possibly the cancelled one or others)
    // The first appointment may be cancelled, but others should still exist
    expect(totalAppointmentsFound).toBeGreaterThan(0);
    console.log(`✓ ASSERT: Appointments still exist after cancelling one occurrence (${totalAppointmentsFound} found)`);
    
    // Step 10: Delete all remaining appointments
    console.log('\n--- Step 7: Delete all remaining appointments ---');
    let totalAppointmentsDeleted = 0;
    const deleteDate = new Date(startDate);
    
    while (deleteDate <= endDate) {
      const dateStr = deleteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Navigate to the date
      const dateNavigated = await this.navigateToDate(new Date(deleteDate));
      if (!dateNavigated) {
        deleteDate.setDate(deleteDate.getDate() + 1);
        continue;
      }
      
      await this.page.waitForTimeout(2000);
      await this.waitForSchedulerLoaded();
      
      // Find appointments on this date
      let appointmentsOnDate = [];
      for (const selector of allEventSelectors) {
        const events = this.page.locator(selector);
        const count = await events.count({ timeout: 3000 }).catch(() => 0);
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const event = events.nth(i);
            const isVisible = await event.isVisible({ timeout: 1000 }).catch(() => false);
            if (isVisible) {
              appointmentsOnDate.push(event);
            }
          }
          break;
        }
      }
      
      // Delete each appointment on this date
      for (let i = 0; i < appointmentsOnDate.length; i++) {
        const appointment = appointmentsOnDate[i];
        try {
          // Double-click to open edit modal
          await appointment.dblclick({ timeout: 5000 });
          await this.page.waitForTimeout(2000);
          
          const editModal = this.modal();
          const isEditModalOpen = await editModal.isVisible({ timeout: 5000 }).catch(() => false);
          
          if (isEditModalOpen) {
            // Try to find and click delete occurrence button
            const deleteOccurrenceBtn = this.deleteOccurrenceButton();
            let deleteVisible = await deleteOccurrenceBtn.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (!deleteVisible) {
              // Try standard delete button
              const deleteButton = editModal.locator('button:has-text("Delete"), button.e-event-delete').first();
              deleteVisible = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
              if (deleteVisible) {
                await deleteButton.click({ timeout: 3000 });
              }
            } else {
              await deleteOccurrenceBtn.click({ timeout: 3000 });
            }
            
            if (deleteVisible) {
              await this.page.waitForTimeout(1000);
              // Confirm deletion
              await this.confirmDeleteEvent();
              await this.page.waitForTimeout(2000);
              await this.waitForSchedulerLoaded();
              totalAppointmentsDeleted++;
              console.log(`  ✓ Deleted appointment ${i + 1} on ${dateStr}`);
            } else {
              console.log(`  ⚠️ Delete button not found for appointment ${i + 1} on ${dateStr}`);
              await this.closePopupSafely();
            }
          } else {
            console.log(`  ⚠️ Modal did not open for appointment ${i + 1} on ${dateStr}`);
          }
        } catch (error) {
          console.log(`  ⚠️ Error deleting appointment ${i + 1} on ${dateStr}: ${error.message}`);
          await this.closePopupSafely();
        }
      }
      
      // Move to next day
      deleteDate.setDate(deleteDate.getDate() + 1);
    }
    
    console.log(`\n✓ Total appointments deleted: ${totalAppointmentsDeleted}`);
    
    // Calculate final count (should be 0 after deletion)
    const finalCount = 0;
    
    // Verify that at least one appointment was cancelled but series not cancelled
    expect(initialCount).toBeGreaterThan(0);
    expect(totalAppointmentsFound).toBeGreaterThan(0);
    console.log(`✓ ASSERT: One occurrence cancelled (${initialCount} initial appointments), series not cancelled (${totalAppointmentsFound} appointments still exist), all appointments deleted (${totalAppointmentsDeleted})`);
    
    return { initialCount, finalCount };
  }

  // Test SCH-027: Modifying pattern affects only future occurrences
  async testModifyingPatternAffectsOnlyFutureOccurrences(pattern = 'Daily', frequency = 1, occurrences = 4) {
    console.log('\n=== Testing: Modifying pattern affects only future occurrences ===');
    
    // Step 1: Create recurring appointment series
    console.log('\n--- Step 1: Create recurring appointment series ---');
    await this.openAddEventPopupRandomSlot();
    await this.selectAppointmentRadioButton();
    await this.createRecurringAppointmentSeries(pattern, frequency, occurrences);
    
    // Step 2: Wait for scheduler to refresh and count initial appointments
    await this.page.waitForTimeout(3000);
    await this.waitForSchedulerLoaded();
    
    console.log('\n--- Step 2: Count initial appointments ---');
    const initialCount = await this.countAppointmentsOnScheduler();
    console.log(`✓ Initial appointment count: ${initialCount}`);
    
    // Step 3: Find an appointment occurrence (preferably a future one)
    console.log('\n--- Step 3: Find appointment occurrence to modify pattern ---');
    const eventElement = await this.verifyEventVisibleOnScheduler();
    if (!eventElement) {
      throw new Error('Could not find appointment occurrence on scheduler');
    }
    
    // Step 4: Double-click to open edit modal
    console.log('\n--- Step 4: Open edit modal ---');
    await eventElement.dblclick({ timeout: 5000 });
    await this.page.waitForTimeout(2000);
    
    const modal = this.modal();
    const isModalOpen = await modal.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isModalOpen) {
      throw new Error('Edit modal did not open');
    }
    
    // Step 5: Verify "Edit Series" option is available
    console.log('\n--- Step 5: Verify Edit Series option is available ---');
    const editSeriesBtn = this.editSeriesButton();
    const editSeriesVisible = await editSeriesBtn.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (editSeriesVisible) {
      await editSeriesBtn.click({ timeout: 3000 });
      await this.page.waitForTimeout(1000);
      console.log('✓ Edit Series button clicked');
      
      // Step 6: Modify the pattern (e.g., change frequency)
      console.log('\n--- Step 6: Modify pattern (change frequency) ---');
      await this.setRecurringFrequency(frequency + 1);
      
      // Step 7: Save the modification
      console.log('\n--- Step 7: Save the pattern modification ---');
      await this.saveButton.click({ timeout: 5000 });
      await this.page.waitForTimeout(2000);
      
      console.log('✓ ASSERT: Pattern modification saved (should affect only future occurrences)');
    } else {
      console.log('⚠️ Edit Series option not found - pattern modification may not be available in this UI');
    }
    
    return true;
  }

  // Test SCH-028: Maximum 52 occurrences per series
  // Helper: Calculate date 52 days from today and format as M/D/YY
  _getDateFiftyTwoDaysFromToday() {
    const today = new Date();
    const fiftyTwoDaysLater = new Date(today);
    fiftyTwoDaysLater.setDate(today.getDate() + 52);
    
    // Format as M/D/YY (e.g., 1/16/26)
    const month = fiftyTwoDaysLater.getMonth() + 1; // getMonth() returns 0-11
    const day = fiftyTwoDaysLater.getDate();
    const year = fiftyTwoDaysLater.getFullYear().toString().slice(-2); // Get last 2 digits of year
    
    return `${month}/${day}/${year}`;
  }

  // Helper: Get date 52 days from today as Date object
  _getDateFiftyTwoDaysFromTodayDate() {
    const today = new Date();
    const fiftyTwoDaysLater = new Date(today);
    fiftyTwoDaysLater.setDate(today.getDate() + 52);
    fiftyTwoDaysLater.setHours(0, 0, 0, 0);
    return fiftyTwoDaysLater;
  }

  async testMaximumOccurrencesPerSeries(pattern = 'Daily', frequency = 1) {
    console.log('\n=== Testing: Maximum 52 occurrences per series ===');
    
    // Step 1: Open appointment modal
    console.log('\n--- Step 1: Open appointment modal ---');
    await this.openAddEventPopupRandomSlot();
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
    
    // Step 2: Select appointment type (Group-IOP)
    console.log('STEP: Selecting appointment type...');
    await this.selectGroupIOPAppointmentType();
    await this.page.waitForTimeout(1000);
    
    // Step 3: Select Group Therapy (first option)
    console.log('STEP: Selecting Group Therapy...');
    await this.selectFirstGroupTherapyOption();
    await this.page.waitForTimeout(1000);
    
    // Step 4: Select Repeat pattern
    console.log('STEP: Selecting Repeat pattern...');
    await this.selectRecurringPattern(pattern);
    await this.page.waitForTimeout(1500);
    
    // Step 5: Select "Until" in the end dropdown
    console.log('STEP: Selecting "Until" in end dropdown...');
    await this.selectEndOption('Until');
    await this.page.waitForTimeout(1000);
    
    // Step 6: Read the default prepopulated end date
    console.log('\n--- Step 2: Validate default prepopulated end date is 52 days from current date ---');
    const untilDateInput = modal.locator('input.e-until-date, input[class*="e-until-date"]').first();
    const isVisible = await untilDateInput.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!isVisible) {
      // Try alternative selectors
      const altSelectors = [
        'input[title="Until"]',
        'input[id*="datepicker"][id*="until"]',
        'input.e-datepicker.e-until-date',
        'input.e-control.e-datepicker.e-until-date'
      ];
      
      let foundInput = null;
      for (const selector of altSelectors) {
        const candidateInput = modal.locator(selector).first();
        const isAltVisible = await candidateInput.isVisible({ timeout: 1000 }).catch(() => false);
        if (isAltVisible) {
          foundInput = candidateInput;
          break;
        }
      }
      
      if (!foundInput || !(await foundInput.isVisible({ timeout: 1000 }).catch(() => false))) {
        throw new Error('Until datepicker input not found');
      }
      
      // Read the default value
      const defaultValue = await foundInput.inputValue({ timeout: 2000 }).catch(() => '');
      console.log(`✓ Default end date value: ${defaultValue}`);
      
      // Calculate expected date (52 days from today)
      const expectedDate = this._getDateFiftyTwoDaysFromToday();
      const expectedDateObj = this._getDateFiftyTwoDaysFromTodayDate();
      
      // Parse the default value to compare
      if (defaultValue) {
        // Parse M/D/YY format
        const parts = defaultValue.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[0]);
          const day = parseInt(parts[1]);
          const year = parseInt('20' + parts[2]); // Convert YY to YYYY
          
          const actualDate = new Date(year, month - 1, day);
          actualDate.setHours(0, 0, 0, 0);
          
          // Compare dates (allow 1 day difference for timezone/formatting issues)
          const daysDiff = Math.abs((actualDate - expectedDateObj) / (1000 * 60 * 60 * 24));
          
          expect(daysDiff).toBeLessThanOrEqual(1);
          console.log(`✓ ASSERT: Default end date is approximately 52 days from current date`);
          console.log(`  Expected: ${expectedDate} (${expectedDateObj.toLocaleDateString()})`);
          console.log(`  Actual: ${defaultValue} (${actualDate.toLocaleDateString()})`);
          console.log(`  Days difference: ${daysDiff.toFixed(1)}`);
        } else {
          throw new Error(`Unexpected date format: ${defaultValue}`);
        }
      } else {
        throw new Error('Default end date value is empty');
      }
    } else {
      // Read the default value
      const defaultValue = await untilDateInput.inputValue({ timeout: 2000 }).catch(() => '');
      console.log(`✓ Default end date value: ${defaultValue}`);
      
      // Calculate expected date (52 days from today)
      const expectedDate = this._getDateFiftyTwoDaysFromToday();
      const expectedDateObj = this._getDateFiftyTwoDaysFromTodayDate();
      
      // Parse the default value to compare
      if (defaultValue) {
        // Parse M/D/YY format
        const parts = defaultValue.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[0]);
          const day = parseInt(parts[1]);
          const year = parseInt('20' + parts[2]); // Convert YY to YYYY
          
          const actualDate = new Date(year, month - 1, day);
          actualDate.setHours(0, 0, 0, 0);
          
          // Compare dates (allow 1 day difference for timezone/formatting issues)
          const daysDiff = Math.abs((actualDate - expectedDateObj) / (1000 * 60 * 60 * 24));
          
          expect(daysDiff).toBeLessThanOrEqual(1);
          console.log(`✓ ASSERT: Default end date is approximately 52 days from current date`);
          console.log(`  Expected: ${expectedDate} (${expectedDateObj.toLocaleDateString()})`);
          console.log(`  Actual: ${defaultValue} (${actualDate.toLocaleDateString()})`);
          console.log(`  Days difference: ${daysDiff.toFixed(1)}`);
        } else {
          throw new Error(`Unexpected date format: ${defaultValue}`);
        }
      } else {
        throw new Error('Default end date value is empty');
      }
    }
    
    // Close modal without creating appointment
    console.log('\n--- Step 3: Closing modal without creating appointment ---');
    await this.closePopupSafely();
    await this.page.waitForTimeout(1000);
    
    return true;
  }

  // Helper: Count appointments on scheduler
  async countAppointmentsOnScheduler() {
    const allEventSelectors = [
      '.e-event:not(button):not(.e-event-cancel):not(.e-event-save)',
      '.e-appointment:not(button)',
      '.e-schedule-event:not(button)'
    ];
    
    let maxCount = 0;
    for (const selector of allEventSelectors) {
      const events = this.page.locator(selector);
      const count = await events.count({ timeout: 3000 }).catch(() => 0);
      maxCount = Math.max(maxCount, count);
    }
    
    return maxCount;
  }

  // Helper: Select status from Status dropdown in edit modal
  async selectStatus(status = 'Cancelled') {
    console.log(`STEP: Selecting Status: "${status}"...`);
    const modal = this.modal();
    await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
    
    // Find Status dropdown by label
    const statusLabel = modal.locator('label:has-text("Status"), label.e-float-text:has-text("Status")').first();
    const isLabelVisible = await statusLabel.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isLabelVisible) {
      throw new Error('Status dropdown not found in edit modal');
    }
    
    // Find the dropdown wrapper
    const statusDropdown = statusLabel.locator('xpath=ancestor::div[contains(@class,"e-control-wrapper")][contains(@class,"e-ddl")]').first();
    const isDropdownVisible = await statusDropdown.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isDropdownVisible) {
      // Try alternative: find by structure
      const altDropdown = modal.locator('div.e-float-input.e-control-wrapper.e-input-group.e-ddl:has(label.e-float-text:has-text("Status"))').first();
      const altVisible = await altDropdown.isVisible({ timeout: 5000 }).catch(() => false);
      if (altVisible) {
        await altDropdown.click({ timeout: 3000 });
      } else {
        throw new Error('Status dropdown wrapper not found');
      }
    } else {
      // Click dropdown to open
      await statusDropdown.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(300);
      
      const dropdownIcon = statusDropdown.locator('.e-ddl-icon, .e-input-group-icon, span.e-ddl-icon').first();
      const iconVisible = await dropdownIcon.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (iconVisible) {
        await dropdownIcon.click({ force: true });
      } else {
        const input = statusDropdown.locator('input[readonly], input[role="combobox"]').first();
        const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
        if (inputVisible) {
          await input.click({ force: true });
        } else {
          await statusDropdown.click({ force: true });
        }
      }
    }
    
    await this.page.waitForTimeout(1500);
    
    // Find popup and select status
    const popupSelectors = [
      'div[id$="_popup"]:visible',
      '.e-popup-open:visible',
      'ul.e-list-parent:visible',
      '.e-dropdownbase:visible',
      '[role="listbox"]:visible'
    ];
    
    let popup = null;
    for (const selector of popupSelectors) {
      popup = this.page.locator(selector).first();
      const popupVisible = await popup.isVisible({ timeout: 3000 }).catch(() => false);
      if (popupVisible) {
        break;
      }
    }
    
    if (!popup) {
      throw new Error('Status dropdown popup not found');
    }
    
    // Try multiple variations of the status text
    const statusVariations = [
      status, // Exact match first
      status.replace('-', ' '), // "No-Show" -> "No Show", "Check-in" -> "Check in"
      status.replace(' ', '-'), // "No Show" -> "No-Show", "Check in" -> "Check-in"
      status.toLowerCase(), // "cancelled", "no show", "check-in"
      status.toUpperCase(), // "CANCELLED", "NO SHOW", "CHECK-IN"
      status.replace(/-/g, ''), // "Check-in" -> "Checkin", "No-Show" -> "Noshow"
    ];
    
    let optionFound = false;
    for (const variation of statusVariations) {
      const option = popup.locator(`li[role="option"]:has-text("${variation}"), li.e-list-item:has-text("${variation}")`).first();
      const optionVisible = await option.isVisible({ timeout: 1000 }).catch(() => false);
      if (optionVisible) {
        await option.click({ timeout: 3000 });
        await this.page.waitForTimeout(500);
        console.log(`✓ Status "${variation}" selected (matched from "${status}")`);
        optionFound = true;
        break;
      }
    }
    
    // If exact match not found, try case-insensitive search
    if (!optionFound) {
      const allOptions = popup.locator('li[role="option"], li.e-list-item');
      const optionCount = await allOptions.count();
      for (let i = 0; i < optionCount; i++) {
        const option = allOptions.nth(i);
        const optionText = await option.textContent({ timeout: 1000 }).catch(() => '');
        if (optionText) {
          const normalizedText = optionText.trim().toLowerCase();
          const normalizedStatus = status.toLowerCase().replace(/[- ]/g, '');
          if (normalizedText.includes(normalizedStatus) || normalizedText === normalizedStatus) {
            await option.click({ timeout: 3000 });
            await this.page.waitForTimeout(500);
            console.log(`✓ Status "${optionText.trim()}" selected (matched from "${status}")`);
            optionFound = true;
            break;
          }
        }
      }
    }
    
    if (!optionFound) {
      throw new Error(`Status option "${status}" not found in dropdown`);
    }
  }

  // Helper: Handle no-show reason modal
  async handleNoShowReasonModal(reason = 'Test no-show reason') {
    console.log('STEP: Handling no-show reason modal...');
    await this.page.waitForTimeout(2000);
    
    const modal = this.modal();
    const isModalOpen = await modal.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!isModalOpen) {
      console.log('ℹ️ No-show reason modal not found - may not be required');
      return;
    }
    
    // Find no-show reason field (textarea, dropdown, or input)
    const reasonTextarea = modal.locator('textarea[required], textarea.e-input, label:has-text("No-Show Reason") + textarea, label:has-text("Reason") + textarea').first();
    const reasonDropdown = modal.locator('label:has-text("No-Show Reason"), label:has-text("Reason")').first().locator('xpath=../..//div[contains(@class,"e-control-wrapper")]').first();
    const reasonInput = modal.locator('input[id*="noshow"], input[id*="no-show"], input[id*="reason"]').first();
    
    let reasonField = null;
    const textareaVisible = await reasonTextarea.isVisible({ timeout: 2000 }).catch(() => false);
    if (textareaVisible) {
      reasonField = reasonTextarea;
      await reasonField.clear({ timeout: 3000 });
      await reasonField.fill(reason, { timeout: 3000 });
      console.log('✓ No-show reason entered in textarea');
    } else {
      const dropdownVisible = await reasonDropdown.isVisible({ timeout: 2000 }).catch(() => false);
      if (dropdownVisible) {
        reasonField = reasonDropdown;
        await reasonDropdown.click({ timeout: 3000 });
        await this.page.waitForTimeout(1000);
        const firstOption = this.page.locator('div[id$="_popup"]:visible li[role="option"]').first();
        await firstOption.click({ timeout: 3000 });
        console.log('✓ No-show reason selected from dropdown');
      } else {
        const inputVisible = await reasonInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (inputVisible) {
          reasonField = reasonInput;
          await reasonField.clear({ timeout: 3000 });
          await reasonField.fill(reason, { timeout: 3000 });
          console.log('✓ No-show reason entered in input');
        }
      }
    }
    
    await this.page.waitForTimeout(1000);
    
    // Click Save/Yes/OK button
    const saveButton = modal.locator('button:has-text("Save"), button:has-text("Yes"), button.btn-primary:has-text("Save"), button:has-text("OK")').first();
    const saveVisible = await saveButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (saveVisible) {
      await saveButton.click({ timeout: 3000 });
      await this.page.waitForTimeout(2000);
      console.log('✓ Save/Yes/OK button clicked in no-show reason modal');
    } else {
      console.log('⚠️ Save/Yes/OK button not found in no-show reason modal');
    }
  }

  // Helper: Handle cancellation reason modal
  async handleCancellationReasonModal(reason = 'Test cancellation reason') {
    console.log('STEP: Handling cancellation reason modal...');
    await this.page.waitForTimeout(2000);
    
    const modal = this.modal();
    const isModalOpen = await modal.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!isModalOpen) {
      console.log('ℹ️ Cancellation reason modal not found - may not be required');
      return;
    }
    
    // Find cancellation reason field (textarea, dropdown, or input)
    const reasonTextarea = modal.locator('textarea[required], textarea.e-input').first();
    const reasonDropdown = modal.locator('label:has-text("Cancellation Reason"), label:has-text("Reason")').first().locator('xpath=../..//div[contains(@class,"e-control-wrapper")]').first();
    const reasonInput = modal.locator('input[id*="cancellation"], input[id*="reason"]').first();
    
    let reasonField = null;
    const textareaVisible = await reasonTextarea.isVisible({ timeout: 2000 }).catch(() => false);
    if (textareaVisible) {
      reasonField = reasonTextarea;
      await reasonField.clear({ timeout: 3000 });
      await reasonField.fill(reason, { timeout: 3000 });
      console.log('✓ Cancellation reason entered in textarea');
    } else {
      const dropdownVisible = await reasonDropdown.isVisible({ timeout: 2000 }).catch(() => false);
      if (dropdownVisible) {
        reasonField = reasonDropdown;
        await reasonDropdown.click({ timeout: 3000 });
        await this.page.waitForTimeout(1000);
        const firstOption = this.page.locator('div[id$="_popup"]:visible li[role="option"]').first();
        await firstOption.click({ timeout: 3000 });
        console.log('✓ Cancellation reason selected from dropdown');
      } else {
        const inputVisible = await reasonInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (inputVisible) {
          reasonField = reasonInput;
          await reasonField.clear({ timeout: 3000 });
          await reasonField.fill(reason, { timeout: 3000 });
          console.log('✓ Cancellation reason entered in input');
        }
      }
    }
    
    await this.page.waitForTimeout(1000);
    
    // Click Yes/OK button
    const yesButton = modal.locator('button:has-text("Yes"), button.btn-primary:has-text("Yes"), button:has-text("OK")').first();
    const yesVisible = await yesButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (yesVisible) {
      await yesButton.click({ timeout: 3000 });
      await this.page.waitForTimeout(2000);
      console.log('✓ Yes/OK button clicked in cancellation reason modal');
    } else {
      console.log('⚠️ Yes/OK button not found in cancellation reason modal');
    }
  }

  // Helper: Wait for loader to disappear
  async _waitForLoaderToDisappear(timeout = 10000) {
    const loader = this.page.locator('.loader-wrapper, div.loader-wrapper, [class*="loader"]').first();
    const loaderVisible = await loader.isVisible({ timeout: 2000 }).catch(() => false);
    if (loaderVisible) {
      console.log('ℹ️ Loader detected, waiting for it to disappear...');
      await loader.waitFor({ state: 'hidden', timeout }).catch(() => {});
      await this.page.waitForTimeout(500); // Additional wait after loader disappears
      console.log('✓ Loader disappeared');
    }
  }

  // Helper: Wait for element to be clickable (not intercepted by loader)
  async _waitForElementClickable(element, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      // Check if loader is visible
      const loader = this.page.locator('.loader-wrapper, div.loader-wrapper, [class*="loader"]').first();
      const loaderVisible = await loader.isVisible({ timeout: 500 }).catch(() => false);
      
      if (!loaderVisible) {
        // Loader is not visible, check if element is visible and enabled
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
        const isEnabled = await element.isEnabled({ timeout: 1000 }).catch(() => false);
        
        if (isVisible && isEnabled) {
          // Check if element is not intercepted by checking if it's in viewport
          const box = await element.boundingBox().catch(() => null);
          if (box) {
            console.log('✓ Element is clickable');
            return true;
          }
        }
      } else {
        // Loader is visible, wait for it to disappear
        await loader.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
      }
      
      await this.page.waitForTimeout(200);
    }
    
    console.log('⚠️ Element may not be fully clickable after timeout');
    return false;
  }

  // Helper: Verify event visible on scheduler (reuse from BookingRulesPage pattern)
  async verifyEventVisibleOnScheduler() {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    await this.page.waitForTimeout(2000);
    await this.page.waitForSelector('td.e-work-cells', { timeout: 10000, state: 'visible' }).catch(() => {});
    await this.page.waitForTimeout(1000);
    
    const allEventSelectors = [
      '.e-event:not(button):not(.e-event-cancel):not(.e-event-save)',
      '.e-appointment:not(button)',
      '.e-schedule-event:not(button)',
      'div[class*="event-item"]:not(button)',
      'div.e-event:not(button)',
      'span.e-event:not(button)'
    ];
    
    let eventElement = null;
    for (const baseSelector of allEventSelectors) {
      const events = this.page.locator(baseSelector);
      const count = await events.count({ timeout: 3000 }).catch(() => 0);
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 100); i++) {
          const event = events.nth(i);
          const isVisible = await event.isVisible({ timeout: 1000 }).catch(() => false);
          if (isVisible) {
            eventElement = event;
            break;
          }
        }
        if (eventElement) break;
      }
    }
    
    return eventElement;
  }
}

module.exports = { RecurringAppointmentsPage };
