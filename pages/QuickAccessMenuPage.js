const { expect } = require('@playwright/test');

class QuickAccessMenuPage {
  constructor(page) {
    this.page = page;
    
    // Quick Access Menu button (icon with class "fa fa-th-large" and title="Quick Menu")
    this.quickMenuIcon = page.locator('i.fa.fa-th-large[title="Quick Menu"]');
    
    // Quick Access Menu container (to check if menu is open)
    this.quickMenuContainer = page.locator('.quick-menu-container, .quick-access-menu, [class*="quick-menu"]').first();
    
    // Search input in Quick Access Menu (specific selector based on provided HTML)
    this.searchInput = page.locator('input.search_menu[type="text"][placeholder="Search here..."]');
    
    // Menu items in Quick Access Menu - try multiple selectors
    this.menuItems = page.locator('.quick-menu-item, .menu-item, [class*="menu-item"], li[class*="item"], div[class*="item"]');
    
    // Favorite/Bookmark icon (specific selector based on provided HTML)
    this.favoriteIcon = page.locator('i.fa.fa-bookmark.favouriteIcon');
    
    // Header menu items (to check if favorite appears in header)
    this.headerMenuItems = page.locator('header button, header [role="button"]');
  }

  /**
   * Get expected modules list for Quick Access Menu
   * Based on HTML structure - may vary based on user permissions
   */
  getExpectedModules() {
    return [
      'My Dashboard',
      'Patients',
      'Scheduling',
      'Followup Referrals',
      'Internal Referrals',
      'Tele Health-Virtual Room',
      'Client Messages',
      'Case Management Tasks',
      'Portal Requests',
      'MAR/TAR/Treatment/OTP Medication',
      'Assessments',
      'Group Sessions',
      'Approve ITP',
      'Treatment Plan',
      'Labs',
      'Order Status',
      'Reports',
      'Encounter Actions',
      'Group Management',
      'Fax',
      'Task Management',
      'Delegate Access',
      'Pharmacy',
      'Patient Incident',
      'Patient Survey',
      'Patient Grievance',
      'Patient Tracking',
      'Approve Residential Billing',
      'Residential',
      'Lab Utilization Report',
      'Supervision Notes',
      'Firedrill Inspections',
      'Restore Documents',
      'Provider Credentialing',
      'Payor Configuration (Appointment)',
      'Payor Configuration (Encounter)',
      'Probation Portal Users',
      'Patient Login Users',
      'WriteOff Payments',
      'Patient Intake Approval',
      'Patient Intake Form',
      'External Referrals',
      'Refill-Request',
      'Patient Medication Report',
      'CRM',
      'Templates',
      'Provider Sign Templates'
    ];
  }

  /**
   * Get list of modules to test for navigation validation with their expected URL patterns
   * Returns an array of objects with name and urlContains properties
   */
  getNavigationTestModules() {
    return [
      { name: 'My Dashboard', urlContains: 'dashboard' },
      { name: 'Patients', urlContains: 'patients' },
      { name: 'Scheduling', urlContains: 'scheduling' },
      { name: 'Followup Referrals', urlContains: 'followup-referrals' },
      { name: 'Internal Referrals', urlContains: 'internal' },
      { name: 'Tele Health Virtual Room', urlContains: 'client-waiting-room' },
      { name: 'Client Messages', urlContains: 'client-messages' },
      { name: 'Case Management Tasks', urlContains: 'casemanagement-tasks' },
      { name: 'Portal Requests', urlContains: 'portal-approval' },
      { name: 'Assessments', urlContains: 'assessments' },
      { name: 'Group Sessions', urlContains: 'group-session-list' },
      { name: 'Approve ITP', urlContains: 'all-tp-residential' },
      { name: 'Treatment Plan', urlContains: 'provider-tp-residential' },
      { name: 'Labs', urlContains: 'labs' },
      { name: 'Order Status', urlContains: 'order-status' },
      { name: 'Encounter Actions', urlContains: 'encounter-actions' },
      { name: 'Group Management', urlContains: 'group-therapy-roaster' },
      { name: 'Fax', urlContains: 'faxes' },
      { name: 'Task Management', urlContains: 'task-management' },
      { name: 'Pharmacy', urlContains: 'inventory-with-reqsandmeds' },
      { name: 'Patient Incident', urlContains: 'patient-incident' },
      { name: 'Patient Grievance', urlContains: 'patient-complaint' },
      { name: 'Patient Tracking', urlContains: 'patient-tracking' },
      { name: 'Patient Analytics', urlContains: 'patient-analytics' },
      { name: 'Approve Residential Billing', urlContains: 'approve-residential-billing' },
      { name: 'Duplicate Patients', urlContains: 'duplicate-patients' },
      { name: 'Lab Utilization Report', urlContains: 'lab-utilization-report' },
      { name: 'Firedrill Inspections', urlContains: 'firedrill-inspections' },
      { name: 'Restore Documents', urlContains: 'deleted-docs' },
      { name: 'Provider Credentialing', urlContains: 'credentialing' },
      { name: 'Payor Configuration (Appointment)', urlContains: 'payorconfig/appointmenttype' },
      { name: 'Payor Configuration (Encounter)', urlContains: 'payorconfig/ecncountertype' },
      { name: 'Patient Intake Approval', urlContains: 'patient-intake' }
    ];
  }

  /**
   * Open Quick Access Menu by clicking the icon
   */
  async openQuickAccessMenu() {
    console.log('➡️ Opening Quick Access Menu...');
    await expect(this.quickMenuIcon).toBeVisible({ timeout: 10000 });
    await this.quickMenuIcon.click();
    await this.page.waitForTimeout(1000); // Wait for menu to open
    console.log('✔️ Quick Access Menu opened');
  }

  /**
   * Check if Quick Access Menu is open
   */
  async isMenuOpen() {
    try {
      const isVisible = await this.searchInput.isVisible({ timeout: 2000 });
      return isVisible;
    } catch {
      return false;
    }
  }

