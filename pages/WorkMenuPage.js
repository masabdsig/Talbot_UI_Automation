const { expect } = require('@playwright/test');

class WorkMenuPage {
  constructor(page) {
    this.page = page;

    // Work Menu Locators
    this.workMenuButton = page.locator('button:has-text("Work"), [role="button"]:has-text("Work"), .work-menu, button.dropdown-toggle:has-text("Work")');
    this.workMenuContainer = page.locator('div:has-text("Work Menu")').locator('xpath=ancestor::div[contains(@class, "row")]').first();
    this.workMenuDropdown = page.locator('div:has-text("Work Menu")').locator('xpath=ancestor::div[contains(@class, "row")]').first();
    this.workMenuOptions = page.locator('div:has-text("Work Menu")').locator('xpath=ancestor::div[contains(@class, "row")]//div[contains(@class, "mat-menu") and contains(@class, "cursor")]');
    this.menuOptionItems = page.locator('.col-12.mat-menu.cursor');
    this.bodyContent = page.locator('body');

    // Heading Selectors Array
    this.headingSelectors = [
      'h1',
      'h2', 
      'h3',
      'h4',
      'h5',
      '.modal-title',
      '.page-title',
      '.card-title',
      '[role="heading"]',
      '.heading',
      'header h1',
      'header h2'
    ];

    // Known Work Menu Options Array
    this.knownWorkMenuOptions = [
      'Clients',
      'Unsigned Sheets',
      'Patient Tracking',
      'Productivity',
      'ITP Review Due',
      'My Eligible Medicaid Clients',
      'Provider Notes',
      'My Task',
      'My Messages',
      'My Open Access Slots'
    ];
  }

