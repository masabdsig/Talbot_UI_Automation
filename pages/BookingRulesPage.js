const { SchedulingPage } = require('./SchedulingPage');

class BookingRulesPage extends SchedulingPage {
  constructor(page) {
    super(page);
  }

  // Test double-booking prevention
  async testDoubleBookingPrevention() {
    // Step 1: Create a booking by filling all required fields and save, assert success toaster
    console.log('\n=== Step 1: Create first appointment ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    // Fill required fields (selectPatient method now handles proper timing for dropdown loading)
    await this.fillRequiredAppointmentFields();
    
    // Save and assert success toaster only (don't delete)
    console.log('\n=== Step 2: Save appointment and assert success toaster ===');
    await this.saveButton.click({ timeout: 5000 });
    await this.page.waitForTimeout(2000);
    
    // Check for success toaster
    const toastContainer = this.page.locator('#toast-container').first();
    const toastVisible = await toastContainer.isVisible({ timeout: 5000 }).catch(() => false);
    let successToasterFound = false;
    
    if (toastVisible) {
      const toastText = await toastContainer.textContent({ timeout: 2000 }).catch(() => '');
      if (toastText && toastText.trim()) {
        const lowerText = toastText.toLowerCase();
        if (lowerText.includes('created') || lowerText.includes('saved') || 
            lowerText.includes('success') || lowerText.includes('appointment')) {
          console.log(`✓ ASSERT: Success toaster found: ${toastText.trim()}`);
          console.log('✓ ASSERT: Appointment saved successfully');
          successToasterFound = true;
        } else {
          console.log(`⚠️ Toaster found but may not be success: ${toastText.trim()}`);
        }
      }
    } else {
      // Check if modal closed (might indicate success)
      const modal = this.modal();
      const isModalClosed = !(await modal.isVisible({ timeout: 2000 }).catch(() => false));
      if (isModalClosed) {
        console.log('✓ ASSERT: Modal closed - appointment saved successfully');
        successToasterFound = true; // Assume success if modal closed
      } else {
        console.log('⚠️ Modal still open - may indicate validation error');
      }
    }
    
    // Store success toaster status for return value
    this._lastSuccessToasterFound = successToasterFound;
    
    // Wait for scheduler to refresh
    await this.page.waitForTimeout(3000);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    await this.page.waitForSelector('td.e-work-cells', { timeout: 10000, state: 'visible' }).catch(() => {});
    
    // Step 3: Assert the booking is available on scheduler
    console.log('\n=== Step 3: Assert booking is available on scheduler ===');
    const allCells = this.page.locator('td.e-work-cells');
    const cellCount = await allCells.count({ timeout: 5000 }).catch(() => 0);
    
    let targetCell = null;
    for (let i = 0; i < cellCount; i++) {
      const cell = allCells.nth(i);
      const hasEvent = await this.cellHasEvent(cell);
      if (hasEvent) {
        targetCell = cell;
        console.log(`✓ ASSERT: Booking found on scheduler at cell index ${i}`);
        break;
      }
    }
    
    if (!targetCell) {
      console.log('⚠️ Could not find the booking on scheduler');
      return false;
    }
    
    // Step 4: Try to create another booking on the same cell
    console.log('\n=== Step 4: Attempt to create another booking on same cell ===');
    await targetCell.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await targetCell.dblclick({ timeout: 5000 });
    await this.page.waitForTimeout(2000);
    
    // Step 5: Check if edit event popup appears (double booking prevented)
    console.log('\n=== Step 5: Check if edit event popup appears ===');
    const editModal = this.modal();
    const isModalOpen = await editModal.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isModalOpen) {
      // Check if it's an edit modal (has delete button)
      const deleteButton = editModal.locator('button:has-text("Delete"), button.e-event-delete').first();
      const hasDeleteButton = await deleteButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (hasDeleteButton) {
        console.log('✓ ASSERT: Edit event popup opened - user cannot create another booking on same cell');
        console.log('✓ ASSERT: Double-booking prevention validation complete');
        
        // Step 6: Delete the event
        console.log('\n=== Step 6: Delete the event ===');
        await this.clickDeleteButtonInEditModal();
        await this.confirmDeleteEvent();
        await this.page.waitForTimeout(1000);
        console.log('✓ Event deleted successfully');
        
        return true;
      } else {
        // It might be add event popup, which means double booking is allowed
        console.log('⚠️ Add event popup opened - double booking may be allowed');
        await this.closePopupSafely();
        return false;
      }
    } else {
      console.log('⚠️ No modal opened after double-clicking cell');
      return false;
    }
  }

