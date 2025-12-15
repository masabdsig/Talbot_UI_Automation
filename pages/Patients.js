const { test, expect } = require('@playwright/test');

class PatientPage {
  constructor(page) {
    this.page = page;

    // Navigation
    this.patientsTab = page.locator('button.header-btn:has-text("Patients")');

    // Buttons
    this.addPatientBtn = page.locator('button.btn-primary:has-text("Add Patient")');
    this.saveBtn = page.locator('button.btn-primary:has-text("Save")');

    // Modal Title
    this.modalTitle = page.locator('.modal-title:has-text("Add New Patient")');

    // Form inputs
    this.firstName = page.locator('label:has-text("First Name") + input');
    this.lastName = page.locator('label:has-text("Last Name") + input');
    this.dobInput = page.locator('#patient_dob_datepicker_input');
    this.address = page.locator('label:has-text("Address") + input');
    this.zipcode = page.locator('label:has-text("Zip Code") + input');
    this.city = page.locator('label:has-text("City") + input');
    this.phoneNumber = page.locator('label:has-text("Phone Number") + input');
    this.emailAddress = page.locator('label:has-text("Email") + input');

    // Dropdowns (stable, label-based)
    this.genderDropdown = page
      .locator('label:has-text("Gender")')
      .locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    this.stateDropdown = page
      .locator('label:has-text("State")')
      .locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    this.preferredContactDropdown = page
      .locator('label:has-text("Preferred Contact")')
      .locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    this.referralSourceDropdown = page
      .locator('label:has-text("Referral Source")')
      .locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    // Checkboxes
    this.noSSNCheckbox = page.locator('label:has-text("Doesn\'t have SSN") input[type="checkbox"]');

    // Success toast
    this.successToast = page.locator('.toast-success');
    
    // Error toast
    this.errorToast = page.locator('.toast-error, .toast-danger, .toast-warning');

    // Search input
    this.searchPatientInput = page.locator('label:has-text("Search Patient") + input');

    // First patient row ID link
    this.firstPatientIdLink = page.locator('tr.e-row td[data-colindex="0"] a.primaryColor').first();

    this.getPatientIdByFirstName = (firstName) =>
      this.page.locator(
        `tr.e-row:has(td a.primaryColor:has-text("${firstName}")) td[data-colindex="0"] a.primaryColor`
      );

      this.getPatientNameByFirstName = (firstName) =>
        this.page.locator(
          `tr.e-row:has(td a.primaryColor:has-text("${firstName}")) td[data-colindex="1"] a.primaryColor`
        );

    // Patient header name link
    this.patientHeaderName = page.locator('.card-header .card-title-text');

    // Religion dropdown wrapper
    this.religionDropdown = page
      .locator('label:has-text("Religion")')
      .locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    // Ethnicity wrapper
    this.ethnicityDropdown = page
      .locator('label:has-text("Ethnicity")')
      .locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    // Save Patient Information button
    this.savePatientInformationBtn = page.locator('button.btn-primary:has-text("Save Patient Information")');
  }

  async gotoPatientsTab() {
    console.log('ACTION: Clicking Patients tab...');
    await this.patientsTab.click();
  }

  async openAddPatientModal() {
    console.log('ACTION: Clicking Add Patient button...');
    await this.addPatientBtn.click();
  }

  async validateFormFields() {
    console.log("VALIDATION: Starting form field validation...");

    await expect(this.firstName).toBeVisible();
    await expect(this.lastName).toBeVisible();
    await expect(this.dobInput).toBeVisible();
    await expect(this.genderDropdown).toBeVisible();
    await expect(this.address).toBeVisible();
    await expect(this.zipcode).toBeVisible();
    await expect(this.city).toBeVisible();
    await expect(this.stateDropdown).toBeVisible();
    await expect(this.preferredContactDropdown).toBeVisible();
    await expect(this.referralSourceDropdown).toBeVisible();
    await expect(this.phoneNumber).toBeVisible();

    console.log("VALIDATION COMPLETE.");
  }

