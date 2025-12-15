import { expect, test } from '@playwright/test';
import { DashboardLocators } from '../pages/UserSetting';

test.use({ storageState: 'authState.json' });

/* -----------------------------------------------------
   BEFORE EACH — Go to Dashboard & Skip 2FA Modal
----------------------------------------------------- */
test.beforeEach(async ({ page }) => {
  const dashboard = new DashboardLocators(page);

  console.log('➡️ Navigating to dashboard...');
  await page.goto('/dashboard');

  console.log('➡️ Validating 2FA modal title is visible...');
  await expect(dashboard.enable2FATitle).toBeVisible();

  console.log('➡️ Clicking Skip button...');
  await dashboard.skipButton.click();

  console.log('➡️ Validating 2FA modal disappears...');
  await expect(dashboard.enable2FATitle).not.toBeVisible();

  console.log('✔️ Logged in & 2FA skipped.');
});

/* -----------------------------------------------------
   TEST 1 — Validate User Settings UI
----------------------------------------------------- */
test('1. Validate feilds of Digital Signature Section ', async ({ page }) => {
  const dashboard = new DashboardLocators(page);

  console.log('➡️ Clicking Avatar icon...');
  await dashboard.avatarIcon.click();

  console.log('➡️ Clicking User Settings...');
  await dashboard.userSettingsButton.click();

  console.log('➡️ Validating User Settings modal is visible...');
  await expect(dashboard.userSettingsModal).toBeVisible();

  console.log('➡️ Validating Set-up Digital Signature menu item...');
  await expect(dashboard.setupDigitalSignatureMenu).toBeVisible();

  console.log('➡️ Validating preview signature image...');
  await expect(dashboard.signatureImage.first()).toBeVisible();

  console.log('➡️ Validating Clear button...');
  await expect(dashboard.clearButton).toBeVisible();

  console.log('➡️ Validating Sign With SignaturePad button...');
  await expect(dashboard.signPadButton).toBeVisible();

  console.log('➡️ Validating PIN input is visible and masked...');
  await expect(dashboard.pinInput).toBeVisible();
  await expect(dashboard.pinInput).toHaveAttribute('type', 'password');

  console.log('➡️ Validating eye icon...');
  await expect(dashboard.pinEyeToggle).toBeVisible();

  console.log('➡️ Validating Upload Signature button...');
  await expect(dashboard.uploadSignatureButton).toBeVisible();

  console.log('➡️ Validating Save Signature button...');
  await expect(dashboard.saveSignatureButton).toBeVisible();

  console.log('➡️ Validating Update PIN button...');
  await expect(dashboard.updatePinButton).toBeVisible();

  console.log('➡️ Validating Close button...');
  await expect(dashboard.closeButton).toBeVisible();
});

/* -----------------------------------------------------
   TEST 2 — Canvas Draw + Clear Validation
----------------------------------------------------- */
test('2. Validate canvas: sign, clear, and confirm canvas is empty', async ({ page }) => {
  const dashboard = new DashboardLocators(page);

  console.log('➡️ Opening User Settings modal...');
  await dashboard.avatarIcon.click();
  await dashboard.userSettingsButton.click();

  console.log('➡️ Waiting for canvas...');
  await expect(dashboard.signatureCanvas).toBeVisible();

  console.log('➡️ Capturing canvas checksum BEFORE drawing...');
  await page.waitForTimeout(1000);
  const beforeDraw = await dashboard.getCanvasData();

  console.log('➡️ Drawing on canvas...');
  await dashboard.drawOnCanvas();

  console.log('➡️ Capturing canvas checksum AFTER drawing...');
  const afterDraw = await dashboard.getCanvasData();

  console.log('➡️ Validating canvas changed after drawing...');
  expect(afterDraw).not.toBe(beforeDraw);

  console.log('➡️ Clicking Clear button...');
  await dashboard.clearButton.click();

  console.log('➡️ Capturing canvas checksum AFTER clearing...');
  const afterClear = await dashboard.getCanvasData();

  console.log('➡️ Validating canvas restored to empty...');
  expect(afterClear).toBe(beforeDraw);
});

