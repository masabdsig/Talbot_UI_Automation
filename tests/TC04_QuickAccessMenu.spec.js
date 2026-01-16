const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { QuickAccessMenuPage } = require('../pages/QuickAccessMenuPage');

test.use({ storageState: 'authState.json' });

test.describe('Quick Access Menu Validation', () => {

  test('TC14 - Check Quick Access Menu displayed and verify modules loaded properly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const quickAccessMenuPage = new QuickAccessMenuPage(page);

    await loginPage.navigateToDashboard();
    
    // Test 1: Verify Quick Access Menu icon is displayed and clickable
    await quickAccessMenuPage.verifyQuickAccessMenuIcon();
    
    // Test 2: Click Quick Access Menu and verify it opens
    console.log('\n=== Test 2: Opening Quick Access Menu ===');
    await quickAccessMenuPage.openQuickAccessMenu();
    
    // Test 3: Verify modules are loaded properly
    await quickAccessMenuPage.verifyModulesLoaded();
  });

  test('TC15 - On marking the module as Favorite, module appended as the header menu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const quickAccessMenuPage = new QuickAccessMenuPage(page);

    await loginPage.navigateToDashboard();
    
    try {
      // Open Quick Access Menu
      await quickAccessMenuPage.openQuickAccessMenu();
      await page.waitForTimeout(1000);
      
      // Track original favorite state for Dashboard
      console.log('\n➡️ Checking original favorite state for Dashboard...');
      const dashboardOriginalState = await quickAccessMenuPage.isItemFavorited('My Dashboard');
      console.log(`ℹ️ "My Dashboard" original state: ${dashboardOriginalState ? 'Favorited' : 'Not Favorited'}`);
      
      // Select a test item for favorite testing
      const testItem = await quickAccessMenuPage.selectTestItemForFavorite();
      const { text: testItemText, originalState } = testItem;
      
      // Mark as favorite and verify it appears in header menu
      const appearsInHeader = await quickAccessMenuPage.markFavoriteAndVerifyInHeader(testItemText, originalState);
      
      // Assert that it appears in header
      expect(appearsInHeader).toBe(true);
      
      // Restore original state
      await quickAccessMenuPage.restoreItemFavoriteState(testItemText, originalState);
    } finally {
      // Ensure Dashboard is favorited at the end
      await quickAccessMenuPage.ensureDashboardIsFavorited();
    }
  });

  test('TC16 - Validate search functionality in Quick Access Menu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const quickAccessMenuPage = new QuickAccessMenuPage(page);

    await loginPage.navigateToDashboard();
    
    // Open Quick Access Menu
    await quickAccessMenuPage.openQuickAccessMenu();
    await page.waitForTimeout(1000);
    
    // Get all menu items before search
    const allMenuItems = await quickAccessMenuPage.getMenuItems();
    expect(allMenuItems.length).toBeGreaterThan(0);
    console.log(`Total menu items before search: ${allMenuItems.length}`);
    
    // Test search with a specific term
    const searchTerm = allMenuItems[0].text.substring(0, Math.min(5, allMenuItems[0].text.length));
    console.log(`\nTesting search with term: "${searchTerm}"`);
    
    // Perform search
    await quickAccessMenuPage.searchModule(searchTerm);
    
    // Get search results
    const searchResults = await quickAccessMenuPage.getSearchResults();
    console.log(`Search results count: ${searchResults.length}`);
    
    // Verify search results contain the search term
    const matchingResults = searchResults.filter(item => 
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    expect(matchingResults.length).toBeGreaterThan(0);
    console.log(`✓ ASSERT: Search returned ${matchingResults.length} matching result(s)`);
    console.log(`Matching results: ${matchingResults.map(r => r.text).join(', ')}`);
    
    // Clear search
    await quickAccessMenuPage.clearSearch();
    await page.waitForTimeout(500);
    
    // Verify all items are visible again after clearing
    const itemsAfterClear = await quickAccessMenuPage.getMenuItems();
    console.log(`Menu items after clearing search: ${itemsAfterClear.length}`);
    
    expect(itemsAfterClear.length).toBeGreaterThanOrEqual(allMenuItems.length);
    console.log(`✓ ASSERT: All menu items visible after clearing search`);
  });

  test('TC17 - Clicking the quick access modules and validate the navigation', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes
    const loginPage = new LoginPage(page);
    const quickAccessMenuPage = new QuickAccessMenuPage(page);

    await loginPage.navigateToDashboard();
    
    // Validate navigation for all modules
    const summary = await quickAccessMenuPage.validateAllModulesNavigation();
    
    // Assert that at least some navigations were successful
    expect(summary.successCount).toBeGreaterThan(0);
  });

  test('TC18 - Validate Reports menu items and URLs', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes
    const loginPage = new LoginPage(page);
    const quickAccessMenuPage = new QuickAccessMenuPage(page);

    await loginPage.navigateToDashboard();
    
    // Zoom out to 80%
    await page.evaluate(() => {
      document.body.style.zoom = '0.7';
    });
    await page.waitForTimeout(500); // Wait for zoom to apply
    
    // Validate Reports submenu items and navigation
    const summary = await quickAccessMenuPage.validateReportsSubmenuNavigation();
    
    // Assert that at least some navigations were successful
    expect(summary.successCount).toBeGreaterThan(0);
  });

  test('TC19 - Validate dynamic count on the relevant quick-access module', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const quickAccessMenuPage = new QuickAccessMenuPage(page);

    await loginPage.navigateToDashboard();
    
    // Validate dynamic count on quick-access modules
    await quickAccessMenuPage.validateDynamicCount();
  });

});