  async fillMandatoryFields(data) {
    console.log(`ACTION: Filling first name: ${data.firstName}`);
    await this.firstName.fill(data.firstName);

    console.log(`ACTION: Filling last name: ${data.lastName}`);
    await this.lastName.fill(data.lastName);

    console.log(`ACTION: Filling DOB: ${data.dob}`);
    await this.dobInput.fill(data.dob);

    await this.page.waitForTimeout(1000);
    // GENDER SELECTION
    console.log(`ACTION: Selecting gender: ${data.gender}`);
    await this.genderDropdown.click({ force: true });

    const visiblePopup = this.page.locator('div[id$="_popup"]:visible');
    await visiblePopup.waitFor();

    await visiblePopup.getByRole('option', { name: data.gender, exact: true }).click();

    // ADDRESS
    console.log(`ACTION: Filling address: ${data.address}`);
    await this.address.fill(data.address);

    // ZIPCODE (triggers auto-fill)
    console.log(`ACTION: Filling zipcode: ${data.zipcode}`);
    await this.zipcode.fill(data.zipcode);

    // let auto-populate happen
    await this.page.waitForTimeout(700);

    // -------------------------
    // CITY AUTO-FILL LOGIC
    // -------------------------
    const currentCity = await this.city.inputValue();
    console.log("DEBUG: Auto-filled city value =", currentCity);

    if (!currentCity || currentCity.trim() === "") {
      console.log("ACTION: City not auto-filled → entering manually");
      await this.city.fill(data.city);
    } else {
      console.log("INFO: City auto-filled → skipping manual entry");
    }

    // -------------------------
    // STATE AUTO-FILL LOGIC
    // -------------------------
    let stateText = "";

    try {
      stateText = await this.stateDropdown.locator('input[role="combobox"]').getAttribute('aria-label');
    } catch {
      stateText = "";
    }

    console.log("DEBUG: Auto-filled state value =", stateText);

    if (!stateText || stateText.trim() === "") {
      console.log(`ACTION: State not auto-filled → selecting ${data.state}`);

      await this.stateDropdown.click({ force: true });

      const popup = this.page.locator('div[id$="_popup"]:visible');
      await popup.waitFor();

      await popup.getByRole('option', { name: data.state, exact: true }).click();
    } else {
      console.log("INFO: State auto-filled → skipping manual selection");
    }

    // PHONE NUMBER
    console.log(`ACTION: Filling phone number: ${data.phone}`);
    await this.phoneNumber.fill(data.phone);
  }

  async checkNoSSN() {
    console.log('ACTION: Checking "Does not have SSN"...');
    await this.noSSNCheckbox.check();
  }

  async save() {
    console.log('ACTION: Clicking Save button...');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/af7726e8-2804-46c5-af9c-8155f4ebafb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Patients.js:193',message:'Before save click',data:{saveBtnVisible:await this.saveBtn.isVisible().catch(()=>false)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    await this.saveBtn.click();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/af7726e8-2804-46c5-af9c-8155f4ebafb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Patients.js:196',message:'After save click',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  }

  async searchPatient(name) {
    console.log(`ACTION: Searching patient: ${name}`);
    await this.searchPatientInput.fill(name);
    await this.page.waitForTimeout(800); // allow grid refresh
  }

  async openFirstPatientRecord() {
    console.log("ACTION: Clicking first patient record...");
    await this.firstPatientIdLink.first().click();
  }

  async openPatientEditForm() {
    console.log("ACTION: Clicking patient name in header...");
    await this.patientHeaderName.click();
  }

  async updateReligion(religion) {
    console.log(`ACTION: Updating Religion to: ${religion}`);

    // Wait for page to load
    await this.page.waitForLoadState("networkidle");
    
    // Wait for Religion dropdown to be ready and visible
    await this.waitForReligionFieldReady();

    // Check if dropdown already has the selected value
    const input = this.religionDropdown.locator('input[role="combobox"]');
    const currentValue = await input.inputValue();
    
    if (currentValue && currentValue.trim() === religion) {
      console.log(`INFO: Religion already set to "${religion}", skipping update`);
      return;
    }

    // Click the dropdown to open it
    console.log('ACTION: Clicking Religion dropdown...');
    await this.religionDropdown.click({ force: true });

    // Wait for and locate the Syncfusion popup (dropdown is open)
    const popup = this.page.locator('div[id$="_popup"]:visible');
    
    // Wait for popup to be visible (dropdown is open)
    try {
      await popup.waitFor({ state: 'visible', timeout: 5000 });
      
      // Verify dropdown is open by checking if popup exists and is visible
      const popupCount = await popup.count();
      if (popupCount > 0) {
        console.log('ACTION: Dropdown is open, selecting option...');
        await popup.getByRole('option', { name: religion, exact: true }).click();
        return;
      }
    } catch (error) {
      console.log('INFO: Popup not found, using fallback method...');
    }

    // Fallback: input updates directly without popup
    await input.fill(religion);
    await input.press('Enter');
  }

  async savePatientInformation() {
    console.log("ACTION: Clicking Save Patient Information...");
    await this.savePatientInformationBtn.click();
  }

  async waitForReligionFieldReady() {
    // Wait for label to appear
    await this.page.waitForSelector('label:has-text("Religion")', { state: "visible" });
  
    // Wait for Syncfusion dropdown to attach and hydrate
    await this.page.waitForSelector(
      'label:has-text("Religion") >> xpath=../..//div[contains(@class,"e-control-wrapper")]',
      { state: "attached" }
    );
  
    // Confirm it is fully visible and clickable
    await expect(this.religionDropdown).toBeVisible();
  }

  async enterEmailAddress(email) {
    console.log(`ACTION: Entering email address: ${email}`);
    await this.emailAddress.fill(email);
  }

}

module.exports = { PatientPage };