/* -----------------------------------------------------
   TEST 3 — Save Signature Without PIN
----------------------------------------------------- */
test('3. Draw on canvas then save signature and validate toaster error', async ({ page }) => {
  const dashboard = new DashboardLocators(page);

  console.log('➡️ Opening User Settings modal...');
  await dashboard.avatarIcon.click();
  await dashboard.userSettingsButton.click();
  await expect(dashboard.userSettingsModal).toBeVisible();

  console.log('➡️ Drawing on canvas...');
  await dashboard.drawOnCanvas();

  console.log('➡️ Clicking Save Signature button...');
  await dashboard.saveSignatureButton.click();

  console.log('➡️ Validating toaster title...');
  await expect(dashboard.toastTitle).toHaveText('Update Provider Signature');

  console.log('➡️ Validating toaster message...');
  await expect(dashboard.toastMessage).toHaveText('Pin is required');
});

/* -----------------------------------------------------
   TEST 4 — Save Signature WITH PIN (Success)
----------------------------------------------------- */
test('4. Draw on canvas, enter PIN, save signature, and validate success toaster', async ({ page }) => {
  const dashboard = new DashboardLocators(page);

  console.log('➡️ Opening User Settings modal...');
  await dashboard.avatarIcon.click();
  await dashboard.userSettingsButton.click();

  console.log('➡️ Clearing and drawing signature...');
  await dashboard.clearButton.click();
  await page.waitForTimeout(1000);
  await dashboard.drawOnCanvas();

  console.log('➡️ Entering PIN...');
  await dashboard.pinInput.fill('1234');

  console.log('➡️ Clicking Save Signature button...');
  await dashboard.saveSignatureButton.click({ force: true });

  console.log('➡️ Validating success toaster title...');
  await expect(dashboard.successToastTitle).toHaveText('Provider Signature');

  console.log('➡️ Validating success toaster message...');
  await expect(dashboard.successToastMessage).toHaveText('Successfully Updated');

  console.log('✔️ Signature saved successfully.');
});

/* -----------------------------------------------------
   TEST 5 — Validate Left Menu Options
----------------------------------------------------- */
test('5. Validate left menu options', async ({ page }) => {
  const dashboard = new DashboardLocators(page);

  console.log("➡️ Validating left menu items...");
  await dashboard.avatarIcon.click();
  await dashboard.userSettingsButton.click();

  for (const item of dashboard.LEFT_MENU_ITEMS) {
    const option = dashboard.leftMenuItems.filter({ hasText: item });
    await expect(option).toBeVisible();
    console.log(`✔ Found menu item: ${item}`);
  }
});

/* -----------------------------------------------------
   TEST 6 — Provider Availability Workflow
----------------------------------------------------- */
test('6. Validate Provider Availability and add new availability', async ({ page }) => {
  const dashboard = new DashboardLocators(page);

  await dashboard.avatarIcon.click();
  await dashboard.userSettingsButton.click();

  console.log('➡️ Clicking Provider Availability...');
  await dashboard.providerAvailabilityMenu.click();

  await expect(dashboard.addProviderAvailabilityButton).toBeVisible();

  console.log('➡️ Opening modal...');
  await dashboard.addProviderAvailabilityButton.click();
  await expect(dashboard.providerModalTitle).toBeVisible();

  console.log('➡️ Selecting Wednesday...');
  await dashboard.weekdayCheckbox("Wednesday").check();

  console.log('➡️ Selecting Available...');
  await dashboard.availableRadio.click();

  console.log('➡️ Selecting From Date (Next Day)...');
  await dashboard.fromDateIcon.click();
  await dashboard.selectNextDay();

  console.log('➡️ Selecting From Time...');
  await dashboard.fromTimeIcon.click();
  await page.getByRole('option', { name: '12:05 AM' }).click();

  console.log('➡️ Selecting To Date...');
  await dashboard.toDateIcon.click();
  await dashboard.selectNextDay();

  console.log('➡️ Selecting To Time...');
  await dashboard.toTimeIcon.click();
  await page.getByRole('option', { name: '6:00 AM' }).click();

  console.log('➡️ Saving availability...');
  await dashboard.saveProviderAvailability.click();

  console.log('➡️ Validating success toaster...');
  await expect(dashboard.successToastTitle).toHaveText('Provider Availability');
  await expect(dashboard.successToastMessage).toHaveText('Created Successfully');

  console.log('✔️ Provider Availability added successfully.');
});