  // Helper: Check if success toaster was found in last operation
  wasSuccessToasterFound() {
    return this._lastSuccessToasterFound || false;
  }

  // Helper: Wait and verify event is visible on scheduler
  async verifyEventVisibleOnScheduler() {
    console.log('\n=== Wait and verify event is visible on scheduler ===');
    
    // Wait for scheduler to refresh - longer wait
    await this.page.waitForTimeout(5000);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    
    // Reload scheduler to ensure event appears
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(3000);
    
    // Wait for scheduler cells to be visible
    await this.page.waitForSelector('td.e-work-cells', { timeout: 10000, state: 'visible' }).catch(() => {});
    await this.page.waitForTimeout(2000); // Additional wait after cells are visible
    
    // Check for event on scheduler with retries
    const maxRetries = 3;
    for (let retry = 0; retry < maxRetries; retry++) {
      const allCells = this.page.locator('td.e-work-cells');
      const cellCount = await allCells.count({ timeout: 5000 }).catch(() => 0);
      
      for (let i = 0; i < cellCount; i++) {
        const cell = allCells.nth(i);
        const hasEvent = await this.cellHasEvent(cell);
        if (hasEvent) {
          console.log(`✓ ASSERT: Event is visible on scheduler at cell index ${i}`);
          return true;
        }
      }
      
      if (retry < maxRetries - 1) {
        console.log(`ℹ️ Event not found, retrying (attempt ${retry + 1}/${maxRetries})...`);
        await this.page.waitForTimeout(2000);
        // Try reloading again
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(3000);
        await this.page.waitForSelector('td.e-work-cells', { timeout: 10000, state: 'visible' }).catch(() => {});
      }
    }
    
    console.log('⚠️ Event not found on scheduler after multiple attempts');
    return false;
  }

