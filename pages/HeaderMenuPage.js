const { expect } = require('@playwright/test');

class HeaderMenuPage {
  constructor(page) {
    this.page = page;
    this.quickMenuButton = page.getByRole('button').first();
    this.myDashboardButton = page.getByRole('button', { name: 'My Dashboard' });
    this.patientsButton = page.getByRole('button', { name: 'Patients' });
    this.schedulingButton = page.getByRole('button', { name: 'Scheduling' });
    this.followupReferralsButton = page.getByRole('button', { name: 'Followup Referrals' });
    this.InternalReferralsButton = page.getByRole('button', { name: 'Internal Referrals' });
    this.TeleHealthVirtualRoomButton = page.getByRole('button', { name: 'Tele Health-Virtual Room' });
    this.ClientMessageButton = page.getByRole('button', { name: 'Client Messages' });
    this.CaseManagementTasksButton = page.getByRole('button', { name: 'Case Management Tasks' });
    this.notificationsLink = page.getByRole('link', { name: 'Dosespot Notifications' });
    this.avatarImage = page.getByRole('img', { name: 'Avatar' });
    this.overflowArrowButton = page.locator('button.overflow-arrow-btn');
    this.overflowMenuItems = page.locator('.overflow-menu-item, .menu-item, [role="menuitem"]');
  }

  async verifyQuickMenu() {
    console.log('➡️ Verifying Quick Menu button is visible');
    await expect(this.quickMenuButton).toBeVisible();
    console.log('✔️ Quick Menu button is visible');
    await this.quickMenuButton.click();
    await this.quickMenuButton.click(); // Close menu
    console.log('✔️ Quick Menu opened and closed successfully');
  }

  async verifyMyDashboard() {
    console.log('➡️ Verifying My Dashboard button is visible');
    await expect(this.myDashboardButton).toBeVisible();
    console.log('✔️ My Dashboard button is visible');
    await this.myDashboardButton.click();
    console.log('➡️ Verifying navigation to dashboard');
    await expect(this.page).toHaveURL(/.*dashboard/);
    console.log('✔️ Successfully navigated to dashboard');
  }

  async verifyPatients() {
    console.log('➡️ Verifying Patients button is visible');
    await expect(this.patientsButton).toBeVisible();
    console.log('✔️ Patients button is visible');
    await this.patientsButton.click();
    console.log('➡️ Verifying navigation to patients page');
    await expect(this.page).toHaveURL(/.*patients/);
    console.log('✔️ Successfully navigated to patients page');
  }

  async verifyScheduling() {
    console.log('➡️ Verifying Scheduling button is visible');
    await expect(this.schedulingButton).toBeVisible();
    console.log('✔️ Scheduling button is visible');
    await this.schedulingButton.click();
    console.log('➡️ Verifying navigation to scheduling page');
    await expect(this.page).toHaveURL(/.*scheduling/);
    console.log('✔️ Successfully navigated to scheduling page');
  }

  async verifyFollowupReferrals() {
    console.log('➡️ Verifying Followup Referrals button is visible');
    await expect(this.followupReferralsButton).toBeVisible();
    console.log('✔️ Followup Referrals button is visible');
    await this.followupReferralsButton.click();
    console.log('➡️ Verifying navigation to followup-referrals page');
    await expect(this.page).toHaveURL(/.*followup-referrals/);
    console.log('✔️ Successfully navigated to followup-referrals page');
  }

  async verifyInternalReferrals() {
    console.log('➡️ Verifying Internal Referrals button is visible');
    await expect(this.InternalReferralsButton).toBeVisible();
    console.log('✔️ Internal Referrals button is visible');
    await this.InternalReferralsButton.click();
    console.log('➡️ Verifying navigation to internal referrals page');
    await expect(this.page).toHaveURL(/.*followup-referrals\/internal/);
    console.log('✔️ Successfully navigated to internal referrals page');
  }

  async verifyTeleHealthVirtualRoom() {
    console.log('➡️ Verifying Tele Health-Virtual Room button is visible');
    await expect(this.TeleHealthVirtualRoomButton).toBeVisible();
    console.log('✔️ Tele Health-Virtual Room button is visible');
    await this.TeleHealthVirtualRoomButton.click();
    console.log('➡️ Verifying navigation to Health-Virtual-room page');
    await expect(this.page).toHaveURL(/.*client-waiting-room/);
    console.log('✔️ Successfully navigated to Health-Virtual-room page');
  }

