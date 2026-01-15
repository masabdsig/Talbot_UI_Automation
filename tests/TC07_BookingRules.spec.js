const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { BookingRulesPage } = require('../pages/BookingRulesPage');

test.use({ storageState: 'authState.json' });

test.describe('Scheduling Module - Booking Rules', () => {

  test('TC53. Double-booking prevented by default', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testDoubleBookingPrevention();
    
    console.log('\n✓ TEST COMPLETED: Double-booking prevention validation completed');
  });

  test('TC54. Maximum advance booking enforced (e.g., max 90 days ahead)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    // Navigate to scheduling page (don't use setupSchedulerForNextDay - we'll go 90 days ahead first)
    await bookingRulesPage.navigateToScheduling(loginPage);
    await bookingRulesPage.waitForSchedulerLoaded();
    
    await bookingRulesPage.testMaximumAdvanceBooking(90);
    
    console.log('\n✓ TEST COMPLETED: Maximum advance booking validation completed');
  });

  test('TC55. Patient cannot have overlapping appointments', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testPatientOverlappingAppointments('2:00 PM', '60', '2:30 PM');
    
    console.log('\n✓ TEST COMPLETED: Patient overlapping appointments validation completed');
  });

  test('TC56. Appointment duration must be positive integer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testDurationValidation();
    
    console.log('\n✓ TEST COMPLETED: Appointment positive duration validation completed');
  });

  test('TC57. End time must be after start time', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testEndTimeValidation('4:00 PM', '30');
    
    console.log('\n✓ TEST COMPLETED: End time validation completed');
  });

  test('TC58. Start time must be in future for new bookings', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testFutureStartTimeValidation();
    
    console.log('\n✓ TEST COMPLETED: Future start time validation completed');
  });

});

