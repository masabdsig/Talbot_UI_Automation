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

  test.skip('TC54. Double-booking allowed if appointment_type.allow_double_booking = true', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    
    // Test double-booking allowance and assert it's allowed
    const doubleBookingAllowed = await bookingRulesPage.testDoubleBookingAllowance('11:00 AM', '30');
    
    // Assert that double-booking is allowed
    expect(doubleBookingAllowed).toBe(true);
    console.log('✓ ASSERT: Double-booking is allowed when appointment_type.allow_double_booking = true');
    
    // Verify both appointments are visible on scheduler
    const eventCount = await bookingRulesPage.countEventsOnScheduler();
    
    // Assert that at least 2 appointments are visible (first + overlapping)
    expect(eventCount).toBeGreaterThanOrEqual(2);
    console.log(`✓ ASSERT: Both appointments are visible on scheduler (found ${eventCount} events)`);
    
    // Clean up: Delete both appointments
    console.log('\n=== Clean up: Delete both appointments ===');
    try {
      // Delete first appointment
      const firstEvent = await bookingRulesPage.verifyEventVisibleOnScheduler();
      if (firstEvent) {
        await firstEvent.dblclick({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1000);
        const modal = bookingRulesPage.modal();
        const isModalOpen = await modal.isVisible({ timeout: 3000 }).catch(() => false);
        if (isModalOpen) {
          await bookingRulesPage.clickDeleteButtonInEditModal().catch(() => {});
          await bookingRulesPage.confirmDeleteEvent().catch(() => {});
          await page.waitForTimeout(1000);
          console.log('✓ First appointment deleted');
        }
      }
      
      // Delete second appointment
      await page.waitForTimeout(1000);
      const secondEvent = await bookingRulesPage.verifyEventVisibleOnScheduler();
      if (secondEvent) {
        await secondEvent.dblclick({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1000);
        const modal2 = bookingRulesPage.modal();
        const isModalOpen2 = await modal2.isVisible({ timeout: 3000 }).catch(() => false);
        if (isModalOpen2) {
          await bookingRulesPage.clickDeleteButtonInEditModal().catch(() => {});
          await bookingRulesPage.confirmDeleteEvent().catch(() => {});
          await page.waitForTimeout(1000);
          console.log('✓ Second appointment deleted');
        }
      }
    } catch (cleanupError) {
      console.log(`ℹ️ Cleanup note: ${cleanupError.message}`);
    }
    
    console.log('\n✓ TEST COMPLETED: Double-booking allowance validation completed');
  });

  test.skip('TC55. Minimum lead time enforced (e.g., cannot book within 2 hours)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testMinimumLeadTime(2);
    
    console.log('\n✓ TEST COMPLETED: Minimum lead time validation completed');
  });

  test('TC56. Maximum advance booking enforced (e.g., max 90 days ahead)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    // Navigate to scheduling page (don't use setupSchedulerForNextDay - we'll go 90 days ahead first)
    await bookingRulesPage.navigateToScheduling(loginPage);
    await bookingRulesPage.waitForSchedulerLoaded();
    
    await bookingRulesPage.testMaximumAdvanceBooking(90);
    
    console.log('\n✓ TEST COMPLETED: Maximum advance booking validation completed');
  });

  test('TC57. Patient cannot have overlapping appointments', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testPatientOverlappingAppointments('2:00 PM', '60', '2:30 PM');
    
    console.log('\n✓ TEST COMPLETED: Patient overlapping appointments validation completed');
  });

  test('TC58. Appointment duration must be positive integer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testDurationValidation();
    
    console.log('\n✓ TEST COMPLETED: Appointment positive duration validation completed');
  });

  test('TC59. End time must be after start time', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testEndTimeValidation('4:00 PM', '30');
    
    console.log('\n✓ TEST COMPLETED: End time validation completed');
  });

  test('TC60. Start time must be in future for new bookings', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingRulesPage = new BookingRulesPage(page);

    await bookingRulesPage.setupSchedulerForNextDay(loginPage);
    await bookingRulesPage.testFutureStartTimeValidation();
    
    console.log('\n✓ TEST COMPLETED: Future start time validation completed');
  });

});

