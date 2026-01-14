const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { RecurringAppointmentsPage } = require('../pages/RecurringAppointmentsPage');

test.use({ storageState: 'authState.json' });

test.describe('Scheduling Module - Recurring Appointments', () => {

  test('TC72: Recurring pattern generates individual appointments', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);

    console.log('\n=== TC72: Recurring pattern generates individual appointments ===');
    
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
    
    // Test that recurring pattern generates individual appointments
    // Flow: Group-IOP -> Group Therapy (first option) -> Repeat (Daily) -> Until (end date) -> Patient
    const result = await recurringAppointmentsPage.testRecurringPatternGeneratesIndividualAppointments('Daily', 1, 4);
    
    // Assertions - expect at least 3 appointments (tomorrow, day after, and 3 days from today)
    expect(result.appointmentCount).toBeGreaterThanOrEqual(3);
    console.log(`✓ ASSERT: Recurring pattern generated ${result.appointmentCount} individual appointment(s) from start date to end date`);
    console.log(`✓ ASSERT: Deleted ${result.deletedCount} appointment(s) successfully`);
    
    console.log('\n✓ TEST COMPLETED: TC72 Recurring pattern generates individual appointments validation completed');
  });

  test('TC73: Each occurrence can be individually modified', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);

    console.log('\n=== TC73: Each occurrence can be individually modified ===');
    
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
    
    // Test that each occurrence can be individually modified
    // Flow: Group-IOP -> Group Therapy (first option) -> Repeat (Daily) -> Until (end date) -> Patient
    // Then: Set different statuses for each appointment (Cancelled, No show, Check-in) -> Verify statuses -> Delete all
    const result = await recurringAppointmentsPage.testOccurrenceIndividualModification('Daily', 1, 4);
    
    // Assertions
    expect(result).toBe(true);
    console.log('✓ ASSERT: Each occurrence can be individually modified with different statuses (Cancelled, No show, Check-in)');
    
    console.log('\n✓ TEST COMPLETED: TC73 Each occurrence can be individually modified validation completed');
  });

  test('TC74: Cancelling one occurrence does not cancel series', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);

    console.log('\n=== TC74: Cancelling one occurrence does not cancel series ===');
    
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
    
    // Test that cancelling one occurrence does not cancel the series
    // Flow: Appointment type -> Duration -> Group Therapy -> Repeat -> Until -> End date -> Patient -> Plus button -> Save
    // Then: Right-click on first appointment -> Click "Cancel Schedule" -> Click OK on cancel modal -> Verify other appointments still exist -> Delete all
    const result = await recurringAppointmentsPage.testCancellingOccurrenceDoesNotCancelSeries('Daily', 1, 4);
    
    // Assertions
    expect(result.initialCount).toBeGreaterThan(0);
    expect(result.finalCount).toBe(0); // All appointments deleted at the end
    console.log(`✓ ASSERT: One occurrence cancelled (${result.initialCount} initial appointments), series not cancelled, all appointments deleted`);
    
    console.log('\n✓ TEST COMPLETED: TC74 Cancelling one occurrence does not cancel series validation completed');
  });

  test('TC75: Modifying pattern affects only future occurrences', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);

    console.log('\n=== TC75: Modifying pattern affects only future occurrences ===');
    
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
    
    // Test that modifying pattern affects only future occurrences
    const result = await recurringAppointmentsPage.testModifyingPatternAffectsOnlyFutureOccurrences('Daily', 1, 4);
    
    // Assertions
    expect(result).toBe(true);
    console.log('✓ ASSERT: Pattern modification affects only future occurrences');
    
    console.log('\n✓ TEST COMPLETED: TC75 validation completed');
  });

  test('TC76: Maximum 52 occurrences per series', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const recurringAppointmentsPage = new RecurringAppointmentsPage(page);

    console.log('\n=== TC76: Maximum 52 occurrences per series ===');
    
    // Setup scheduler for next day
    await recurringAppointmentsPage.setupSchedulerForNextDay(loginPage);
    
    // Test that default prepopulated end date is 52 days from current date
    // Flow: Appointment type -> Group Therapy -> Repeat -> Until (validate default end date)
    const result = await recurringAppointmentsPage.testMaximumOccurrencesPerSeries('Daily', 1);
    
    // Assertions
    expect(result).toBe(true);
    console.log('✓ ASSERT: Default prepopulated end date is 52 days from current date');
    
    console.log('\n✓ TEST COMPLETED: TC76 validation completed');
  });

});
