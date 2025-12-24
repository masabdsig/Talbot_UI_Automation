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
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
    
    // Wait for Patients page to load - wait for key elements to be visible
    console.log("ACTION: Waiting for Patients page to fully load...");
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 15000 });
    await expect(patient.admissionStatusDropdown).toBeVisible({ timeout: 15000 });
    await expect(patient.clientsToggleBar).toBeVisible({ timeout: 10000 });
    await expect(patient.addPatientBtn).toBeVisible({ timeout: 10000 });
    
    // Additional wait for page to fully render and stabilize
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("ASSERT: Patients page has loaded and elements are ready");

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
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Step 1: Validate on the Patient Listing Section, by clicking on the Add Patient button the Add New Patient popup is displayed
    console.log("STEP 1: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
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
    await loginPage.navigateToDashboard();
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
    await patient.gotoPatientsTab();

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
    await loginPage.navigateToDashboard();
  
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
    await patient.gotoPatientsTab();
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

  test('TC24. Check duplicate patient validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
  
    const patient = new PatientPage(page);

    // Load patient data from JSON (created in test TC22)
    const filePath = path.join(__dirname, '../data/createdPatient.json');
  
    if (!fs.existsSync(filePath)) {
      throw new Error("ERROR: createdPatient.json not found. Run Add Patient test first.");
    }
  
    const patientData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log("Loaded patient record for duplicate check:", patientData);

    // Begin test execution
    console.log('STEP 1: Navigating to Patients tab...');
    await patient.gotoPatientsTab();
    await expect(patient.addPatientBtn).toBeVisible();
    
    console.log('STEP 2: Opening Add Patient modal...');
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible();

    // Fill duplicate patient information and attempt to save
    await patient.fillDuplicatePatientInfoAndAttemptSave(patientData);

    // Verify duplicate patient error
    await patient.verifyDuplicatePatientError();
  });

  test('TC25. Edit existing patient details and update', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
  
    const patient = new PatientPage(page);
  
    console.log("STEP 1: Navigate to Patients tab");
    await patient.gotoPatientsTab();
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
  
  test('TC26. Add Insurance for Existing Patient', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
  
    const patient = new PatientPage(page);
  
    console.log("STEP 1: Navigate to Patients tab");
    await patient.gotoPatientsTab();
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

  test('TC27. Validate Card View and Table View functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
    
    // Wait for Patients page to load
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 15000 });
    await expect(patient.cardViewIcon).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("ASSERT: Patients page has loaded");

    // Validate and navigate to Card View
    await patient.validateAndNavigateToCardView();

    // Validate Card View thumbnails and colors
    await patient.validateCardViewThumbnailsAndColors();

    // Validate and navigate to Table View
    await patient.validateAndNavigateToTableView();
  });
  
  test('TC28. Validate Patient Grid displays Patient ID, First Name, Last Name, DOB, Phone and DE information and sorting', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
    
    // Wait for Patients page to load
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 15000 });
    await expect(patient.addPatientBtn).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("ASSERT: Patients page has loaded");

    // Validate grid information for patient records
    await patient.validatePatientGridInformation(10);

    // Validate sorting functionality for all columns
    await patient.validatePatientGridSorting();
  });

  test('TC29. Validate navigation to Patient Detail page from Patient Grid', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 15000 });
    await expect(patient.addPatientBtn).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("ASSERT: Patients page has loaded");

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 });
    
    // Validate navigation to Patient Detail page
    await patient.validatePatientGridNavigation();
  });

  test('TC30. Validate Action Icons are displayed and Non-Productive Encounter count functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
    
    // Wait for Patients page to load
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 15000 });
    await expect(patient.addPatientBtn).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("ASSERT: Patients page has loaded");

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
  
  test('TC31. Validate Inactive Patient Icon functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 15000 });
    await expect(patient.addPatientBtn).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("ASSERT: Patients page has loaded");

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Inactive Patient Icon functionality
    await patient.validateInactivePatientIconFunctionality();
  });

  test('TC32. Validate Messaging/Chat Icon functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 15000 });
    await expect(patient.addPatientBtn).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("ASSERT: Patients page has loaded");

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Messaging/Chat Icon functionality
    await patient.validateMessagingChatIconFunctionality();
  });

  test('TC33. Validate Print Icon functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToDashboard();
    const patient = new PatientPage(page);

    // Navigate to Patients tab
    console.log("ACTION: Navigating to Patients tab...");
    await patient.gotoPatientsTab();
    await expect(patient.searchPatientInput).toBeVisible({ timeout: 15000 });
    await expect(patient.addPatientBtn).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("ASSERT: Patients page has loaded");

    // Wait for patient grid to load
    console.log("ACTION: Waiting for patient grid to load...");
    await expect(patient.patientRows.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log("WARNING: Patient grid may be empty or still loading");
    });
    await page.waitForTimeout(1000);

    // Validate Print Icon functionality
    await patient.validatePrintIconFunctionality();
  });
});
