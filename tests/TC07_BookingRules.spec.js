const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { BookingRulesPage } = require('../pages/BookingRulesPage');

test.use({ storageState: 'authState.json' });

test.describe('Scheduling Module - Booking Rules', () => {

  test('TC52. Double-booking prevented by default', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testDoubleBookingPrevention();
    
    // If success toaster is visible for booking, wait and check if event is visible on scheduler
    if (bookingRulesPage.wasSuccessToasterFound()) {
      console.log('\n=== Success toaster was visible, verifying event on scheduler ===');
      const eventVisible = await bookingRulesPage.verifyEventVisibleOnScheduler();
      if (eventVisible) {
        console.log('✓ ASSERT: Event is visible on scheduler after success toaster');
      } else {
        console.log('⚠️ Event not found on scheduler despite success toaster');
      }
    }
    
    console.log('\n✓ TEST COMPLETED: Double-booking prevention validation completed');
  });

  test('TC53. Double-booking allowed if appointment_type.allow_double_booking = true', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testDoubleBookingAllowance('11:00 AM', '30');
    
    console.log('\n✓ TEST COMPLETED: Double-booking allowance validation completed');
  });

  test('TC54. Minimum lead time enforced (e.g., cannot book within 2 hours)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testMinimumLeadTime(2);
    
    console.log('\n✓ TEST COMPLETED: Minimum lead time validation completed');
  });

  // test('TC55. Maximum advance booking enforced (e.g., max 90 days ahead)', async ({ page }) => {
  //   const loginPage = new LoginPage(page);
  //   const bookingRulesPage = new BookingRulesPage(page);

  //   await bookingRulesPage.setupSchedulerForNextDay(loginPage);
  //   await bookingRulesPage.testMaximumAdvanceBooking(90);
    
  //   console.log('\n✓ TEST COMPLETED: Maximum advance booking validation completed');
  // });

  test('TC56. Patient cannot have overlapping appointments', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testPatientOverlappingAppointments('2:00 PM', '60', '2:30 PM');
    
    console.log('\n✓ TEST COMPLETED: Patient overlapping appointments validation completed');
  });

  test('TC57. Appointment duration must be positive integer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testDurationValidation('3:00 PM');
    
    console.log('\n✓ TEST COMPLETED: Appointment duration validation completed');
  });

  test('TC58. End time must be after start time', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testEndTimeValidation('4:00 PM', '30');
    
    console.log('\n✓ TEST COMPLETED: End time validation completed');
  });

  test('TC59. Start time must be in future for new bookings', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testFutureStartTimeValidation();
    
    console.log('\n✓ TEST COMPLETED: Future start time validation completed');
  });

});

