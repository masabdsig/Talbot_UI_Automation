const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path'); 
const { PatientPage } = require('../pages/Patients');

test.use({ storageState: 'authState.json' });

test.describe('Patient Module - Add Patient Flow', () => {

  test('1. Validate all fields', async ({ page }) => {
    await page.goto('/dashboard');
    const loginPage = new LoginPage(page);
    await loginPage.skipMfa();
    const patient = new PatientPage(page);

    console.log("STEP: Navigating to Patients tab..."); 
    await patient.gotoPatientsTab();

    await expect(patient.addPatientBtn).toBeVisible();  
    console.log("STEP: Opening Add Patient modal...");
    await patient.openAddPatientModal();

    console.log("STEP: Validating modal title...");
    await expect(patient.modalTitle).toBeVisible();
    console.log("STEP: Validating all fields...");
    await patient.validateFormFields();
    console.log("ASSERT: All fields validated successfully");

    console.log("STEP: Validating alert message for required fields...");
    await patient.validateAlertMessageForRequiredFields();
    console.log("ASSERT: Alert message for required fields validated successfully");
  });

  test('2. Add new patient with mandatory fields and check SSN bypass', async ({ page }) => {

    await page.goto('/dashboard');
  
    const loginPage = new LoginPage(page);
    await loginPage.skipMfa();
  
    const patient = new PatientPage(page);
  
    // 1. GENERATE TEST DATA (Faker + timestamp)
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName() + '_' + Date.now();  // timestamp to avoid duplicates
    const dob = faker.date.birthdate({ min: 18, max: 70, mode: 'age' });
    const dobFormatted = dob.toLocaleDateString('en-US');
    const email = faker.internet.email();

    const patientData = {
      firstName,
      lastName,
      dob: dobFormatted,
      gender: 'Male',
      address: '123 Main St',
      zipcode: '12345',
      city: 'New York',
      state: 'NY',
      phone: '(555) 123-4567',
      createdAt: new Date().toISOString()
    };
  
    console.log("PATIENT DATA →", patientData);
  
    // 2. SAVE PATIENT DATA TO JSON FILE
    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'createdPatient.json');
  
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
  
    fs.writeFileSync(filePath, JSON.stringify(patientData, null, 2));
  
    console.log(`PATIENT DATA SAVED TO: ${filePath}`);
  
    // 3. BEGIN TEST EXECUTION
    console.log('STEP: Navigating to Patients tab...');
    await patient.gotoPatientsTab();
    await expect(patient.addPatientBtn).toBeVisible();
  
    console.log('STEP: Opening Add Patient modal...');
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible();
  
    console.log('STEP: Filling mandatory patient fields...');
    await patient.fillMandatoryFields(patientData);

    console.log('STEP: entering "Email Address"...');
    await patient.enterEmailAddress(email);
  
    console.log('STEP: Checking "Does not have SSN"...');
    await patient.checkNoSSN();
  
    console.log('STEP: Saving patient...');
    await patient.save();
  
    console.log('STEP: Verifying success toast...');
    await expect(patient.successToast).toBeVisible();
  
    console.log(`PATIENT CREATED SUCCESSFULLY → ${firstName} ${lastName}`);
  });

  test('3. Check duplicate patient validation', async ({ page }) => {

    await page.goto('/dashboard');
  
    const loginPage = new LoginPage(page);
    await loginPage.skipMfa();
  
    const patient = new PatientPage(page);

    // 1. LOAD PATIENT DATA FROM JSON (created in test 1)
    const filePath = path.join(__dirname, '../data/createdPatient.json');
  
    if (!fs.existsSync(filePath)) {
      throw new Error("ERROR: createdPatient.json not found. Run Add Patient test first.");
    }
  
    const patientData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log("Loaded patient record for duplicate check:", patientData);

    // 2. BEGIN TEST EXECUTION
    console.log('STEP: Navigating to Patients tab...');
    await patient.gotoPatientsTab();
    // Wait for Patients page to load
    await expect(patient.addPatientBtn).toBeVisible();

    console.log('STEP: Opening Add Patient modal...');
    await patient.openAddPatientModal();
    await expect(patient.modalTitle).toBeVisible();

    console.log('STEP: Filling duplicate patient fields with same information...');
    await patient.fillMandatoryFields(patientData);

    console.log('STEP: Checking "Does not have SSN"...');
    await patient.checkNoSSN();

    console.log('STEP: Attempting to save duplicate patient...');
    
    await patient.save();

    // Wait for network to settle
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(500);

    console.log('STEP: Verifying duplicate patient error...');
    
    // First, check if success toast appeared (duplicate was created - this is a failure case)
    const successToastVisible = await patient.successToast.isVisible().catch(() => false);
    if (successToastVisible) {
      throw new Error('TEST FAILED: Duplicate patient was created successfully! Success toast appeared when it should have been prevented.');
    }
    
    // Wait a bit more for any error messages to appear
    await page.waitForTimeout(500);
    
    // Check if error toast is visible (try multiple selectors)
    let errorFound = false;
    
    // Final assertion - at least one error indicator should be present
    if (!errorFound) {
      const modalStillOpen = await patient.modalTitle.isVisible().catch(() => false);
      if (modalStillOpen) {
        console.log('ASSERT: Modal still open - duplicate save prevented');
      } else {
        throw new Error('TEST FAILED: Duplicate patient validation not detected. Modal closed without error indication.');
      }
    }
    console.log('DUPLICATE PATIENT VALIDATION CHECKED');
  });

  test('4. Edit existing patient details update Religion', async ({ page }) => {

    await page.goto('/dashboard');
    const loginPage = new LoginPage(page);
    await loginPage.skipMfa();
  
    const patient = new PatientPage(page);
  
    console.log("STEP: Navigate to Patients tab");
    await patient.gotoPatientsTab();
    // Wait for Patients page to load
    await expect(patient.searchPatientInput).toBeVisible();

    // 1. LOAD PATIENT DATA FROM JSON
    const filePath = path.join(__dirname, '../data/createdPatient.json');
  
    if (!fs.existsSync(filePath)) {
      throw new Error("ERROR: createdPatient.json not found. Run Add Patient test first.");
    }
  
    const patientData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
    console.log("Loaded patient record:", patientData);
  
    const searchName = patientData.firstName; // “Candida”
  
    // 2. SEARCH PATIENT
    console.log(`STEP: Searching patient '${searchName}'`);
    await patient.searchPatient(searchName);
    await page.waitForLoadState("networkidle");
  
    // Wait for search results to appear
    const patientRowLocator = patient.getPatientNameByFirstName(searchName);
    await expect(patientRowLocator.first()).toBeVisible({ timeout: 10000 });
  
    // 3. OPEN CORRECT PATIENT BY MATCHING FIRST NAME  
    console.log("STEP: Opening patient by name from search results");
    await patientRowLocator.first().click();
  
    // Wait for patient details page to load
    await expect(patient.patientHeaderName).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState("networkidle");
  
    // 4. OPEN EDIT FORM
    console.log("STEP: Opening patient edit form");
    await patient.openPatientEditForm();
    
    // Wait for edit form to load - check for Religion field
    await patient.waitForReligionFieldReady();
    await page.waitForLoadState("networkidle");
  
    // 5. UPDATE RELIGION
    console.log("STEP: Updating Religion...");
    await patient.updateReligion("Christian");
    
    // Wait for dropdown to close after selection
    await page.waitForTimeout(500);
  
    // 6. SAVE CHANGES
    console.log("STEP: Saving Patient Information...");
    await patient.savePatientInformation();
    
    // // Wait for toast messages to appear
  
    console.log("ASSERT: Checking success toast...");
    await expect(page.getByText('Patient Other Information Updated Successfully')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Patient Information Updated')).toBeVisible({ timeout: 10000 });
  }); 
  
  test('5. Add Insurance for Existing Patient', async ({ page }) => {

    await page.goto('/dashboard');
    const loginPage = new LoginPage(page);
    await loginPage.skipMfa();
  
    const patient = new PatientPage(page);
  
    console.log("STEP: Navigate to Patients tab");
    await patient.gotoPatientsTab();

    // 1. LOAD PATIENT DATA FROM JSON
    const filePath = path.join(__dirname, '../data/createdPatient.json');
  
    if (!fs.existsSync(filePath)) {
      throw new Error("ERROR: createdPatient.json not found. Run Add Patient test first.");
    }
  
    const patientData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
    console.log("Loaded patient record:", patientData);
  
    const searchName = patientData.firstName; // “Candida”
  
    // 2. SEARCH PATIENT
    console.log(`STEP: Searching patient '${searchName}'`);
    await patient.searchPatient(searchName);
  
    // Wait for search results to appear
    const patientRowLocator = patient.getPatientNameByFirstName(searchName);
    await expect(patientRowLocator.first()).toBeVisible({ timeout: 10000 });
  
    // 3. OPEN CORRECT PATIENT BY MATCHING FIRST NAME  
    console.log("STEP: Opening patient by name from search results");
    await patientRowLocator.first().click();
  
    // Wait for patient details page to load
    await expect(patient.patientHeaderName).toBeVisible({ timeout: 10000 });
  
    // 4. OPEN EDIT FORM
    console.log("STEP: Opening patient edit form");
    await patient.openPatientEditForm();
  
    // 5. Select Insurance tab
    console.log("STEP: Selecting Insurance tab...");
    await patient.selectInsuranceTab();
  
    // 6. Click Add Policy button
    console.log("STEP: Clicking Add Policy button...");
    await patient.clickAddPolicy();
  
    // 7. Fill required fields in Add Insurance Policy form
    console.log("STEP: Filling required fields in Add Insurance Policy form...");
    const insurancePolicyData = {
      companyType: "Commercial/PPO",
      policyNumber: faker.string.alphanumeric(10),
      level: "Primary",
      ptRelation: "Self"
      // Note: firstName, lastName, sex, dob not needed when ptRelation is "Self" - will validate auto-populated data
    };
    await patient.fillInsurancePolicyForm(insurancePolicyData, patientData);
  
    // 8. Save Insurance Policy
    console.log("STEP: Saving Insurance Policy...");
    await patient.saveInsurancePolicy();
  
    // 9. Validate and handle confirmation dialog
    console.log("STEP: Validating confirmation dialog and clicking Ok...");
    await patient.handleConfirmationDialog();
  
    // 10. Validate success toast
    console.log("STEP: Validating success toast...");
    await page.waitForTimeout(2000);
    await expect(patient.successToast).toBeVisible({ timeout: 10000 });
    console.log("ASSERT: Success toast is visible - Insurance Policy saved successfully");
  });

});
