const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { SchedulingPage } = require('../pages/SchedulingPage');

test.use({ storageState: 'authState.json' });

test.describe('Scheduling Module - Booking Rules', () => {

  test('SCH-005. Double-booking prevented by default', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const schedulingPage = new SchedulingPage(page);

    await schedulingPage.setupSchedulerForNextDay(loginPage);
    await schedulingPage.testDoubleBookingPrevention('10:00 AM', '30');
    
    console.log('\n✓ TEST COMPLETED: Double-booking prevention validation completed');
  });

  test('SCH-006. Double-booking allowed if appointment_type.allow_double_booking = true', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const schedulingPage = new SchedulingPage(page);

    await schedulingPage.setupSchedulerForNextDay(loginPage);
    await schedulingPage.testDoubleBookingAllowance('11:00 AM', '30');
    
    console.log('\n✓ TEST COMPLETED: Double-booking allowance validation completed');
  });

  test('SCH-007. Minimum lead time enforced (e.g., cannot book within 2 hours)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const schedulingPage = new SchedulingPage(page);

    await schedulingPage.setupSchedulerForNextDay(loginPage);
    await schedulingPage.testMinimumLeadTime(2);
    
    console.log('\n✓ TEST COMPLETED: Minimum lead time validation completed');
  });

  // test('SCH-008. Maximum advance booking enforced (e.g., max 90 days ahead)', async ({ page }) => {
  //   const loginPage = new LoginPage(page);
  //   const schedulingPage = new SchedulingPage(page);

  //   await schedulingPage.setupSchedulerForNextDay(loginPage);
  //   await schedulingPage.testMaximumAdvanceBooking(90);
    
  //   console.log('\n✓ TEST COMPLETED: Maximum advance booking validation completed');
  // });

  test('SCH-009. Patient cannot have overlapping appointments', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const schedulingPage = new SchedulingPage(page);

    await schedulingPage.setupSchedulerForNextDay(loginPage);
    await schedulingPage.testPatientOverlappingAppointments('2:00 PM', '60', '2:30 PM');
    
    console.log('\n✓ TEST COMPLETED: Patient overlapping appointments validation completed');
  });

  test('SCH-010. Appointment duration must be positive integer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const schedulingPage = new SchedulingPage(page);

    await schedulingPage.setupSchedulerForNextDay(loginPage);
    await schedulingPage.testDurationValidation('3:00 PM');
    
    console.log('\n✓ TEST COMPLETED: Appointment duration validation completed');
  });

  test('SCH-011. End time must be after start time', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const schedulingPage = new SchedulingPage(page);

    await schedulingPage.setupSchedulerForNextDay(loginPage);
    await schedulingPage.testEndTimeValidation('4:00 PM', '30');
    
    console.log('\n✓ TEST COMPLETED: End time validation completed');
  });

  test('SCH-012. Start time must be in future for new bookings', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const schedulingPage = new SchedulingPage(page);

    await schedulingPage.setupSchedulerForNextDay(loginPage);
    await schedulingPage.testFutureStartTimeValidation();
    
    console.log('\n✓ TEST COMPLETED: Future start time validation completed');
  });

});

