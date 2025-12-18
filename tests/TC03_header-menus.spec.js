const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { HeaderMenuPage } = require('../pages/HeaderMenuPage');

test.use({ storageState: 'authState.json' });

test('TC11 verify header menus', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const headerMenuPage = new HeaderMenuPage(page);

  // Navigate to dashboard with saved session
  await page.goto('/dashboard');

  // Handle MFA skip 
  await loginPage.skipMfa();

  // Verify header menus
  await headerMenuPage.verifyQuickMenu();
  await headerMenuPage.verifyMyDashboard();
  await headerMenuPage.verifyPatients();
  await headerMenuPage.verifyScheduling();
  await headerMenuPage.verifyFollowupReferrals();
  await headerMenuPage.verifyInternalReferrals();
  await headerMenuPage.verifyTeleHealthVirtualRoom();
  await headerMenuPage.verifyClientMessages();
  await headerMenuPage.verifyCaseManagementTasks();
  await headerMenuPage.verifyNotifications();
  await headerMenuPage.verifyAvatar();
});

test('TC12 navigate and validate all overflow menu items URLs', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const headerMenuPage = new HeaderMenuPage(page);

  // Navigate to dashboard with saved session
  await page.goto('/dashboard');

  // Handle MFA skip if it appears
  await loginPage.skipMfa();

  // Navigate and validate all overflow menu items
  const result = await headerMenuPage.navigateAndValidateOverflowMenuItems();

  // Assert that at menu items were successfully validated
  expect(result.validatedItems.length).toBeGreaterThan(0);
  console.log(`\n✅ Test completed: ${result.validatedItems.length} menu items successfully validated`);
});

test.skip('TC13 navigate and validate Reports menu items and URLs', async ({ page }) => {
  // Set longer timeout for this test as it validates many menu items
  test.setTimeout(300000); // 5 minutes

  const loginPage = new LoginPage(page);
  const headerMenuPage = new HeaderMenuPage(page);

  // Navigate to dashboard with saved session
  await page.goto('/dashboard');

  // Handle MFA skip if it appears
  await loginPage.skipMfa();

  // Navigate and validate all overflow menu items
  const result = await headerMenuPage.navigateAndValidateReportItems();

  // Assert that at all menu items were successfully validated
  expect(result.validatedItems.length).toBeGreaterThan(0);
  console.log(`\n✅ Test completed: ${result.validatedItems.length} menu items successfully validated`);
});