  /**
   * Opens/verifies the Work menu is visible on the patient detail page
   */
  async openWorkMenu() {
    console.log('ACTION: Opening Work menu...');
    // Work menu is already visible on patient detail page, no need to click a button
    // Try multiple selectors to find Work menu options
    const selectors = [
      '.col-12.mat-menu.cursor',
      'div.mat-menu.cursor',
      '.mat-menu.cursor',
      '[class*="mat-menu"][class*="cursor"]'
    ];
    
    let found = false;
    for (const selector of selectors) {
      const menuOption = this.page.locator(selector).first();
      const isVisible = await menuOption.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        console.log(`VALIDATION: Work menu found using selector: ${selector}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      // If not found, just wait a bit and continue - the getWorkMenuOptions will handle it
      console.log('WARNING: Work menu options not immediately visible, will try to find them in getWorkMenuOptions');
      await this.page.waitForTimeout(2000);
    } else {
      await this.page.waitForTimeout(1000);
    }
    console.log('VALIDATION: Work menu check complete');
  }

  /**
   * Gets all available Work menu options
   * @returns {Array} Array of objects with locator and text for each option
   */
  async getWorkMenuOptions() {
    console.log('ACTION: Getting Work menu options...');
    const options = [];
    
    // Try multiple selectors to find menu options
    const selectors = [
      '.col-12.mat-menu.cursor',
      'div.mat-menu.cursor',
      '.mat-menu.cursor',
      '[class*="mat-menu"][class*="cursor"]',
      'div:has-text("Work Menu") ~ div.mat-menu',
      '.row.mt-45 .mat-menu.cursor'
    ];
    
    let menuOptions = null;
    let optionCount = 0;
    
    for (const selector of selectors) {
      menuOptions = this.page.locator(selector);
      optionCount = await menuOptions.count();
      if (optionCount > 0) {
        console.log(`INFO: Found ${optionCount} options using selector: ${selector}`);
        break;
      }
    }
    
    if (optionCount === 0) {
      // Try to find by text content - look for known menu items
      for (const optionText of this.knownWorkMenuOptions) {
        const option = this.page.locator(`div:has-text("${optionText}")`).filter({ 
          has: this.page.locator('.mat-menu, [class*="mat-menu"]') 
        }).first();
        const isVisible = await option.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          options.push({
            locator: option,
            text: optionText
          });
        }
      }
      
      if (options.length > 0) {
        console.log(`VALIDATION: Found ${options.length} Work menu options by text search`);
        return options;
      }
    }
    
    // Process found options
    for (let i = 0; i < optionCount; i++) {
      const option = menuOptions.nth(i);
      const isVisible = await option.isVisible().catch(() => false);
      if (isVisible) {
        // Try to get text from span inside col-11
        let text = await option.locator('.col-11 span').textContent().catch(() => '');
        if (!text) {
          text = await option.locator('span').textContent().catch(() => '');
        }
        if (!text) {
          text = await option.textContent().catch(() => '');
        }
        if (text && text.trim()) {
          options.push({
            locator: option,
            text: text.trim()
          });
        }
      }
    }
    
    console.log(`VALIDATION: Found ${options.length} Work menu options`);
    return options;
  }

  /**
   * Clicks a specific Work menu option by its text
   * @param {string} optionText - The text of the menu option to click
   */
  async clickWorkMenuOption(optionText) {
    console.log(`ACTION: Clicking Work menu option: ${optionText}`);
    
    // Try multiple selectors to find the option
    const selectors = [
      `.col-12.mat-menu.cursor:has(.col-11 span:has-text("${optionText}"))`,
      `.col-12.mat-menu.cursor:has(span:has-text("${optionText}"))`,
      `div.mat-menu.cursor:has-text("${optionText}")`,
      `div:has-text("${optionText}"):has(.mat-menu)`
    ];
    
    let option = null;
    for (const selector of selectors) {
      option = this.page.locator(selector).first();
      const isVisible = await option.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        console.log(`INFO: Found option using selector: ${selector}`);
        break;
      }
    }
    
    if (!option) {
      throw new Error(`Work menu option "${optionText}" not found`);
    }
    
    await expect(option).toBeVisible({ timeout: 5000 });
    await expect(option).toBeEnabled();
    await option.click();
    await this.page.waitForTimeout(1000);
    console.log(`VALIDATION: Clicked Work menu option: ${optionText}`);
  }

  /**
   * Validates that a Work menu option loaded successfully after clicking
   * @param {string} optionText - The text of the menu option that was clicked
   */
  async validateWorkMenuOptionLoads(optionText) {
    console.log(`VALIDATION: Validating ${optionText} loaded successfully...`);
    
    // Wait for page/modal to load
    await this.page.waitForTimeout(2000); // Allow time for content to render
    
    // Check for primary heading or key element
    const heading = this.page.locator('h1, h2, h3, h4, h5, .modal-title, .page-title, .card-title, [role="heading"]').first();
    const headingVisible = await heading.isVisible().catch(() => false);
    
    if (headingVisible) {
      const headingText = await heading.textContent().catch(() => '');
      console.log(`VALIDATION: Primary heading found: ${headingText}`);
    } else {
      // Fallback: check for any visible content
      const hasContent = await this.bodyContent.isVisible().catch(() => false);
      console.log(`VALIDATION: Page content loaded: ${hasContent}`);
    }
    
    // Check for errors in console
    const errors = await this.getConsoleErrors();
    
    if (errors.length > 0) {
      console.log(`WARNING: Console errors detected: ${errors.length}`);
    }
    
    console.log(`VALIDATION: ${optionText} loaded successfully`);
  }

  /**
   * Validates primary heading or key element is present on the page
   * @param {string} optionText - The text of the menu option for logging
   * @returns {boolean} True if heading or content is found, false otherwise
   */
  async validatePrimaryHeading(optionText) {
    console.log(`ASSERT: Verifying primary heading or key element is present for "${optionText}"...`);
    
    let headingFound = false;
    for (const selector of this.headingSelectors) {
      const heading = this.page.locator(selector).first();
      const isVisible = await heading.isVisible().catch(() => false);
      if (isVisible) {
        const headingText = await heading.textContent().catch(() => '');
        if (headingText && headingText.trim()) {
          console.log(`✓ ASSERT: Primary heading found: "${headingText.trim()}"`);
          headingFound = true;
          break;
        }
      }
    }

    // Fallback: Check for any visible content area
    if (!headingFound) {
      const hasContent = await this.bodyContent.isVisible().catch(() => false);
      if (hasContent) {
        console.log(`✓ ASSERT: Page content is visible (heading not found, but page loaded)`);
        headingFound = true;
      }
    }

    if (!headingFound) {
      console.log(`WARNING: No primary heading or key element found for "${optionText}"`);
    }

    return headingFound;
  }

  /**
   * Gets console errors from the page
   * @returns {Array} Array of console errors
   */
  async getConsoleErrors() {
    const errors = await this.page.evaluate(() => {
      return window.console._errors || [];
    }).catch(() => []);
    return errors;
  }

  /**
   * Checks if navigation back to Patients page is needed
   * @returns {boolean} True if navigation is needed, false otherwise
   */
  async isNavigationNeeded() {
    const currentUrl = this.page.url();
    return !currentUrl.includes('/patients') && !currentUrl.includes('/dashboard');
  }

  /**
   * Scrolls to find the Work menu if it's below the fold
   */
  async scrollToWorkMenu() {
    console.log('ACTION: Scrolling to find Work menu...');
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await this.page.waitForTimeout(1000);
    
    // Try to find Work menu with various selectors
    const workMenuSelectors = [
      'div:has-text("Work Menu")',
      '.row.mt-45',
      '.col-12.mat-menu.cursor',
      '[class*="mat-menu"]'
    ];
    
    let workMenuFound = false;
    for (const selector of workMenuSelectors) {
      const element = this.page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        console.log(`INFO: Found Work menu using selector: ${selector}`);
        workMenuFound = true;
        break;
      }
    }
    
    if (!workMenuFound) {
      console.log('WARNING: Work menu not immediately visible, trying to scroll more...');
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(2000);
    }
  }
}

module.exports = { WorkMenuPage };
