const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { RecurringAppointmentsPage } = require('../pages/RecurringAppointmentsPage');

test.use({ storageState: 'authState.json' });

test.describe('Scheduling Module - Recurring Appointments', () => {

  test('TC71: Recurring pattern generates individual appointments AND Cancelling one occurrence does not cancel series', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);
    console.log('\n=== TC71- Recurring pattern generates individual appointments AND Cancelling one occurrence does not cancel series ===');
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
  
    const result = await recurringAppointmentsPage.testRecurringPatternAndCancellationFlow('Daily', 1, 4);
    
    // Assertions
    expect(result.firstAssertionPassed).toBe(true);
    expect(result.secondAssertionPassed).toBe(true);
    expect(result.appointmentsCancelled).toBe(3);
    console.log(`✓ ASSERT: First assertion passed - Cancelling one occurrence does not cancel series`);
    console.log(`✓ ASSERT: Second assertion passed - Recurring pattern generates individual appointments`);
    console.log(`✓ ASSERT: Cancelled ${result.appointmentsCancelled} appointment(s) successfully`);
    
    console.log('\n✓ TEST COMPLETED: TC71 validation completed');
  });

  test('TC72: Each occurrence can be individually modified', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);

    console.log('\n=== TC72: Each occurrence can be individually modified ===');
    
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
    
    // Test that each occurrence can be individually modified by changing place of service
    // Flow: Create appointment -> Go to each appointment and modify place of service -> Cancel all appointments one by one
    const result = await recurringAppointmentsPage.testOccurrenceIndividualModificationByPlaceOfService('Daily', 1, 4);
    
    // Assertions
    expect(result.modificationsCount).toBeGreaterThan(0);
    expect(result.cancellationsCount).toBeGreaterThan(0);
    console.log(`✓ ASSERT: Modified ${result.modificationsCount} appointment(s) by changing place of service`);
    console.log(`✓ ASSERT: Cancelled ${result.cancellationsCount} appointment(s) successfully`);
    
    console.log('\n✓ TEST COMPLETED: TC72 Each occurrence can be individually modified validation completed');
  });

  test('TC73: Modifying pattern affects only future occurrences', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);

    console.log('\n=== TC73: Modifying pattern affects only future occurrences ===');
    
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
    
    // Test that modifying pattern affects only future occurrences
    const result = await recurringAppointmentsPage.testModifyingPatternAffectsOnlyFutureOccurrences('Daily', 1, 4);
    
    // Assertions
    expect(result).toBe(true);
    console.log('✓ ASSERT: Pattern modification affects only future occurrences');
    
    console.log('\n✓ TEST COMPLETED: TC73 validation completed');
  });

  test('TC74: Maximum 52 occurrences per series', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);

    console.log('\n=== TC74: Maximum 52 occurrences per series ===');
    
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
    
    // Test that default prepopulated end date is 52 days from current date
    // Flow: Appointment type -> Group Therapy -> Repeat -> Until (validate default end date)
    const result = await recurringAppointmentsPage.testMaximumOccurrencesPerSeries('Daily', 1);
    
    // Assertions
    expect(result).toBe(true);
    console.log('✓ ASSERT: Default prepopulated end date is 52 days from current date');
    
    console.log('\n✓ TEST COMPLETED: TC74 validation completed');
  });

});