  async verifyClientMessages() {
    console.log('➡️ Verifying Client Messages button is visible');
    await expect(this.ClientMessageButton).toBeVisible();
    console.log('✔️ client messages button is visible');
    await this.ClientMessageButton.click();
    console.log('➡️ Verifying navigation to client messages page');
    await expect(this.page).toHaveURL(/.*client-messages/);
    console.log('✔️ Successfully navigated to client messages page');
  }

  async verifyCaseManagementTasks() {
    console.log('➡️ Verifying case management tasks button is visible');
    await expect(this.CaseManagementTasksButton).toBeVisible();
    console.log('✔️ Tele case management tasks button is visible');
    await this.CaseManagementTasksButton.click();
    console.log('➡️ Verifying navigation to case management tasks page');
    await expect(this.page).toHaveURL(/.*casemanagement-tasks/);
    console.log('✔️ Successfully navigated to case management tasks page');
  }

  async verifyNotifications() {
    console.log('➡️ Verifying Notifications link is visible');
    await expect(this.notificationsLink).toBeVisible();
    console.log('✔️ Notifications link is visible');
    await this.notificationsLink.click();
    console.log('➡️ Verifying navigation to notifications page');
    await expect(this.page).toHaveURL(/.*notifications/);
    console.log('✔️ Successfully navigated to notifications page');
  }

  async verifyAvatar() {
    console.log('➡️ Verifying Avatar image is visible');
    await expect(this.avatarImage).toBeVisible();
    console.log('✔️ Avatar image is visible');
    await this.avatarImage.click();
    console.log('➡️ Verifying user menu items are visible');
    await expect(this.page.getByText('frontdesk1 dev1')).toBeVisible();
    console.log('✔️ User name "frontdesk1 dev1" is visible');
    await expect(this.page.getByText('User Settings')).toBeVisible();
    console.log('✔️ User Settings menu item is visible');
    await expect(this.page.getByText('Sign Out')).toBeVisible();
    console.log('✔️ Sign Out menu item is visible');
  }

  async navigateAndValidateOverflowMenuItems() {

    console.log('➡️ Starting navigation and validation of overflow menu items');
    await expect(this.overflowArrowButton).toBeVisible();
    console.log('✔️ Overflow arrow button is visible');

    // Expected menu items and expected URL fragment
    const menuList = [
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
      { name: 'Approve Residential Billing', urlContains: 'approve-residential-billing' },
      { name: 'Lab Utilization Report', urlContains: 'lab-utilization-report' },
      { name: 'Firedrill Inspections', urlContains: 'firedrill-inspections' },
      { name: 'Restore Documents', urlContains: 'deleted-docs' }
    ];

    const validatedItems = [];
    const failedItems = [];

    // Helper: check if overflow menu is open by checking first item visibility
    const isOverflowMenuOpen = async () => {
      const firstOption = this.page.getByText(menuList[0].name, { exact: false });
      return await firstOption.isVisible();
    };

    console.log('➡️ Navigating overflow menu items...');

    for (const item of menuList) {
      console.log(`\n➡️ Checking: "${item.name}"`);

      // Determine whether menu is already open
      if (!(await isOverflowMenuOpen())) {
        console.log("↪️ Overflow menu is closed — opening it");
        // Wait for loader to disappear before clicking
        await this.waitForLoaderToDisappear();
        await this.overflowArrowButton.click();
        await this.page.waitForTimeout(300);
      } else {
        console.log("✔️ Overflow menu already open");
      }

      const menuLocator = this.page.getByText(item.name, { exact: false }).first();

      try {
        await expect(menuLocator).toBeVisible({ timeout: 2000 });
        console.log(`✔️ Found: ${item.name}`);

        await menuLocator.click();
        console.log(`✔️ Clicked: ${item.name}`);

        // Wait for navigation to start before checking URL
        await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});

        // Validate URL contains expected string
        try {
          await this.page.waitForURL(`**/*${item.urlContains}*`, { timeout: 10000 });
          // Additional wait for SPA to fully settle
          await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
          console.log(`✔️ URL validated for: ${item.name}`);
          validatedItems.push(item.name);
        } catch (urlErr) {
          const currentUrl = this.page.url();
          console.log(`❌ URL did NOT match expected for: ${item.name}`);
          console.log(`   Expected URL to contain: "${item.urlContains}"`);
          console.log(`   Actual URL: ${currentUrl}`);
          failedItems.push(item.name);
        }

      } catch (e) {
        console.log(`❌ NOT FOUND in overflow menu: "${item.name}"`);
        failedItems.push(item.name);
      }