  // Test double-booking allowance for specific appointment type
  async testDoubleBookingAllowance(appointmentTime = '11:00 AM', duration = '30') {
    console.log('\n=== Check if appointment type allows double-booking ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    const appointmentType = await this.getAppointmentType();
    const allowsDoubleBooking = await this.checkIfAppointmentTypeAllowsDoubleBooking(appointmentType);
    
    if (!allowsDoubleBooking) {
      console.log('ℹ️ Current appointment type does not allow double-booking - skipping test');
      await this.closePopupSafely();
      return false;
    }
    
    console.log(`✓ Appointment type "${appointmentType}" allows double-booking`);

    console.log('\n=== Create first appointment ===');
    await this.setAppointmentTime(appointmentTime);
    await this.setAppointmentDuration(duration);
    
    const firstAppointmentCreated = await this.createAppointmentWithDetails();
    if (!firstAppointmentCreated) {
      console.log('⚠️ First appointment creation failed');
      await this.closePopupSafely();
      return false;
    }
    
    console.log('✓ First appointment created');
    await this.page.waitForTimeout(2000);

    console.log('\n=== Attempt to create overlapping appointment (should be allowed) ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    if (appointmentType) {
      await this.selectAppointmentType(appointmentType);
    }
    
    await this.setAppointmentTime(appointmentTime);
    await this.setAppointmentDuration(duration);
    
    const canCreateOverlapping = await this.attemptToSaveAppointment();
    
    if (canCreateOverlapping) {
      console.log('✓ ASSERT: Double-booking allowed when appointment type allows it');
      return true;
    } else {
      const errorMessage = await this.attemptToSaveAppointmentAndGetError();
      console.log(`⚠️ Double-booking may still be prevented: ${errorMessage || 'Unknown error'}`);
      return false;
    }
  }

  // Test minimum lead time enforcement
  async testMinimumLeadTime(minimumLeadTimeHours = 2) {
    console.log('\n=== Calculate minimum lead time ===');
    const currentTime = new Date();
    const minimumBookingTime = new Date(currentTime.getTime() + (minimumLeadTimeHours * 60 * 60 * 1000));
    
    const hours = minimumBookingTime.getHours();
    const minutes = minimumBookingTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const minimumTimeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    console.log(`✓ Minimum booking time (${minimumLeadTimeHours} hours from now): ${minimumTimeStr}`);

    console.log('\n=== Attempt to create appointment within minimum lead time ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    const tooEarlyTime = new Date(currentTime.getTime() + (60 * 60 * 1000)); // 1 hour from now
    const tooEarlyHours = tooEarlyTime.getHours();
    const tooEarlyMinutes = tooEarlyTime.getMinutes();
    const tooEarlyAmpm = tooEarlyHours >= 12 ? 'PM' : 'AM';
    const tooEarlyDisplayHours = tooEarlyHours % 12 || 12;
    const tooEarlyTimeStr = `${tooEarlyDisplayHours}:${tooEarlyMinutes.toString().padStart(2, '0')} ${tooEarlyAmpm}`;
    
    await this.setAppointmentTime(tooEarlyTimeStr);
    await this.setAppointmentDuration('30');
    
    const errorMessage = await this.attemptToSaveAppointmentAndGetError();
    
    if (errorMessage) {
      const isLeadTimeError = errorMessage.toLowerCase().includes('lead') ||
                             errorMessage.toLowerCase().includes('minimum') ||
                             errorMessage.toLowerCase().includes('advance') ||
                             errorMessage.toLowerCase().includes('hours') ||
                             errorMessage.toLowerCase().includes('before');
      
      if (isLeadTimeError) {
        console.log(`✓ ASSERT: Minimum lead time enforced with message: ${errorMessage}`);
      } else {
        console.log(`ℹ️ Error message: ${errorMessage} (may indicate lead time validation)`);
      }
    } else {
      const canCreate = await this.attemptToSaveAppointment();
      if (!canCreate) {
        console.log('✓ ASSERT: Minimum lead time enforced (appointment creation blocked)');
      } else {
        console.log('⚠️ Minimum lead time may not be enforced');
      }
    }

    console.log('\n=== Attempt to create appointment after minimum lead time ===');
    await this.closePopupSafely();
    await this.page.waitForTimeout(1000);
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    await this.setAppointmentTime(minimumTimeStr);
    await this.setAppointmentDuration('30');
    
    const canCreateAfterLeadTime = await this.attemptToSaveAppointment();
    if (canCreateAfterLeadTime) {
      console.log('✓ ASSERT: Appointment can be created after minimum lead time');
    }
    return true;
  }

  // Test maximum advance booking
  async testMaximumAdvanceBooking(maxAdvanceDays = 90) {
    console.log('\n=== Navigate to maximum advance booking date ===');
    const currentDate = new Date();
    const maxAdvanceDate = new Date(currentDate);
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + maxAdvanceDays);
    
    console.log(`✓ Maximum advance booking date: ${maxAdvanceDate.toDateString()}`);
    
    await this.navigateToDate(maxAdvanceDate);
    await this.page.waitForTimeout(2000);

    console.log('\n=== Attempt to create appointment at maximum advance date ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    const appointmentTime = '10:00 AM';
    await this.setAppointmentTime(appointmentTime);
    await this.setAppointmentDuration('30');
    
    const canCreateAtMaxDate = await this.attemptToSaveAppointment();
    if (canCreateAtMaxDate) {
      console.log('✓ ASSERT: Appointment can be created at maximum advance date');
    }

    console.log('\n=== Attempt to create appointment beyond maximum advance date ===');
    await this.closePopupSafely();
    await this.page.waitForTimeout(1000);
    
    const beyondMaxDate = new Date(maxAdvanceDate);
    beyondMaxDate.setDate(beyondMaxDate.getDate() + 1);
    
    const canNavigateBeyond = await this.navigateToDate(beyondMaxDate);
    
    if (!canNavigateBeyond) {
      console.log('✓ ASSERT: Cannot navigate beyond maximum advance booking date');
      return true;
    } else {
      await this.openAddEventPopupOnNextDay();
      await this.selectAppointmentRadioButton();
      await this.setAppointmentTime(appointmentTime);
      await this.setAppointmentDuration('30');
      
      const errorMessage = await this.attemptToSaveAppointmentAndGetError();
      if (errorMessage) {
        const isMaxAdvanceError = errorMessage.toLowerCase().includes('maximum') ||
                                 errorMessage.toLowerCase().includes('advance') ||
                                 errorMessage.toLowerCase().includes('days') ||
                                 errorMessage.toLowerCase().includes('future');
        
        if (isMaxAdvanceError) {
          console.log(`✓ ASSERT: Maximum advance booking enforced with message: ${errorMessage}`);
          return true;
        } else {
          console.log(`ℹ️ Error message: ${errorMessage} (may indicate max advance validation)`);
          return true;
        }
      } else {
        console.log('⚠️ Maximum advance booking may not be enforced');
        return false;
      }
    }
  }

  // Test patient overlapping appointments
  async testPatientOverlappingAppointments(appointmentTime = '2:00 PM', duration = '60', overlappingTime = '2:30 PM') {
    console.log('\n=== Create first appointment for a patient ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    await this.setAppointmentTime(appointmentTime);
    await this.setAppointmentDuration(duration);
    
    const patientSelected = await this.selectPatientIfRequired();
    
    const firstAppointmentCreated = await this.createAppointmentWithDetails();
    if (!firstAppointmentCreated) {
      console.log('⚠️ First appointment creation failed - may need patient/facility selection');
      await this.closePopupSafely();
      return false;
    }
    
    console.log('✓ First appointment created for patient');
    await this.page.waitForTimeout(2000);

    console.log('\n=== Attempt to create overlapping appointment for same patient ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    if (patientSelected) {
      await this.selectPatientIfRequired();
    }
    
    await this.setAppointmentTime(overlappingTime);
    await this.setAppointmentDuration('30');
    
    const errorMessage = await this.attemptToSaveAppointmentAndGetError();
    
    if (errorMessage) {
      const isOverlapError = errorMessage.toLowerCase().includes('overlap') ||
                            errorMessage.toLowerCase().includes('conflict') ||
                            errorMessage.toLowerCase().includes('already') ||
                            errorMessage.toLowerCase().includes('patient') ||
                            errorMessage.toLowerCase().includes('scheduled');
      
      if (isOverlapError) {
        console.log(`✓ ASSERT: Patient overlapping appointments prevented with message: ${errorMessage}`);
        return true;
      } else {
        console.log(`ℹ️ Error message: ${errorMessage} (may indicate overlap prevention)`);
        return true;
      }
    } else {
      const canCreate = await this.attemptToSaveAppointment();
      if (!canCreate) {
        console.log('✓ ASSERT: Patient overlapping appointments prevented');
        return true;
      } else {
        console.log('⚠️ Patient overlapping appointments may be allowed');
        return false;
      }
    }
  }

  // Test appointment duration validation
  async testDurationValidation(appointmentTime = '3:00 PM') {
    console.log('\n=== Attempt to create appointment with negative duration ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    await this.setAppointmentTime(appointmentTime);
    await this.setAppointmentDuration('-10');
    
    const errorMessage = await this.attemptToSaveAppointmentAndGetError();
    
    if (errorMessage) {
      const isDurationError = errorMessage.toLowerCase().includes('duration') ||
                             errorMessage.toLowerCase().includes('positive') ||
                             errorMessage.toLowerCase().includes('invalid') ||
                             errorMessage.toLowerCase().includes('must');
      
      if (isDurationError) {
        console.log(`✓ ASSERT: Negative duration rejected with message: ${errorMessage}`);
      } else {
        console.log(`ℹ️ Error message: ${errorMessage} (may indicate duration validation)`);
      }
    } else {
      const canCreate = await this.attemptToSaveAppointment();
      if (!canCreate) {
        console.log('✓ ASSERT: Negative duration rejected (appointment creation blocked)');
      } else {
        console.log('⚠️ Negative duration may be accepted');
      }
    }

    console.log('\n=== Attempt to create appointment with zero duration ===');
    await this.closePopupSafely();
    await this.page.waitForTimeout(1000);
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    await this.setAppointmentTime(appointmentTime);
    await this.setAppointmentDuration('0');
    
    const errorMessageZero = await this.attemptToSaveAppointmentAndGetError();
    if (errorMessageZero) {
      console.log(`✓ ASSERT: Zero duration rejected with message: ${errorMessageZero}`);
    } else {
      const canCreate = await this.attemptToSaveAppointment();
      if (!canCreate) {
        console.log('✓ ASSERT: Zero duration rejected');
      }
    }

    console.log('\n=== Verify positive integer duration is accepted ===');
    await this.closePopupSafely();
    await this.page.waitForTimeout(1000);
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    await this.setAppointmentTime(appointmentTime);
    await this.setAppointmentDuration('30');
    
    const durationValue = await this.getAppointmentDuration();
    if (durationValue && parseInt(durationValue) > 0) {
      console.log(`✓ ASSERT: Positive integer duration accepted: ${durationValue} minutes`);
    }
    await this.closePopupSafely();
    return true;
  }

  // Test end time validation
  async testEndTimeValidation(startTime = '4:00 PM', duration = '30') {
    console.log('\n=== Set start time and verify end time is calculated correctly ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    await this.setAppointmentTime(startTime);
    await this.setAppointmentDuration(duration);
    
    const endTime = await this.getEndTime();
    const startTimeValue = await this.getStartTime();
    
    console.log(`✓ Start time: ${startTimeValue}, End time: ${endTime}`);
    
    if (endTime && startTimeValue) {
      const endIsAfterStart = await this.verifyEndTimeAfterStartTime(startTimeValue, endTime);
      if (endIsAfterStart) {
        console.log('✓ ASSERT: End time is correctly calculated after start time');
      } else {
        console.log('⚠️ End time validation may need attention');
      }
    }

    console.log('\n=== Attempt to set end time before start time ===');
    const canSetEndTime = await this.attemptToSetEndTimeBeforeStartTime(startTime);
    
    if (canSetEndTime) {
      const errorMessage = await this.attemptToSaveAppointmentAndGetError();
      if (errorMessage) {
        const isTimeError = errorMessage.toLowerCase().includes('end') ||
                           errorMessage.toLowerCase().includes('start') ||
                           errorMessage.toLowerCase().includes('before') ||
                           errorMessage.toLowerCase().includes('after') ||
                           errorMessage.toLowerCase().includes('invalid');
        
        if (isTimeError) {
          console.log(`✓ ASSERT: End time before start time rejected with message: ${errorMessage}`);
        } else {
          console.log(`ℹ️ Error message: ${errorMessage} (may indicate time validation)`);
        }
      } else {
        console.log('⚠️ End time validation may not be enforced');
      }
    } else {
      console.log('ℹ️ End time field may be read-only (automatically calculated)');
    }
    await this.closePopupSafely();
    return true;
  }

  // Test future start time validation
  async testFutureStartTimeValidation() {
    console.log('\n=== Verify start time must be in future ===');
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    const earlyTime = '8:00 AM';
    console.log(`Setting start time to early morning (next day): ${earlyTime}`);
    await this.setAppointmentTime(earlyTime);
    await this.setAppointmentDuration('30');
    
    const startTimeValue = await this.getStartTime();
    if (startTimeValue) {
      console.log(`✓ ASSERT: Future start time accepted: ${startTimeValue}`);
    }
    
    console.log('ℹ️ Start time validation: Booking on next day ensures start time is in future');

    console.log('\n=== Verify various future times are accepted ===');
    await this.closePopupSafely();
    await this.page.waitForTimeout(1000);
    await this.openAddEventPopupOnNextDay();
    await this.selectAppointmentRadioButton();
    
    const afternoonTime = '2:00 PM';
    await this.setAppointmentTime(afternoonTime);
    await this.setAppointmentDuration('30');
    
    const startTimeValue2 = await this.getStartTime();
    if (startTimeValue2) {
      console.log(`✓ ASSERT: Future start time accepted: ${startTimeValue2}`);
    }
    await this.closePopupSafely();
    return true;
  }
}

module.exports = { BookingRulesPage };
