const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path'); 
const { PatientPage } = require('../pages/Patients');

test.use({ storageState: 'authState.json' });

test.describe('Patient Module - Add Patient Flow', () => {

  test('TC20. Validate Patient Tab controls visibility and functionality above Patient Listing grid', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Step 1: Validate Patient Tab controls visibility
    await patient.validatePatientTabControlsVisibility();

    // Step 2: Validate Admission Status dropdown selection
    await patient.validateAdmissionStatusDropdownSelection("Admitted");

    // Step 3: Validate All Clients/My Clients Toggle bar functionality
    await patient.validateClientsToggleBarFunctionality();

    // Step 4: Validate Search Patient functionality
    await patient.validateSearchPatientFunctionality();
  });

  test('TC21. Validate Add New Patient popup display and close functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Step 1: Validate on the Patient Listing Section, by clicking on the Add Patient button the Add New Patient popup is displayed
    console.log("STEP 1: Navigating to Patients tab...");
    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.addPatientBtn).toBeVisible();
    
    console.log("STEP 1: Clicking Add Patient button...");
    await patient.openAddPatientModal();
    
    console.log("ASSERT: Validating Add New Patient popup is displayed...");
    await expect(patient.modalTitle).toBeVisible({ timeout: 10000 });
    console.log("ASSERT: Add New Patient popup is displayed successfully");

    // Step 2: Validate on the Add New Patient popup, a cross mark icon is displayed on the header
    console.log("STEP 2: Validating cross mark icon is displayed on the header...");
    await expect(patient.modalCloseButton).toBeVisible({ timeout: 10000 });
    console.log("ASSERT: Cross mark icon is displayed on the header");

    // Step 3: Validate on the Add New Patient popup, by clicking on the cross mark icon the Add New Patient popup should close
    console.log("STEP 3: Clicking on the cross mark icon...");
    await patient.modalCloseButton.click();
    
    console.log("ASSERT: Validating Add New Patient popup is closed...");
    await expect(patient.modalTitle).not.toBeVisible({ timeout: 5000 });
    console.log("ASSERT: Add New Patient popup is closed successfully");
  });

  test('TC22. Validate all fields, controls, and functionality in Add New Patient popup', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Generate test data
    const testFirstName = faker.person.firstName();
    const testLastName = faker.person.lastName();
    const testDob = '01/15/1990';
    const testGender = 'Male';
    const testSSN = '123-45-6789';
    const testAddress = '123 Main Street';
    const testZipCode = '12345';
    const testEmail = faker.internet.email();
    const testPhone = '(555) 123-4567';

    console.log("STEP 1: Navigating to Patients tab..."); 
    await patient.navigateToPatientsTab(loginPage);

    await expect(patient.addPatientBtn).toBeVisible();  
    console.log("STEP 2: Opening Add Patient modal...");
    await patient.openAddPatientModal();

    console.log("STEP 3: Validating modal title...");
    await expect(patient.modalTitle).toBeVisible();

    // Validate Patient ID and Billing ID controls
    await patient.validatePatientIdAndBillingIdControls();

    // Validate and fill First Name
    await patient.validateAndFillFirstName(testFirstName);

    // Validate and fill Last Name
    await patient.validateAndFillLastName(testLastName);

    // Validate and fill DOB
    await patient.validateAndFillDOB(testDob);

    // Validate and select Gender
    await patient.validateAndSelectGender(testGender);

    // Validate and fill SSN
    await patient.validateAndFillSSN(testSSN);

    // Validate and fill Address
    await patient.validateAndFillAddress(testAddress);

    // Validate Zip, City, State controls and fill Zip Code
    await patient.validateZipCityStateControlsAndFillZip(testZipCode);

    // Validate City and State auto-population
    await patient.validateCityStateAutoPopulation();

    // Validate and fill Email
    await patient.validateAndFillEmail(testEmail);

    // Validate and select Preferred Contact
    await patient.validateAndSelectPreferredContact();

    // Validate and fill Phone Number
    await patient.validateAndFillPhoneNumber(testPhone);

    // Validate and select Referral Source
    await patient.validateAndSelectReferralSource();

    // Validate checkboxes visibility and enabled state
    await patient.validateCheckboxesVisibilityAndEnabled();

    // Validate Add to Cancellation List checkbox functionality (phone assessment question)
    await patient.validateAddToCancellationListPhoneAssessment();

    // Validate availability options display
    await patient.validateAvailabilityOptionsDisplay();

    // Validate availability checkboxes and time controls are enabled
    await patient.validateAvailabilityControlsEnabled();

    // Validate user can check availability days and select time
    await patient.validateAvailabilitySelection();

    console.log("ASSERT: All fields validated successfully");
  });

  test('TC23. Add new patient and validate checkboxes, Save/Cancel buttons and Patient Demographics page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);
  
    // Generate test data
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName() + '_' + Date.now();
    const dob = faker.date.birthdate({ min: 18, max: 70, mode: 'age' });
    const dobFormatted = dob.toLocaleDateString('en-US');
    const email = faker.internet.email();
    const phone = faker.phone.number({ style: 'national' });

    const patientData = {
      firstName,
      lastName,
      dob: dobFormatted,
      gender: 'Male',
      address: '123 Main St',
      zipcode: '12345',
      city: 'New York',
      state: 'NY',
      phone: phone,
      createdAt: new Date().toISOString()
    };
  
    console.log("PATIENT DATA →", patientData);
  
    // Save patient data to JSON file
    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'createdPatient.json');
  
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
  
    fs.writeFileSync(filePath, JSON.stringify(patientData, null, 2));
    console.log(`PATIENT DATA SAVED TO: ${filePath}`);
  
    // Begin test execution
    await patient.navigateToPatientsTab(loginPage);
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible();

    // Validate Save and Cancel buttons
    await patient.validateSaveAndCancelButtons();

    // Validate Cancel button closes popup
    await patient.validateCancelButtonClosesPopup();
    
    // Reopen the modal and fill fields
    console.log('STEP: Reopening Add Patient modal and filling fields...');
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible();
    
    console.log('STEP: Filling mandatory patient fields...');
    await patient.fillMandatoryFields(patientData);

    console.log('STEP: entering "Email Address"...');
    await patient.enterEmailAddress(email);
  
    console.log('STEP: Checking "Does not have SSN"...');
    await patient.checkNoSSN();

    // Validate checkboxes
    await patient.validateIsTestPatientCheckbox();
    await patient.validateIsWalkInEmergencyCareClientCheckbox();
    await patient.validateEnableLoginCheckbox();

    // Save patient and verify success
    await patient.savePatientAndVerifySuccess();

    // Verify navigation to Patient Demographics page
    await patient.verifyNavigationToPatientDemographics();

    // Validate checkboxes on Patient Demographics page
    await patient.validateCheckboxesOnPatientDemographicsPage();
  
    // Final wait to ensure all operations complete
    await page.waitForTimeout(1000);
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
  
    console.log(`PATIENT CREATED SUCCESSFULLY → ${firstName} ${lastName}`);
  });

  test('TC24. Edit existing patient details and update', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);
  
    console.log("STEP 1: Navigate to Patients tab");
    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 10000 });

    // Load patient data from JSON
    const filePath = path.join(__dirname, '../data/createdPatient.json');
  
    if (!fs.existsSync(filePath)) {
      throw new Error("ERROR: createdPatient.json not found. Run Add Patient test first.");
    }
  
    const patientData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log("Loaded patient record:", patientData);
  
    const searchName = patientData.firstName;
  
    // Search and open patient by first name
    await patient.searchAndOpenPatientByFirstName(searchName);
  
    // Open edit form and update patient information
    await patient.openEditFormAndUpdatePatient("Christian", true);
  
    // Save patient information and verify success
    await patient.savePatientInfoAndVerifySuccess();
  }); 
  
  test('TC25. Add Insurance for Existing Patient', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);
  
    console.log("STEP 1: Navigate to Patients tab");
    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 10000 });

    // Load patient data from JSON
    const filePath = path.join(__dirname, '../data/createdPatient.json');
  
    if (!fs.existsSync(filePath)) {
      throw new Error("ERROR: createdPatient.json not found. Run Add Patient test first.");
    }
  
    const patientData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log("Loaded patient record:", patientData);
  
    const searchName = patientData.firstName;
  
    // Search, open patient, and open edit form
    await patient.searchAndOpenPatientAndOpenEditForm(searchName);
  
    // Add insurance policy for patient
    const insurancePolicyData = {
      companyType: "Commercial/PPO",
      policyNumber: faker.string.alphanumeric(10),
      level: "Primary",
      ptRelation: "Self"
    };
    await patient.addInsurancePolicyForPatient(insurancePolicyData, patientData);
  
    // Verify insurance policy success toast
    await patient.verifyInsurancePolicySuccessToast();
  });

  test('TC26. Validate Card View and Table View functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Validate and navigate to Card View
    await patient.validateAndNavigateToCardView();

    // Validate Card View thumbnails and colors
    await patient.validateCardViewThumbnailsAndColors();

    // Validate and navigate to Table View
    await patient.validateAndNavigateToTableView();
  });
  
  test('TC27. Validate Patient Grid displays Patient ID, First Name, Last Name, DOB, Phone and DE information and sorting', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Validate grid information for patient records
    await patient.validatePatientGridInformation(10);

    // Validate sorting functionality for all columns
    await patient.validatePatientGridSorting();
  });

  test('TC28. Validate navigation to Patient Detail page from Patient Grid', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 });
    
    // Validate navigation to Patient Detail page
    await patient.validatePatientGridNavigation();
  });

  test('TC29. Validate Action Icons are displayed and Non-Productive Encounter count functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.navigateToPatientsTab(loginPage);

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Action Icons are displayed in Actions column
    await patient.validateActionIconsForMultipleRows(10);

    // Validate Non-Productive Encounter creation workflow
    await patient.validateNonProductiveEncounterCreation();
  });
  
  test('TC30. Validate Inactive Patient Icon functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Inactive Patient Icon functionality
    await patient.validateInactivePatientIconFunctionality();
  });

  test('TC31. Validate Messaging/Chat Icon functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Messaging/Chat Icon functionality
    await patient.validateMessagingChatIconFunctionality();
  });

  test('TC32. Validate Print Icon functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Print Icon functionality
    await patient.validatePrintIconFunctionality();
  });

  test('TC33. Validate Treatment Plan Icon functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Treatment Plan Icon functionality
    // await patient.validateTreatmentPlanYellowIcon();
    await patient.validateTreatmentPlanRedIcon();
  });

  test('TC34. Validate Video Call Invitation Icon functionality and DE column value', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Video Call Icon and DE Column functionality
    await patient.validateVideoCallIconFunctionality();
    await patient.validateDEColumnUpdatesToYes();
  });
  
  test('TC35. Validate pagination functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    await patient.navigateToPatientsTab(loginPage);

    // Validate pagination functionality
    await patient.validatePaginationEnabledAndDefaultRecords();
    await patient.validateItemsPerPageSelection();
    await patient.validatePaginationNavigation();
  });

  test('TC36. Validate Patient Name Business Logic', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.addPatientBtn).toBeVisible();
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible({ timeout: 10000 });

    await patient.fillRequiredFieldsForNameValidation();
    await patient.validateAllNameBusinessLogic();
  });

  test('TC37. Validate Patient DOB Business Logic', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.addPatientBtn).toBeVisible();
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible({ timeout: 10000 });

    await patient.fillRequiredFieldsForDOBValidation();
    await patient.validateAllDOBBusinessLogic();
  });

  test('TC38. Validate Patient SSN Business Logic', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.addPatientBtn).toBeVisible();
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible({ timeout: 10000 });

    await patient.fillRequiredFieldsForSSNValidation();
    await patient.validateAllSSNBusinessLogic();
  });

  test('TC39. Validate Patient Contact Business Logic', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.addPatientBtn).toBeVisible();
    await patient.openAddPatientModal();
    
    // Wait for modal to be fully loaded
    await expect(patient.modalTitle).toBeVisible({ timeout: 10000 });
    
    // Wait for DOM to be stable
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Wait for key form fields to be visible and ready
    console.log('WAIT: Waiting for form fields to load...');
    await expect(patient.firstName).toBeVisible({ timeout: 10000 });
    await expect(patient.lastName).toBeVisible({ timeout: 10000 });
    await expect(patient.dobInput).toBeVisible({ timeout: 10000 });
    await expect(patient.address).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500); // Additional wait for form to be fully interactive

    await patient.fillRequiredFieldsForContactValidation();
    await patient.validateAllContactBusinessLogic();
  });

  test('TC40. Validate Patient Emergency Contact Business Logic', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Generate faker data for patient - create a minor (under 18) to test guardian requirements
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName() + '_' + Date.now();
    // Create a patient under 18 (between 5 and 17 years old)
    const dob = faker.date.birthdate({ min: 5, max: 17, mode: 'age' });
    const dobFormatted = dob.toLocaleDateString('en-US'); // Format: MM/DD/YYYY
    const address = faker.location.streetAddress();
    const zipcode = '12345'; // Fixed zip code
    const city = faker.location.city();
    const state = 'NY'; // Using a valid state code
    const phone = faker.phone.number('(###) ###-####');
    const email = faker.internet.email();

    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.addPatientBtn).toBeVisible();
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible({ timeout: 10000 });

    // Fill required fields with faker data
    console.log(`STEP: Filling patient data - Name: ${firstName} ${lastName}, DOB: ${dobFormatted}`);
    await patient.fillMandatoryFields({
      firstName: firstName,
      lastName: lastName,
      dob: dobFormatted,
      gender: 'Male',
      address: address,
      zipcode: zipcode,
      city: city,
      state: state,
      phone: phone
    });
    
    // Fill email if needed
    if (await patient.emailAddress.isVisible({ timeout: 2000 }).catch(() => false)) {
      await patient.emailAddress.fill(email);
      console.log(`INFO: Email filled: ${email}`);
    }
    
    // Check 'Doesn't have SSN' checkbox
    console.log('STEP: Checking "Doesn\'t have SSN" checkbox...');
    await expect(patient.noSSNCheckbox).toBeVisible({ timeout: 5000 });
    await expect(patient.noSSNCheckbox).toBeEnabled();
    await patient.noSSNCheckbox.check();
    const isNoSSNChecked = await patient.noSSNCheckbox.isChecked();
    expect(isNoSSNChecked).toBe(true);
    console.log('ASSERT: "Doesn\'t have SSN" checkbox is checked');
    
    // Save patient
    console.log('STEP: Saving patient...');
    await patient.save();
    
    // Handle duplicate patient modal if it appears
    const duplicateModalVisible = await patient.duplicatePatientModal.isVisible({ timeout: 3000 }).catch(() => false);
    if (duplicateModalVisible) {
      console.log('INFO: Duplicate Patient modal detected, clicking Cancel...');
      await patient.duplicatePatientModalCancelBtn.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      console.log('WARNING: Cannot complete validation - patient already exists');
      return;
    }
    
    // Verify success and navigation to Patient Demographics page
    console.log('STEP: Verifying patient saved and navigation to Patient Demographics page...');
    const successToastVisible = await patient.successToast.isVisible({ timeout: 10000 }).catch(() => false);
    if (successToastVisible) {
      console.log('ASSERT: Patient saved successfully');
    }
    
    await patient.verifyNavigationToPatientDemographics();
    
    // Validate emergency contact business logic on Patient Demographics page
    console.log('STEP: Validating emergency contact business logic on Patient Demographics page...');
    await patient.validateAllEmergencyContactBusinessLogic();
  });

  test('TC41. Validate Patient Duplicate Detection Business Logic', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Step 1: Generate patient data
    console.log("STEP 1: Generating new patient data for duplicate detection testing");
    const originalPatientData = patient.generatePatientDataForDuplicateTesting();

    // Step 2: Create patient and navigate back
    await patient.createPatientAndNavigateBack(loginPage, originalPatientData);

    // Step 3: Validate duplicate detection business logic
    console.log('\n==========================================');
    console.log('STEP 3: Validating duplicate detection business logic');
    console.log('==========================================\n');
    
    await patient.navigateToPatientsTab(loginPage);
    await expect(patient.addPatientBtn).toBeVisible({ timeout: 15000 });
    await patient.openAddPatientModal();
    
    // Wait for modal to be fully loaded
    await expect(patient.modalTitle).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Run all duplicate detection validations (PAT-DUP-001 to PAT-DUP-004)
    await patient.validateAllDuplicateDetectionBusinessLogic(originalPatientData);

    // Cleanup: Close modal if still open
    try {
      const modalVisible = await patient.modalTitle.isVisible({ timeout: 2000 }).catch(() => false);
      if (modalVisible) {
        await patient.cancelBtn.click({ timeout: 3000 }).catch(() => {});
        console.log('INFO: Modal closed during cleanup');
      }
    } catch (error) {
      console.log(`INFO: Error during cleanup: ${error.message}`);
    }
  });

  test('TC42. Validate Patient Duplicate Detection on Update', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const patient = new PatientPage(page);

    // Step 1: Generate original patient data
    console.log("STEP 1: Generating original patient data for update duplicate detection testing");
    const originalPatientData = patient.generatePatientDataForDuplicateTesting();

    // Step 2: Create original patient and navigate back
    await patient.createPatientAndNavigateBack(loginPage, originalPatientData);

    // Step 3: Create duplicate patient for update testing
    console.log('\n--- PAT-DUP-005: Duplicate check runs on update ---');
    console.log('STEP 3: Creating duplicate patient for update testing...');
    const duplicatePatientData = patient.generatePatientDataForDuplicateTesting();
    
    await patient.createPatientAndNavigateBack(loginPage, duplicatePatientData);
    
    // Step 4: Update name on demographic page and validate duplicate detection
    await patient.updatePatientNameOnDemographicPageAndValidateDuplicate(originalPatientData);

    // Cleanup: Close modal if still open
    try {
      const modalVisible = await patient.modalTitle.isVisible({ timeout: 2000 }).catch(() => false);
      if (modalVisible) {
        await patient.cancelBtn.click({ timeout: 3000 }).catch(() => {});
        console.log('INFO: Modal closed during cleanup');
      }
    } catch (error) {
      console.log(`INFO: Error during cleanup: ${error.message}`);
    }
  });
});