      // After navigation, wait a bit before next iteration
      await this.page.waitForTimeout(300);
    }

    console.log('\n📊 Navigation Summary');
    console.log(`✔️ Validated: ${validatedItems.length}`);
    // console.log(validatedItems);
    console.log(`❌ Failed: ${failedItems.length}`);
    console.log(failedItems);

    return {
      validatedItems,
      failedItems
    };
  }

  async navigateAndValidateReportItems() {

    console.log('➡️ Starting navigation and validation of Report menu items');
    await expect(this.overflowArrowButton).toBeVisible();
    console.log('✔️ Overflow arrow button is visible');
  
    // Report submenu items and expected URL fragment
    const reportMenuList = [
      { name: 'Residential Bed Management', urlContains: 'resources' },
      { name: 'ITP Report', urlContains: 'itp-report' },
      { name: 'Chores', urlContains: 'chores' },
      { name: 'Safety Check', urlContains: 'patient-safety-check-log' },
      { name: 'Vital Check', urlContains: 'vital-check' },
      { name: 'Encounter Addendums', urlContains: 'encounter-adandoms' },
      { name: 'ITP Missing Report', urlContains: 'itp-missing-report' },
      { name: 'DE Missing Report', urlContains: 'de-missing-report' },
      { name: 'Insurance Mismatched', urlContains: 'insurancetype-mismatched-report' },
      { name: 'Missing MITS Document', urlContains: 'missing-mits' },
      { name: 'Bad Demographics', urlContains: 'bad-demographic' },
      { name: 'Unbilled Encounters', urlContains: 'unbilled-encounters' },
      { name: 'Hold Billing Encounters', urlContains: 'hold-billing-encounters' },
      { name: 'Patient Balance Report', urlContains: 'patient-balance-report' },
      { name: 'Methasoft Report', urlContains: 'methasoft-report' },
      { name: 'Daily Close Report', urlContains: 'daily-close-payment' },
      { name: 'Appointments Report', urlContains: 'view-appointment-report' },
      { name: 'DE to be Scheduled', urlContains: 'de-report' },
      { name: 'Agency Billing', urlContains: 'agency-billing' },
      { name: 'Billing Program Report', urlContains: 'billing-program-list' },
      { name: 'Agency Client', urlContains: 'agency-client' },
      { name: 'Caseload Report', urlContains: 'caseload-report' },
      { name: 'Bulk Statement', urlContains: 'bulk-statement' },
      { name: 'Clinical Supervision Report', urlContains: 'clinical-supervision-report' },
      { name: 'Client Service Tracker', urlContains: 'monthly-analysis' },
      { name: 'Monthly Report For Prescriber', urlContains: 'monthly-analysis-prescriber' },
      { name: 'Staff Performance Report', urlContains: 'revenue-report' },
      { name: 'Groups Summary', urlContains: 'group-encounter' },
      { name: 'Residential Summary', urlContains: 'residential-summary' },
      { name: 'Group Encounters', urlContains: 'group-encounters' },
      { name: 'Staff Productivity', urlContains: 'staff-productivity' },
      { name: 'No Careteam', urlContains: 'no-careteam' },
      { name: 'Intervention/Discharge', urlContains: 'intervention-discharge' },
      { name: 'Residential Billing Summary', urlContains: 'residential-billing-summary' },
      { name: 'Locked Patients', urlContains: 'patient-locked' },
      { name: 'Residential Admission', urlContains: 'residential-admission-summary' },
      { name: 'Budget Report', urlContains: 'budget-report' },
      { name: 'Medical Inactive patient', urlContains: 'inactive-patients' }
    ];
  
    const validatedItems = [];
    const failedItems = [];
  
    // Helper: overflow menu open check
    const isOverflowMenuOpen = async () => {
      try {
        const reportsOption = this.page.getByText('Reports', { exact: false });
        return await reportsOption.isVisible({ timeout: 2000 });
      } catch {
        return false;
      }
    };
  
    console.log('➡️ Navigating Report menu items...');
  
    for (const report of reportMenuList) {
      console.log(`\n➡️ Checking Report Menu: "${report.name}"`);

      try {
        // Wait for header to be ready (overflow menu is always available)
        await this.waitForHeaderReady();
        
        // Ensure overflow menu is open
        if (!(await isOverflowMenuOpen())) {
          // Wait for the overflow button to truly be visible & interactable
          await expect(this.overflowArrowButton).toBeVisible({ timeout: 8000 });
          await expect(this.overflowArrowButton).toBeEnabled();
        
          // Wait for loader to disappear before clicking
          await this.waitForLoaderToDisappear();
          await this.overflowArrowButton.click();
          await this.page.waitForTimeout(300);
        }
        
        // Hover over "Reports" to open its submenu
        const reportsMenu = this.page.getByText('Reports', { exact: false }).first();
        await expect(reportsMenu).toBeVisible({ timeout: 5000 });
        await reportsMenu.hover();
        console.log("✔️ Hovered on 'Reports' to open submenu");
        
        // Wait for submenu to appear and stabilize (critical for hover-based menus)
        await this.page.waitForTimeout(600);

        // Now find the report item inside submenu
        const reportLocator = this.page.getByText(report.name, { exact: false }).first();

        await expect(reportLocator).toBeVisible({ timeout: 6000 });
        console.log(`✔️ Found in submenu: ${report.name}`);

        await reportLocator.click();
        console.log(`✔️ Clicked: ${report.name}`);

        // Wait for navigation to start before checking URL
        await this.page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => {});

        // Validate URL contains expected fragment
        try {
          await this.page.waitForURL(`**/*${report.urlContains}*`, { timeout: 12000 });
          // Additional wait for SPA to fully settle
          await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
          console.log(`✔️ URL validated for: ${report.name}`);
          validatedItems.push(report.name);
        } catch (urlErr) {
          try {
            const currentUrl = this.page.url();
            console.log(`❌ URL mismatch for: ${report.name}`);
            console.log(`   Expected URL to contain: "${report.urlContains}"`);
            console.log(`   Actual URL: ${currentUrl}`);
          } catch {
            console.log(`❌ URL mismatch for: ${report.name} (page may be closed)`);
          }
          failedItems.push(report.name);
        }

      } catch (e) {
        // More specific error handling to distinguish between visibility and click failures
        if (e.message && (e.message.includes('timeout') || e.message.includes('not visible') || e.message.includes('closed'))) {
          console.log(`❌ NOT FOUND in Reports submenu: "${report.name}"`);
          console.log(`   Error: ${e.message}`);
        } else {
          console.log(`❌ Error interacting with "${report.name}": ${e.message || 'Unknown error'}`);
        }
        failedItems.push(report.name);
        
        // Check if page is still valid before waiting
        try {
          // Small delay before next iteration to allow page to stabilize
          await this.page.waitForTimeout(300);
        } catch (waitError) {
          // Page might be closed, log and break out of loop
          if (waitError.message && waitError.message.includes('closed')) {
            console.log(`⚠️ Page closed, stopping test execution`);
            break;
          }
        }
      }
    }
  
    console.log('\n📊 Reports Navigation Summary');
    console.log(`✔️ Validated: ${validatedItems.length}`);
    console.log(`❌ Failed: ${failedItems.length}`);
    console.log(failedItems);
  
    return { validatedItems, failedItems };
  }

  async waitForHeaderReady() {
    // Ensure page load state is stable
    await this.page.waitForLoadState('domcontentloaded', { timeout: 8000 });
  
    // Wait for any pending network calls (SPA apps need this)
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  
    // Overflow menu is always available on header, ensure it's ready
    await expect(this.overflowArrowButton).toBeVisible({ timeout: 6000 });
    await expect(this.overflowArrowButton).toBeEnabled();
  }

  async waitForLoaderToDisappear() {
    // Wait for loader overlay to disappear before interacting with elements
    const loaderSelector = 'patient-loader .loader-wrapper, .loader-wrapper, patient-loader';
    
    try {
      // Check if loader exists and is visible
      const loader = this.page.locator(loaderSelector).first();
      const isVisible = await loader.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (isVisible) {
        console.log('⏳ Waiting for loader to disappear...');
        // Wait for loader to be hidden (not intercepting clicks)
        await loader.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
          // If it doesn't hide, wait for it to be removed from DOM
          return this.page.waitForSelector(loaderSelector, { state: 'detached', timeout: 15000 }).catch(() => {});
        });
        console.log('✔️ Loader disappeared');
      }
    } catch (e) {
      // Loader might not exist or already gone, which is fine
      // Continue execution
    }
    
    // Additional small wait to ensure UI is stable after loader disappears
    await this.page.waitForTimeout(300);
  }
  
}

module.exports = { HeaderMenuPage };

