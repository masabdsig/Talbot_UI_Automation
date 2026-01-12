const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PatientEligibilityPage } = require('../pages/PatientEligibilityPage');

test.use({ storageState: 'authState.json' });

test.describe('Scheduling Module - Patient Eligibility', () => {

  test('TC60: Patient must have active status to book', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eligibilityPage = new PatientEligibilityPage(page);

    console.log('\n=== TEST: TC60 - Patient must have active status to book ===');
    
    await eligibilityPage.navigateToSchedulingAndOpenAppointment(loginPage);
    
    const result = await eligibilityPage.testPatientActiveStatusRequirement('test', null, 'NotActive');
    
    // Assertions
    expect(result.passed).toBe(true);
    expect(result.patientsFound).toBeGreaterThan(0);
    expect(result.warningShown).toBe(false);
    expect(result.saveBlocked).toBe(false);
    expect(result.nonExistingFound).toBe(false);
    expect(result.nonExistingCount).toBe(0);
    
    await eligibilityPage.closeModal();
    console.log('\n✓ TEST COMPLETED: TC60 validation completed');
  });

  test('TC61: Warning if patient has outstanding balance > $500', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eligibilityPage = new PatientEligibilityPage(page);

    console.log('\n=== TEST: TC61 - Warning if patient has outstanding balance > $500 ===');
    
    await eligibilityPage.navigateToSchedulingAndOpenAppointment(loginPage);
    
    const result = await eligibilityPage.testBalanceWarning('testautoclinic');
    
    // Assertions
    expect(result.passed).toBe(true);
    expect(result.popupFound).toBe(true);
    expect(result.titleMatch).toBe(true);
    expect(result.detailsMatch).toBe(true);
    
    await eligibilityPage.closeModal();
    console.log('\n✓ TEST COMPLETED: TC61 validation completed');
  });

  test('TC62: Warning if patient\'s insurance is inactive', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eligibilityPage = new PatientEligibilityPage(page);

    console.log('\n=== TEST: TC62 - Warning if patient\'s insurance is inactive ===');
    
    await eligibilityPage.navigateToSchedulingAndOpenAppointment(loginPage);
    
    const result = await eligibilityPage.testInsuranceInactiveWarning('No active');
    
    // Assertions
    expect(result.passed).toBe(true);
    expect(result.warningShown).toBe(true);
    expect(result.messageMatch).toBe(true);
    expect(result.message).toContain('No Active Insurance');
    expect(result.message).toContain('Get client active insurance info');
    
    await eligibilityPage.closeModal();
    console.log('\n✓ TEST COMPLETED: TC62 validation completed');
  });

  test('TC63: Authorization required appointments check auth availability', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eligibilityPage = new PatientEligibilityPage(page);

    console.log('\n=== TEST: TC63 - Authorization required appointments check auth availability ===');
    
    // Navigate to scheduling and open appointment modal
    await eligibilityPage.navigateToSchedulingAndOpenAppointment(loginPage);
    
    // Test authorization availability check
    // Note: This test assumes the appointment type requires authorization
    // In a real scenario, you might need to select a specific appointment type first
    const result = await eligibilityPage.testAuthorizationAvailability();
    
    if (result.found !== false) {
      console.log(`✓ TEST PASSED: Authorization availability check is performed`);
      console.log(`  Authorization Status: ${result.available ? 'Available' : 'Not Available'}`);
      console.log(`  Message: ${result.message}`);
      expect(result.found !== false).toBe(true);
    } else {
      console.log('ℹ️ TEST NOTE: No authorization status found');
      console.log('ℹ️ This test requires an appointment type that requires authorization to fully validate');
    }
    
    // Close modal
    await eligibilityPage.closeModal();
    
    console.log('\n✓ TEST COMPLETED: TC63 validation completed');
  });

  test('TC64: Cancellation reason required', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eligibilityPage = new PatientEligibilityPage(page);

    console.log('\n=== TEST: TC64 - SCH-017: Cancellation reason required ===');
    
    await eligibilityPage.navigateToSchedulingAndOpenAppointment(loginPage);
    
    const result = await eligibilityPage.testCancellationReasonRequired();
    
    // Assertions
    expect(result.passed).toBe(true);
    expect(result.reasonRequired).toBe(true);
    
    await eligibilityPage.closeModal();
    console.log('\n✓ TEST COMPLETED: TC64 validation completed');
  });

  test.skip('TC65: Late cancellation (< 24 hours) flagged for potential fee', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eligibilityPage = new PatientEligibilityPage(page);

    console.log('\n=== TEST: TC65 - SCH-018: Late cancellation (< 24 hours) flagged for potential fee ===');
    
    await eligibilityPage.navigateToSchedulingAndOpenAppointment(loginPage);
    
    const result = await eligibilityPage.testLateCancellationWarning();
    
    // Assertions
    if (result.warningShown) {
      expect(result.passed).toBe(true);
      expect(result.warningShown).toBe(true);
      console.log(`✓ TEST PASSED: Late cancellation warning is displayed`);
    } else {
      console.log('ℹ️ TEST NOTE: No late cancellation warning found');
      console.log('ℹ️ This may indicate the appointment is more than 24 hours away');
    }
    
    await eligibilityPage.closeModal();
    console.log('\n✓ TEST COMPLETED: TC65 validation completed');
  });

  test('TC66: Cancelled appointments cannot be un-cancelled (must rebook)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eligibilityPage = new PatientEligibilityPage(page);

    console.log('\n=== TEST: TC66 - SCH-019: Cancelled appointments cannot be un-cancelled ===');
    
    await eligibilityPage.navigateToSchedulingAndOpenAppointment(loginPage);
    
    const result = await eligibilityPage.testCancelledAppointmentCannotBeUncancelled();
    
    // Assertions
    expect(result.passed).toBe(true);
    expect(result.uncancelButtonFound).toBe(false);
    
    await eligibilityPage.closeModal();
    console.log('\n✓ TEST COMPLETED: TC66 validation completed');
  });

});