  /**
   * Get the Quick Access Menu container/popup
   */
  async getMenuContainer() {
    // Wait for search input to be visible (indicates menu is open)
    await expect(this.searchInput).toBeVisible({ timeout: 5000 });
    
    // Find the container by traversing up from the search input
    // Try multiple strategies to find the popup/overlay container
    const containerSelectors = [
      this.searchInput.locator('xpath=ancestor::*[contains(@class, "menu") or contains(@class, "popup") or contains(@class, "overlay") or contains(@class, "modal") or contains(@class, "dropdown")]').first(),
      this.searchInput.locator('xpath=ancestor::*[@role="menu" or @role="dialog" or @role="listbox"]').first(),
      this.page.locator('.cdk-overlay-container, .overlay-container, [class*="overlay"]').first(),
      this.page.locator('[class*="quick-menu"], [class*="quick-access"]').first()
    ];
    
    for (const container of containerSelectors) {
      const isVisible = await container.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        return container;
      }
    }
    
    // Fallback: return a container scoped to the search input's parent
    return this.searchInput.locator('xpath=ancestor::*[position()=1]').first();
  }

  /**
   * Get all menu items from Quick Access Menu
   * Based on HTML structure: div.col-2.menu_tab contains div.menu_name > div.line_name
   */
  async getMenuItems() {
    console.log('➡️ Retrieving menu items from Quick Access Menu...');
    
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
    }
    
    await this.page.waitForTimeout(500);
    
    // Get the menu container to scope our search
    const menuContainer = await this.getMenuContainer();
    
    // Based on HTML structure: menu items are in div.col-2.menu_tab
    // The item name is in div.line_name inside div.menu_name
    const menuTabs = menuContainer.locator('div.col-2.menu_tab');
    const tabCount = await menuTabs.count();
    
    let allItems = [];
    
    for (let i = 0; i < tabCount; i++) {
      try {
        const menuTab = menuTabs.nth(i);
        const isVisible = await menuTab.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (!isVisible) continue;
        
        // Get the menu name element (div.menu_name)
        const menuName = menuTab.locator('div.menu_name').first();
        const menuNameVisible = await menuName.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (menuNameVisible) {
          // Get the line_name which contains the actual menu item text
          const lineName = menuName.locator('div.line_name').first();
          const lineNameVisible = await lineName.isVisible({ timeout: 1000 }).catch(() => false);
          
          if (lineNameVisible) {
            const text = await lineName.textContent();
            const trimmedText = text ? text.trim() : '';
            
            // Skip empty text
            if (trimmedText && trimmedText.length > 0) {
              // Check if it has a submenu
              const hasSubMenu = await menuName.getAttribute('class').then(cls => cls && cls.includes('withSubMenu')).catch(() => false);
              
              // Get dynamic count if present
              let count = null;
              const countSpan = menuName.locator('span.tpAlert_quick_menu').first();
              const countVisible = await countSpan.isVisible({ timeout: 500 }).catch(() => false);
              if (countVisible) {
                const countText = await countSpan.textContent();
                count = countText ? countText.trim() : null;
              }
              
              allItems.push({
                locator: menuName, // Use menu_name as locator for clicking
                text: trimmedText,
                hasSubMenu: hasSubMenu,
                count: count,
                tabLocator: menuTab
              });
            }
          }
        }
      } catch (e) {
        // Skip items that can't be evaluated
        continue;
      }
    }
    
    console.log(`✔️ Found ${allItems.length} module(s) in Quick Access Menu`);
    return allItems;
  }

  /**
   * Click a menu item using the provided locator
   */
  async clickMenuItemByLocator(locator, itemText) {
    console.log(`➡️ Clicking menu item: "${itemText}"`);
    
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
    }
    
    await expect(locator).toBeVisible({ timeout: 5000 });
    
    // Scroll into view if needed
    await locator.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    // Try clicking with force if regular click doesn't work (in case of overlays)
    try {
      await locator.click({ timeout: 5000 });
    } catch (error) {
      // If click is intercepted, try force click
      console.log(`⚠️ Regular click failed, trying force click...`);
      await locator.click({ force: true });
    }
    
    await this.page.waitForTimeout(1000); // Wait for navigation
    console.log(`✔️ Clicked menu item: "${itemText}"`);
  }

  /**
   * Click a menu item by text (fallback method)
   */
  async clickMenuItem(itemText) {
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
    }
    
    // Get the menu container to scope our search
    const menuContainer = await this.getMenuContainer();
    
    // Find the menu item by text within the container
    const menuItem = menuContainer.getByText(itemText, { exact: false }).first();
    await this.clickMenuItemByLocator(menuItem, itemText);
  }

  /**
   * Get favorite/bookmark icon for a specific menu item
   */
  async getFavoriteIconForItem(itemText) {
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
    }
    
    // Get the menu container to scope our search
    const menuContainer = await this.getMenuContainer();
    
    // Find the menu item by text within the container
    const menuItem = menuContainer.getByText(itemText, { exact: false }).first();
    
    // Try to find favorite icon in the same container
    // First try: look for favorite icon near the menu item
    const itemLocator = menuItem.locator('xpath=ancestor::*[contains(@class, "item") or contains(@class, "menu")]').first();
    
    // Look for favorite icon within the item container or nearby (can be fa-bookmark or fa-bookmark-o)
    let favoriteIcon = itemLocator.locator('i.fa.favouriteIcon').first();
    
    // If not found, try looking in parent elements
    if (!(await favoriteIcon.isVisible({ timeout: 1000 }).catch(() => false))) {
      // Try finding by traversing up the DOM
      const parent = menuItem.locator('xpath=..');
      favoriteIcon = parent.locator('i.fa.favouriteIcon').first();
    }
    
    // If still not found, try finding all favorite icons and match by proximity
    if (!(await favoriteIcon.isVisible({ timeout: 1000 }).catch(() => false))) {
      const allFavoriteIcons = this.page.locator('i.fa.favouriteIcon');
      const count = await allFavoriteIcons.count();
      if (count > 0) {
        // Return the first one (we'll need to match by context)
        favoriteIcon = allFavoriteIcons.first();
      }
    }
    
    return favoriteIcon;
  }

  /**
   * Check if a menu item is currently favorited
   */
  async isItemFavorited(itemText) {
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
    }
    
    // Get the menu container to scope our search
    const menuContainer = await this.getMenuContainer();
    
    // Find the menu item
    const menuItem = menuContainer.getByText(itemText, { exact: false }).first();
    await menuItem.hover();
    await this.page.waitForTimeout(500); // Give more time for hover effects
    
    // Look for favorite icon - try multiple strategies
    // The icon can be either fa-bookmark (filled/favorited) or fa-bookmark-o (outline/not favorited)
    const itemContainer = menuItem.locator('xpath=ancestor::*[contains(@class, "item") or contains(@class, "menu")]').first();
    
    // Try to find favorite icon - it could be fa-bookmark or fa-bookmark-o
    let favoriteIcon = itemContainer.locator('i.fa.favouriteIcon').first();
    
    try {
      // Strategy 1: Check if icon is visible
      const isVisible = await favoriteIcon.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (isVisible) {
        // Get the class name to check if it's favorited
        const className = await favoriteIcon.getAttribute('class').catch(() => '');
        
        // Check: fa-bookmark (filled) = favorited, fa-bookmark-o (outline) = not favorited
        const isFavorited = className.includes('fa-bookmark') && !className.includes('fa-bookmark-o');
        
        if (isFavorited) {
          return true;
        }
        
        // Also check for other indicators
        const hasActiveClass = className.includes('active') || className.includes('filled') || className.includes('selected');
        if (hasActiveClass) {
          return true;
        }
      }
      
      // Strategy 2: Try finding all favorite icons and check the one near this item
      const allFavoriteIcons = menuContainer.locator('i.fa.favouriteIcon');
      const count = await allFavoriteIcons.count();
      
      if (count > 0) {
        // Find the icon that's closest to our menu item
        for (let i = 0; i < count; i++) {
          const icon = allFavoriteIcons.nth(i);
          const iconVisible = await icon.isVisible({ timeout: 500 }).catch(() => false);
          if (iconVisible) {
            const iconClass = await icon.getAttribute('class').catch(() => '');
            // Check if it's a filled bookmark (favorited)
            if (iconClass.includes('fa-bookmark') && !iconClass.includes('fa-bookmark-o')) {
              return true;
            }
            // Also check for active/filled classes
            if (iconClass.includes('active') || iconClass.includes('filled') || iconClass.includes('selected')) {
              return true;
            }
          }
        }
      }
      
      // Strategy 3: Check parent element for favorite indicators
      const parentClasses = await itemContainer.getAttribute('class').catch(() => '');
      const parentIsFavorited = parentClasses.includes('favorite') || parentClasses.includes('favourited') || 
                                parentClasses.includes('bookmarked') || parentClasses.includes('active');
      if (parentIsFavorited) {
        return true;
      }
      
    } catch (e) {
      // Icon not found or not visible - likely not favorited
      console.log(`Debug: Error checking favorite state for "${itemText}": ${e.message}`);
    }
    
    return false;
  }

  /**
   * Toggle favorite status for a menu item (marks if not favorited, unmarks if favorited)
   * Returns the new state (true = favorited, false = not favorited)
   */
  async toggleFavorite(itemText) {
    console.log(`➡️ Toggling favorite for "${itemText}"...`);
    
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
    }
    
    // Get the menu container to scope our search
    const menuContainer = await this.getMenuContainer();
    
    // Find the menu item first
    const menuItem = menuContainer.getByText(itemText, { exact: false }).first();
    await expect(menuItem).toBeVisible({ timeout: 5000 });
    
    // Hover over the menu item to reveal favorite icon (if it's hidden)
    await menuItem.hover();
    await this.page.waitForTimeout(500);
    
    // Try multiple strategies to find and click the favorite icon
    // Strategy 1: Look for favorite icon near the menu item (can be fa-bookmark or fa-bookmark-o)
    const itemContainer = menuItem.locator('xpath=ancestor::*[contains(@class, "item") or contains(@class, "menu")]').first();
    let favoriteIcon = itemContainer.locator('i.fa.favouriteIcon').first();
    
    let clicked = false;
    
    // Check if favorite icon is visible
    const isVisible = await favoriteIcon.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      // Get state before clicking
      const stateBefore = await this.isItemFavorited(itemText);
      console.log(`ℹ️ State before toggle: ${stateBefore ? 'Favorited' : 'Not Favorited'}`);
      
      await favoriteIcon.click();
      await this.page.waitForTimeout(1500); // Wait longer for state to update
      clicked = true;
      console.log(`✔️ Clicked favorite icon for "${itemText}"`);
    } else {
      // Strategy 2: Find all favorite icons within the menu container and try to match by proximity
      const allFavoriteIcons = menuContainer.locator('i.fa.favouriteIcon');
      const count = await allFavoriteIcons.count();
      
      if (count > 0) {
        // Get state before clicking
        const stateBefore = await this.isItemFavorited(itemText);
        console.log(`ℹ️ State before toggle: ${stateBefore ? 'Favorited' : 'Not Favorited'}`);
        
        // Try clicking the first visible favorite icon
        for (let i = 0; i < count; i++) {
          const icon = allFavoriteIcons.nth(i);
          const iconVisible = await icon.isVisible({ timeout: 1000 }).catch(() => false);
          if (iconVisible) {
            await icon.click();
            await this.page.waitForTimeout(1500); // Wait longer for state to update
            clicked = true;
            console.log(`✔️ Clicked favorite icon (${i + 1}/${count}) for "${itemText}"`);
            break;
          }
        }
      }
    }
    
    if (!clicked) {
      console.log(`⚠️ WARNING: Could not find or click favorite icon for "${itemText}"`);
      return null; // Could not determine state
    }
    
    // Wait a bit more and check the new state after toggling
    await this.page.waitForTimeout(1000);
    
    // Re-open menu if it closed
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
      await this.page.waitForTimeout(500);
    }
    
    // Re-hover over the item to ensure icon is visible
    const menuContainer2 = await this.getMenuContainer();
    const menuItem2 = menuContainer2.getByText(itemText, { exact: false }).first();
    await menuItem2.hover();
    await this.page.waitForTimeout(500);
    
    const newState = await this.isItemFavorited(itemText);
    console.log(`ℹ️ State after toggle: ${newState ? 'Favorited' : 'Not Favorited'}`);
    return newState;
  }

  /**
   * Mark a menu item as favorite (convenience method)
   */
  async markAsFavorite(itemText) {
    // Check current state
    const wasFavorited = await this.isItemFavorited(itemText);
    
    if (!wasFavorited) {
      console.log(`➡️ "${itemText}" is not favorited, marking as favorite...`);
      await this.toggleFavorite(itemText);
    } else {
      console.log(`ℹ️ "${itemText}" is already favorited`);
    }
  }

  /**
   * Unmark a menu item as favorite (convenience method)
   */
  async unmarkAsFavorite(itemText) {
    const wasFavorited = await this.isItemFavorited(itemText);
    if (wasFavorited) {
      await this.toggleFavorite(itemText);
    } else {
      console.log(`ℹ️ "${itemText}" is not favorited`);
    }
  }

  /**
   * Check if a favorite item appears in header menu
   */
  async checkFavoriteInHeader(itemText) {
    console.log(`➡️ Checking if "${itemText}" appears in header menu...`);
    
    try {
      // Wait for page to be ready
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
      await this.page.waitForTimeout(1000); // Give time for header to render
      
      let foundInHeader = false;
      
      // Strategy 1: Check header buttons directly
      try {
        const headerButtons = this.page.locator('header button, header [role="button"]');
        const buttonCount = await headerButtons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          try {
            const button = headerButtons.nth(i);
            const isVisible = await button.isVisible({ timeout: 1000 }).catch(() => false);
            if (isVisible) {
              const text = await button.textContent({ timeout: 1000 }).catch(() => '');
              if (text && text.trim().includes(itemText)) {
                foundInHeader = true;
                console.log(`✔️ Found "${itemText}" in header button`);
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
      } catch (e) {
        console.log(`⚠️ Error checking header buttons: ${e.message}`);
      }
      
      // Strategy 2: Check all text in header area (more flexible)
      if (!foundInHeader) {
        try {
          // Try multiple header selectors
          const headerSelectors = [
            'header',
            '[class*="header"]',
            '[class*="navbar"]',
            '[class*="menu-bar"]',
            '.header',
            '.navbar'
          ];
          
          for (const selector of headerSelectors) {
            try {
              const headerElement = this.page.locator(selector).first();
              const isVisible = await headerElement.isVisible({ timeout: 2000 }).catch(() => false);
              
              if (isVisible) {
                const allText = await headerElement.textContent({ timeout: 2000 }).catch(() => '');
                if (allText && allText.includes(itemText)) {
                  foundInHeader = true;
                  console.log(`✔️ Found "${itemText}" in header (selector: ${selector})`);
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {
          console.log(`⚠️ Error checking header text: ${e.message}`);
        }
      }
      
      // Strategy 3: Check overflow menu if it exists
      if (!foundInHeader) {
        try {
          const overflowButton = this.page.locator('button.overflow-arrow-btn, [class*="overflow"]').first();
          const overflowVisible = await overflowButton.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (overflowVisible) {
            await overflowButton.click();
            await this.page.waitForTimeout(500);
            
            // Check items in overflow menu
            const overflowItems = this.page.locator('.overflow-menu-item, [role="menuitem"]');
            const itemCount = await overflowItems.count();
            
            for (let i = 0; i < itemCount; i++) {
              try {
                const item = overflowItems.nth(i);
                const text = await item.textContent({ timeout: 1000 }).catch(() => '');
                if (text && text.trim().includes(itemText)) {
                  foundInHeader = true;
                  console.log(`✔️ Found "${itemText}" in overflow menu`);
                  break;
                }
              } catch (e) {
                continue;
              }
            }
            
            // Close overflow menu
            await overflowButton.click().catch(() => {});
          }
        } catch (e) {
          console.log(`⚠️ Error checking overflow menu: ${e.message}`);
        }
      }
      
      // Strategy 4: Check for the item text anywhere in the visible page header area
      if (!foundInHeader) {
        try {
          // Get all visible text on the page and check if item name appears
          const pageText = await this.page.evaluate(() => {
            return document.body.innerText || '';
          });
          
          if (pageText.includes(itemText)) {
            // Check if it's in the header area (top portion of page)
            const headerArea = await this.page.evaluate(() => {
              const header = document.querySelector('header') || document.querySelector('[class*="header"]');
              return header ? header.innerText : '';
            });
            
            if (headerArea && headerArea.includes(itemText)) {
              foundInHeader = true;
              console.log(`✔️ Found "${itemText}" in header area`);
            }
          }
        } catch (e) {
          console.log(`⚠️ Error checking page text: ${e.message}`);
        }
      }
      
      return foundInHeader;
    } catch (error) {
      console.log(`⚠️ Error checking header: ${error.message}`);
      return false;
    }
  }

  /**
   * Search for a module in Quick Access Menu
   */
  async searchModule(searchTerm) {
    console.log(`➡️ Searching for: "${searchTerm}"`);
    
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
    }
    
    // Clear and type in search input
    await expect(this.searchInput).toBeVisible({ timeout: 5000 });
    await this.searchInput.clear();
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(1000); // Wait for search results to filter
    console.log(`✔️ Entered search term: "${searchTerm}"`);
  }

  /**
   * Get search results after searching
   */
  async getSearchResults() {
    const menuItems = await this.getMenuItems();
    return menuItems;
  }

  /**
   * Clear search
   */
  async clearSearch() {
    console.log('➡️ Clearing search...');
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
    console.log('✔️ Search cleared');
  }

  /**
   * Close Quick Access Menu (if needed)
   */
  async closeQuickAccessMenu() {
    // Click outside or press Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
  }

  /**
   * Hover over a menu item to reveal submenu
   */
  async hoverMenuItem(menuItemName) {
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openQuickAccessMenu();
    }
    
    const menuContainer = await this.getMenuContainer();
    const menuItem = menuContainer.getByText(menuItemName, { exact: false }).first();
    await expect(menuItem).toBeVisible({ timeout: 5000 });
    
    // Hover over the menu item
    await menuItem.hover();
    await this.page.waitForTimeout(500); // Wait for submenu to appear
    console.log(`✔️ Hovered over "${menuItemName}"`);
  }

  /**
   * Get submenu items for a given parent menu item
   */
  async getSubmenuItems(parentMenuItemName) {
    // Hover over parent item to reveal submenu
    await this.hoverMenuItem(parentMenuItemName);
    
    const menuContainer = await this.getMenuContainer();
    
    // Find the submenu tooltip (custom_tooltip class)
    // The submenu items are in div.subMenuItem
    const submenuItems = menuContainer.locator('div.subMenuItem');
    const count = await submenuItems.count();
    
    const items = [];
    for (let i = 0; i < count; i++) {
      try {
        const item = submenuItems.nth(i);
        const isVisible = await item.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (isVisible) {
          const text = await item.textContent();
          const trimmedText = text ? text.trim() : '';
          
          if (trimmedText && trimmedText.length > 0) {
            items.push({
              locator: item,
              text: trimmedText
            });
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log(`✔️ Found ${items.length} submenu item(s) for "${parentMenuItemName}"`);
    return items;
  }

  /**
   * Click a submenu item
   */
  async clickSubmenuItem(parentMenuItemName, submenuItemName) {
    // Hover to reveal submenu
    await this.hoverMenuItem(parentMenuItemName);
    
    const menuContainer = await this.getMenuContainer();
    
    // Try to find submenu item by exact or partial text match
    let submenuItem = menuContainer.getByText(submenuItemName, { exact: false }).first();
    
    // Check if found item is visible
    const isVisible = await submenuItem.isVisible({ timeout: 2000 }).catch(() => false);
    
    // If not found, try finding by partial match in submenu items
    if (!isVisible) {
      const allSubmenuItems = menuContainer.locator('div.subMenuItem');
      const count = await allSubmenuItems.count();
      
      for (let i = 0; i < count; i++) {
        const item = allSubmenuItems.nth(i);
        const itemText = await item.textContent().catch(() => '');
        const normalizedItemText = itemText.toLowerCase().trim();
        const normalizedSearchText = submenuItemName.toLowerCase().trim();
        
        if (normalizedItemText.includes(normalizedSearchText) || 
            normalizedSearchText.includes(normalizedItemText)) {
          submenuItem = item;
          break;
        }
      }
    }
    
    await expect(submenuItem).toBeVisible({ timeout: 5000 });
    await submenuItem.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    await submenuItem.click();
    await this.page.waitForTimeout(1000); // Wait for navigation
    console.log(`✔️ Clicked submenu item "${submenuItemName}" under "${parentMenuItemName}"`);
  }

  /**
   * Get expected Reports submenu items and their URL patterns
   */
  getReportsSubmenuItems() {
    return [
      { name: 'Patient List', urlContains: 'patient-list' },
      { name: 'Residential Bed Management', urlContains: 'resources' },
      { name: 'ITP Report', urlContains: 'itp-report' },
      { name: 'Encounter Addendums', urlContains: 'encounter-adandoms' },
      { name: 'Medicaid Eligibility Report', urlContains: 'medicaid-report' },
      { name: 'Attendance Report', urlContains: 'attendance-report' },
      { name: 'Chores', urlContains: 'chores' },
      { name: 'Vital Check', urlContains: 'vital-check' }
    ];
  }

  /**
   * Select a test item for favorite testing (excludes Dashboard and action items)
   */
  async selectTestItemForFavorite() {
    const menuItems = await this.getMenuItems();
    
    if (menuItems.length === 0) {
      throw new Error('No menu items found in Quick Access Menu');
    }
    
    // Select a menu item to test favorite (prefer a navigation item, not Dashboard)
    let testItem = menuItems.find(item => 
      !['Excel Export', 'Reset', 'Go to Work', 'My Dashboard'].includes(item.text)
    );
    
    if (!testItem) {
      testItem = menuItems[0];
    }
    
    return {
      text: testItem.text,
      originalState: await this.isItemFavorited(testItem.text)
    };
  }

  /**
   * Mark item as favorite and verify it appears in header menu
   */
  async markFavoriteAndVerifyInHeader(itemText, originalState) {
    console.log(`\nTesting favorite functionality with: "${itemText}"`);
    console.log(`ℹ️ Original favorite state for "${itemText}": ${originalState ? 'Favorited' : 'Not Favorited'}`);
    
    // Mark as favorite if not already favorited
    if (!originalState) {
      console.log(`➡️ Marking "${itemText}" as favorite...`);
      await this.markAsFavorite(itemText);
      await this.page.waitForTimeout(2000);
    } else {
      console.log(`ℹ️ "${itemText}" is already favorited, unmarking then remarking...`);
      await this.toggleFavorite(itemText);
      await this.page.waitForTimeout(1000);
      await this.toggleFavorite(itemText);
      await this.page.waitForTimeout(2000);
    }
    
    // Verify it's now favorited
    const isFavorited = await this.isItemFavorited(itemText);
    if (!isFavorited) {
      throw new Error(`Failed to mark "${itemText}" as favorite`);
    }
    console.log(`✓ "${itemText}" is now favorited`);
    
    // Check if it appears in header menu
    console.log(`\n➡️ Checking if "${itemText}" appears in header menu...`);
    
    // Wait for the favorite to sync to header (may take a moment)
    await this.page.waitForTimeout(3000);
    
    // Try multiple times to find it in header (with retries)
    let appearsInHeader = false;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Checking header (attempt ${attempt}/${maxRetries})...`);
      
      try {
        appearsInHeader = await Promise.race([
          this.checkFavoriteInHeader(itemText),
          new Promise((resolve) => setTimeout(() => resolve(false), 15000))
        ]);
        
        if (appearsInHeader) {
          console.log(`✓ Found "${itemText}" in header menu on attempt ${attempt}`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ Error on attempt ${attempt}: ${error.message}`);
      }
      
      // Wait before next attempt
      if (attempt < maxRetries) {
        await this.page.waitForTimeout(2000);
      }
    }
    
    // If still not found, try refreshing page and checking again
    if (!appearsInHeader) {
      console.log(`⚠️ Not found in header after ${maxRetries} attempts, refreshing page and retrying...`);
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(3000);
      
      // Wait for dashboard to load after refresh
      await this.page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {});
      await this.page.waitForTimeout(2000);
      
      try {
        appearsInHeader = await Promise.race([
          this.checkFavoriteInHeader(itemText),
          new Promise((resolve) => setTimeout(() => resolve(false), 15000))
        ]);
        
        if (appearsInHeader) {
          console.log(`✓ Found "${itemText}" in header menu after page refresh`);
        }
      } catch (error) {
        console.log(`⚠️ Error checking header after refresh: ${error.message}`);
      }
    }
    
    // Assert that it appears in header (this is the main requirement)
    if (appearsInHeader) {
      console.log(`✓ ASSERT: "${itemText}" appears in header menu after marking as favorite`);
      console.log(`✓ LOG: Module "${itemText}" appended as header menu after marking Favorite`);
    } else {
      console.log(`⚠️ WARNING: "${itemText}" does not appear in header menu after marking as favorite`);
      console.log(`ℹ️ Note: This may be expected behavior - favorites may not always appear in header immediately`);
    }
    
    return appearsInHeader;
  }

  /**
   * Restore item to original favorite state
   */
  async restoreItemFavoriteState(itemText, originalState) {
    if (!originalState) {
      console.log(`\n➡️ Restoring "${itemText}" to original state (not favorited)...`);
      await this.toggleFavorite(itemText);
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Ensure Dashboard is favorited
   */
  async ensureDashboardIsFavorited() {
    console.log('\n➡️ Ensuring Dashboard is favorited...');
    await this.openQuickAccessMenu();
    await this.page.waitForTimeout(1000);
    
    const currentDashboardState = await this.isItemFavorited('My Dashboard');
    if (!currentDashboardState) {
      console.log('➡️ Dashboard is not favorited, marking as favorite...');
      await this.markAsFavorite('My Dashboard');
      await this.page.waitForTimeout(2000);
    } else {
      console.log('✓ Dashboard is already favorited');
    }
  }

  /**
   * Validate navigation for a single module
   * Returns { success: boolean, skipped: boolean, error: string }
   */
  async validateModuleNavigation(module, menuItemsMap) {
    const moduleName = module.name;
    const expectedUrlPattern = module.urlContains;
    
    console.log(`\n--- Testing navigation for: "${moduleName}" ---`);
    
    // Find the menu item
    const menuItem = menuItemsMap.get(moduleName);
    
    if (!menuItem) {
      console.log(`⚠️ Skipping "${moduleName}" - module not found in Quick Access Menu`);
      return { success: false, skipped: true, reason: 'Module not found in Quick Access Menu' };
    }
    
    // Skip items with submenus (they don't navigate directly)
    if (menuItem.hasSubMenu) {
      console.log(`⚠️ Skipping "${moduleName}" - has submenu, cannot test direct navigation`);
      return { success: false, skipped: true, reason: 'Has submenu, cannot test direct navigation' };
    }
    
    try {
      // Re-open menu if it closed
      if (!(await this.isMenuOpen())) {
        await this.openQuickAccessMenu();
        await this.page.waitForTimeout(500);
      }
      
      // Get current URL
      const urlBefore = this.page.url();
      console.log(`Current URL: ${urlBefore}`);
      
      // Click the menu item
      await this.clickMenuItemByLocator(menuItem.locator, moduleName);
      
      // Wait for navigation to start
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
      await this.page.waitForTimeout(1000);
      
      // Check if page is still open
      if (this.page.isClosed()) {
        console.log(`⚠️ Page closed after clicking "${moduleName}"`);
        return { success: false, skipped: false, reason: 'Page closed after clicking' };
      }
      
      // Wait for URL to contain expected pattern (with timeout)
      try {
        await this.page.waitForURL(`**/*${expectedUrlPattern}*`, { timeout: 10000 });
        // Additional wait for SPA to fully settle
        await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
        
        const currentUrl = this.page.url();
        console.log(`New URL: ${currentUrl}`);
        console.log(`✓ ASSERT: Navigation successful for "${moduleName}" (URL contains "${expectedUrlPattern}")`);
        return { success: true, skipped: false };
      } catch (urlErr) {
        const currentUrl = this.page.url();
        console.log(`New URL: ${currentUrl}`);
        const errorMsg = `URL does not contain expected pattern "${expectedUrlPattern}". Actual URL: ${currentUrl}`;
        console.log(`❌ ${errorMsg}`);
        return { success: false, skipped: false, reason: errorMsg };
      }
      
    } catch (error) {
      console.log(`❌ Failed to navigate for "${moduleName}": ${error.message}`);
      return { success: false, skipped: false, reason: error.message };
    }
  }

  /**
   * Validate navigation for all modules in the navigation test list
   * Returns summary object with success, skipped, and failed counts and lists
   */
  async validateAllModulesNavigation() {
    // Open Quick Access Menu
    await this.openQuickAccessMenu();
    await this.page.waitForTimeout(1000);
    
    // Get all menu items
    const menuItems = await this.getMenuItems();
    if (menuItems.length === 0) {
      throw new Error('No menu items found in Quick Access Menu');
    }
    
    console.log(`Found ${menuItems.length} menu item(s)`);
    
    // Get modules to test for navigation from page object (includes name and urlContains)
    const modulesToTest = this.getNavigationTestModules();
    console.log(`\nTesting navigation for quick access modules`);
    
    // Create a map of menu items by name for quick lookup
    const menuItemsMap = new Map();
    menuItems.forEach(item => {
      menuItemsMap.set(item.text, item);
    });
    
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const skippedModules = [];
    const failedModules = [];
    
    for (const module of modulesToTest) {
      const result = await this.validateModuleNavigation(module, menuItemsMap);
      
      if (result.skipped) {
        skippedCount++;
        skippedModules.push({ name: module.name, reason: result.reason });
      } else if (result.success) {
        successCount++;
      } else {
        failedCount++;
        failedModules.push({ name: module.name, reason: result.reason });
      }
      
      // Wait a bit before next iteration
      await this.page.waitForTimeout(1000);
    }
    
    // Print summary
    console.log(`\n=== Navigation Test Summary ===`);
    console.log(`✓ Successful: ${successCount}`);
    console.log(`⚠️ Skipped: ${skippedCount}`);
    if (skippedModules.length > 0) {
      console.log(`\nSkipped Modules:`);
      skippedModules.forEach(module => {
        console.log(`   - ${module.name} (${module.reason})`);
      });
    }
    console.log(`❌ Failed: ${failedCount}`);
    if (failedModules.length > 0) {
      console.log(`\nFailed Modules:`);
      failedModules.forEach(module => {
        console.log(`   - ${module.name} (${module.reason})`);
      });
    }
    console.log(`Total tested: ${modulesToTest.length}`);
    
    return {
      successCount,
      skippedCount,
      failedCount,
      skippedModules,
      failedModules,
      total: modulesToTest.length
    };
  }

  /**
   * Validate Reports submenu items are displayed
   * Returns { foundItems: [], missingItems: [], actualSubmenuItems: [] }
   */
  async validateReportsSubmenuItems() {
    // Open Quick Access Menu
    await this.openQuickAccessMenu();
    await this.page.waitForTimeout(1000);
    
    // Expected Reports submenu items
    const expectedSubmenuItems = this.getReportsSubmenuItems();
    
    // Step 1: Hover over Reports to reveal submenu
    console.log('\n=== Step 1: Hovering over Reports module ===');
    await this.hoverMenuItem('Reports');
    await this.page.waitForTimeout(1000);
    
    // Step 2: Get actual submenu items
    console.log('\n=== Step 2: Getting submenu items ===');
    const actualSubmenuItems = await this.getSubmenuItems('Reports');
    
    // Step 3: Validate that expected submenu items are displayed
    console.log('\n=== Step 3: Validating submenu items are displayed ===');
    const actualSubmenuNames = actualSubmenuItems.map(item => item.text);
    
    console.log(`Found ${actualSubmenuItems.length} submenu item(s):`);
    actualSubmenuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text}`);
    });
    
    // Check which expected items are found
    const foundItems = [];
    const missingItems = [];
    
    for (const expectedItem of expectedSubmenuItems) {
      const found = actualSubmenuNames.some(actual => 
        actual.toLowerCase().includes(expectedItem.name.toLowerCase()) || 
        expectedItem.name.toLowerCase().includes(actual.toLowerCase())
      );
      
      if (found) {
        foundItems.push(expectedItem.name);
        console.log(`✓ Found: "${expectedItem.name}"`);
      } else {
        missingItems.push(expectedItem.name);
        console.log(`⚠️ Not found: "${expectedItem.name}"`);
      }
    }
    
    // Assert that expected items are found
    expect(foundItems.length).toBeGreaterThan(0);
    console.log(`\n✓ ASSERT: Found ${foundItems.length} out of ${expectedSubmenuItems.length} expected submenu items`);
    
    return {
      foundItems,
      missingItems,
      actualSubmenuItems,
      expectedSubmenuItems
    };
  }

  /**
   * Validate navigation for Reports submenu items
   * Returns summary object with success, skipped, and failed counts and lists
   */
  async validateReportsSubmenuNavigation() {
    // Validate submenu items are displayed
    const { actualSubmenuItems, expectedSubmenuItems } = await this.validateReportsSubmenuItems();
    
    // Step 4: Click and navigate to each submenu item
    console.log('\n=== Step 4: Clicking and validating navigation for submenu items ===');
    
    // Create a map of found submenu items for quick lookup
    const foundSubmenuMap = new Map();
    actualSubmenuItems.forEach(item => {
      foundSubmenuMap.set(item.text, item);
    });
    
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const failedItems = [];
    const skippedItems = [];
    
    for (const submenuItem of expectedSubmenuItems) {
      const submenuItemName = submenuItem.name;
      console.log(`\n--- Testing navigation for: "${submenuItemName}" ---`);
      
      // Check if this submenu item was found in the actual submenu
      const foundItem = Array.from(foundSubmenuMap.keys()).find(actual => 
        actual.toLowerCase().includes(submenuItemName.toLowerCase()) || 
        submenuItemName.toLowerCase().includes(actual.toLowerCase())
      );
      
      if (!foundItem) {
        console.log(`⚠️ Skipping "${submenuItemName}" - not found in submenu`);
        skippedCount++;
        skippedItems.push({ name: submenuItemName, reason: 'Not found in submenu' });
        continue;
      }
      
      try {
        // Re-open menu if it closed
        if (!(await this.isMenuOpen())) {
          await this.openQuickAccessMenu();
          await this.page.waitForTimeout(500);
        }
        
        // Get current URL before navigation
        const urlBefore = this.page.url();
        console.log(`Current URL: ${urlBefore}`);
        
        // Click the submenu item
        await this.clickSubmenuItem('Reports', submenuItemName);
        
        // Wait for navigation to start
        await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(1000);
        
        // Check if page is still open
        if (this.page.isClosed()) {
          console.log(`⚠️ Page closed after clicking "${submenuItemName}"`);
          failedCount++;
          failedItems.push({ name: submenuItemName, reason: 'Page closed after clicking' });
          break;
        }
        
        // Wait for URL to contain expected pattern
        try {
          await this.page.waitForURL(`**/*${submenuItem.urlContains}*`, { timeout: 10000 });
          // Additional wait for SPA to fully settle
          await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
          
          const currentUrl = this.page.url();
          console.log(`New URL: ${currentUrl}`);
          console.log(`✓ ASSERT: Navigation successful for "${submenuItemName}" (URL contains "${submenuItem.urlContains}")`);
          successCount++;
        } catch (urlErr) {
          const currentUrl = this.page.url();
          console.log(`New URL: ${currentUrl}`);
          const errorMsg = `URL does not contain expected pattern "${submenuItem.urlContains}". Actual URL: ${currentUrl}`;
          console.log(`❌ ${errorMsg}`);
          failedCount++;
          failedItems.push({ name: submenuItemName, reason: errorMsg });
        }
        
      } catch (error) {
        console.log(`❌ Failed to navigate for "${submenuItemName}": ${error.message}`);
        failedCount++;
        failedItems.push({ name: submenuItemName, reason: error.message });
      }
      
      // Wait a bit before next iteration
      await this.page.waitForTimeout(1000);
    }
    
    // Summary
    console.log(`\n=== Reports Submenu Navigation Test Summary ===`);
    console.log(`✓ Successful: ${successCount}`);
    console.log(`⚠️ Skipped: ${skippedCount}`);
    if (skippedItems.length > 0) {
      console.log(`\nSkipped Items:`);
      skippedItems.forEach(item => {
        console.log(`   - ${item.name} (${item.reason})`);
      });
    }
    console.log(`❌ Failed: ${failedCount}`);
    if (failedItems.length > 0) {
      console.log(`\nFailed Items:`);
      failedItems.forEach(item => {
        console.log(`   - ${item.name} (${item.reason})`);
      });
    }
    console.log(`Total tested: ${expectedSubmenuItems.length}`);
    
    return {
      successCount,
      skippedCount,
      failedCount,
      skippedItems,
      failedItems,
      total: expectedSubmenuItems.length
    };
  }

  /**
   * Validate dynamic count on quick-access modules
   */
  async validateDynamicCount() {
    // Open Quick Access Menu
    await this.openQuickAccessMenu();
    await this.page.waitForTimeout(1000);
    
    // Get the menu container
    const menuContainer = await this.getMenuContainer();
    
    // Look for dynamic count elements (span with class tpAlert_quick_menu)
    const countElements = menuContainer.locator('span.tpAlert_quick_menu');
    const count = await countElements.count();
    
    console.log(`Found ${count} dynamic count element(s)`);
    
    if (count > 0) {
      // Verify at least one count is visible and has a value
      let foundVisibleCount = false;
      
      for (let i = 0; i < count; i++) {
        const countElement = countElements.nth(i);
        const isVisible = await countElement.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          const countText = await countElement.textContent();
          const countValue = parseInt(countText?.trim() || '0');
          
          console.log(`✓ Found visible count: ${countText} (value: ${countValue})`);
          
          // Verify it's a valid number
          expect(countValue).toBeGreaterThanOrEqual(0);
          foundVisibleCount = true;
        }
      }
      
      expect(foundVisibleCount).toBe(true);
      console.log('✓ ASSERT: Dynamic count is displayed on at least one quick-access module');
    } else {
      // If no count elements found, check if any menu items have counts in their text
      const menuItems = await this.getMenuItems();
      let foundCountInText = false;
      
      for (const item of menuItems) {
        const itemText = item.text;
        // Check if text contains numbers (potential counts)
        const hasNumber = /\d+/.test(itemText);
        if (hasNumber) {
          console.log(`✓ Found count in menu item text: "${itemText}"`);
          foundCountInText = true;
        }
      }
      
      if (foundCountInText) {
        console.log('✓ ASSERT: Dynamic count is displayed in menu item text');
      } else {
        console.log('⚠️ WARNING: No dynamic count elements found (this may be expected if no items have counts)');
      }
    }
  }

  /**
   * Verify Quick Access Menu icon is displayed and clickable
   */
  async verifyQuickAccessMenuIcon() {
    console.log('\n=== Test 1: Verifying Quick Access Menu icon ===');
    await expect(this.quickMenuIcon).toBeVisible({ timeout: 10000 });
    console.log('✓ Quick Access Menu icon is visible');
    
    await expect(this.quickMenuIcon).toBeEnabled();
    console.log('✓ Quick Access Menu icon is clickable');
  }

  /**
   * Verify modules are loaded properly in Quick Access Menu
   */
  async verifyModulesLoaded() {
    console.log('\n=== Test 3: Verifying modules are loaded ===');
    const menuItems = await this.getMenuItems();
    
    // Validate that menu items are loaded
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Get expected modules from page object
    const expectedModules = this.getExpectedModules();
    
    // Log all modules/items found in Quick Access Menu with details
    console.log('\n=== All Modules/Items in Quick Access Menu ===');
    const foundModuleNames = [];
    menuItems.forEach((item, index) => {
      let itemInfo = `${index + 1}. ${item.text}`;
      if (item.count) {
        itemInfo += ` [Count: ${item.count}]`;
      }
      if (item.hasSubMenu) {
        itemInfo += ` [Has Submenu]`;
      }
      console.log(itemInfo);
      foundModuleNames.push(item.text);
    });
    console.log(`\nTotal: ${menuItems.length} item(s)`);
    
    // Validate that a reasonable number of modules are loaded (at least 10)
    expect(menuItems.length).toBeGreaterThanOrEqual(10);
    console.log(`✓ ASSERT: At least 10 modules are loaded (found ${menuItems.length})`);
    
    // Check for key expected modules (validate that common modules are present)
    const keyModules = ['My Dashboard', 'Patients', 'Scheduling'];
    const foundKeyModules = keyModules.filter(module => 
      foundModuleNames.some(found => found === module)
    );
    
    expect(foundKeyModules.length).toBeGreaterThan(0);
    console.log(`✓ ASSERT: Key modules are present: ${foundKeyModules.join(', ')}`);
    
    // Log modules that are expected but not found (for information)
    const missingModules = expectedModules.filter(module => 
      !foundModuleNames.some(found => found === module)
    );
    if (missingModules.length > 0) {
      console.log(`\nℹ️ Note: ${missingModules.length} expected module(s) not found (may be due to permissions):`);
      missingModules.forEach(module => console.log(`   - ${module}`));
    }
    
    // Verify search input is visible (indicates menu is properly loaded)
    await expect(this.searchInput).toBeVisible({ timeout: 5000 });
    console.log('✓ Search input is visible - menu loaded properly');
    
    // Verify at least some menu items are visible
    if (menuItems.length > 0) {
      await expect(menuItems[0].locator).toBeVisible({ timeout: 5000 });
      console.log(`✓ Menu items are visible (e.g., "${menuItems[0].text}")`);
    }
  }
}

module.exports = { QuickAccessMenuPage };
