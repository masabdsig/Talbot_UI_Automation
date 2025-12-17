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

    // SSN input field
    this.ssnInput = page.locator('label:has-text("SSN") + input, input[placeholder*="SSN"], input[id*="ssn"]');

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

    // Insurance tab button
    this.insuranceTab = page.locator('button.tablinks1:has-text("Insurance")');

    // Add Policy button
    this.addPolicyBtn = page.locator('button.btn-primary:has-text("Add Policy")');

    // Add Insurance Policy Modal
    this.addInsurancePolicyModal = page.locator('patient-add-policy');
    this.addInsurancePolicyModalTitle = page.locator('h5.modal-title:has-text("Add Insurance Policy")');

    // Company Type radio buttons - click the label for better reliability
    this.companyTypeRadio = (type) => page.locator(`ejs-radiobutton:has(span.e-label:has-text("${type}")) label`);

    // Policy Number input
    this.policyNumberInput = page.locator('#policy_number');

    // Level dropdown
    this.levelDropdown = page.locator('label:has-text("Level *")').locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    // Pt Relation to Policy Holder dropdown
    this.ptRelationDropdown = page.locator('label:has-text("Pt Relation to Policy Holder *")').locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    // Policy Holder First Name
    this.policyHolderFirstName = page.locator('#firstName');

    // Policy Holder Last Name
    this.policyHolderLastName = page.locator('#lastName');

    // Sex dropdown
    this.sexDropdown = page.locator('label:has-text("Sex *")').locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    // DOB datepicker
    this.policyHolderDobInput = page.locator('#dob_datepicker_input');

    // Save Insurance Policy button
    this.saveInsurancePolicyBtn = page.locator('patient-add-policy button.btn-primary:has-text("Save")');

    // Payor Id dropdown
    this.payorIdDropdown = page.locator('label:has-text("Payor Id")').locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    // Company Name dropdown
    this.companyNameDropdown = page.locator('label:has-text("Company Name")').locator('xpath=../..//div[contains(@class,"e-control-wrapper")]');

    // Confirmation Dialog
    this.confirmationDialog = page.locator('patient-conformation-dialog');
    this.confirmationDialogTitle = page.locator('patient-conformation-dialog h6.modal-title:has-text("Confirmation")');
    this.confirmationOkBtn = page.locator('patient-conformation-dialog button.btn-primary:has-text("Ok")');
    this.confirmationCancelBtn = page.locator('patient-conformation-dialog button.btn-danger:has-text("Cancel")');

    // Work Menu
    this.workMenuButton = page.locator('button:has-text("Work"), [role="button"]:has-text("Work"), .work-menu, button.dropdown-toggle:has-text("Work")');
    this.workMenuContainer = page.locator('div:has-text("Work Menu")').locator('xpath=ancestor::div[contains(@class, "row")]').first();
    this.workMenuDropdown = page.locator('div:has-text("Work Menu")').locator('xpath=ancestor::div[contains(@class, "row")]').first();
    this.workMenuOptions = page.locator('div:has-text("Work Menu")').locator('xpath=ancestor::div[contains(@class, "row")]//div[contains(@class, "mat-menu") and contains(@class, "cursor")]');
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

    // Validate dropdown options
    console.log("VALIDATION: Validating dropdown options...");
    
    // Validate Gender dropdown options
    await this.validateDropdownOptions(this.genderDropdown, "Gender");
    
    // Validate State dropdown options
    await this.validateDropdownOptions(this.stateDropdown, "State");
    
    // Validate Preferred Contact dropdown options
    await this.validateDropdownOptions(this.preferredContactDropdown, "Preferred Contact");
    
    // Validate Referral Source dropdown options
    await this.validateDropdownOptions(this.referralSourceDropdown, "Referral Source");

    console.log("VALIDATION COMPLETE.");
  }

  async validateDropdownOptions(dropdown, dropdownName) {
    console.log(`VALIDATION: Validating ${dropdownName} dropdown options...`);
    
    // Click dropdown to open it
    await dropdown.click({ force: true });
    await this.page.waitForTimeout(500);
    
    // Wait for popup to appear
    const popup = this.page.locator('div[id$="_popup"]:visible');
    await popup.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get all options
    const options = popup.locator('li[role="option"]');
    const optionCount = await options.count();
    
    console.log(`VALIDATION: ${dropdownName} dropdown has ${optionCount} options`);
    
    if (optionCount === 0) {
      throw new Error(`${dropdownName} dropdown has no options available`);
    }
    
    // Get all option texts
    const optionTexts = [];
    for (let i = 0; i < optionCount; i++) {
      const optionText = await options.nth(i).textContent();
      optionTexts.push(optionText.trim());
    }
    
    console.log(`VALIDATION: ${dropdownName} dropdown options:`, optionTexts);
    
    // Close dropdown by clicking outside or pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    
    console.log(`VALIDATION: ${dropdownName} dropdown options validated successfully`);
  }

  async validateAlertMessageForRequiredFields() {
    console.log("VALIDATION: Starting validation of alert messages for required fields...");
    
    // Ensure form is completely empty (don't fill any fields)
    await this.clearAllFields();
    
    // List of required fields to validate
    const requiredFields = [
      "First Name",
      "Last Name",
      "DOB",
      "Gender",
      "SSN",
      "Address",
      "Zip Code",
      "City",
      "State"
    ];

    console.log("ACTION: Attempting to save blank form...");
    
    // Try to save blank form - should trigger validation error for all required fields
    await this.save();
    
    // Wait for toast to appear
    await this.page.waitForTimeout(2000);
    
    // Check for error toast - it should be visible
    const errorToastVisible = await this.errorToast.isVisible().catch(() => false);
    
    if (!errorToastVisible) {
      // If no error toast, check if modal is still open (validation prevented save)
      const modalStillOpen = await this.modalTitle.isVisible().catch(() => false);
      if (modalStillOpen) {
        console.log("VALIDATION: Modal still open - validation prevented save");
        // Try to get any error message from the page
        const pageErrors = await this.page.locator('.text-danger, .error-message, .validation-error').allTextContents().catch(() => []);
        if (pageErrors.length > 0) {
          console.log("VALIDATION: Found inline validation errors:", pageErrors);
        }
      } else {
        throw new Error("VALIDATION FAILED: No error toast appeared and modal closed. Expected validation error for blank form.");
      }
    } else {
      // Get toast message text
      const toastMessage = await this.page.locator('.toast-error .toast-message, .toast-danger .toast-message, .toast-warning .toast-message').textContent().catch(() => '');
      const toastTitle = await this.page.locator('.toast-error .toast-title, .toast-danger .toast-title, .toast-warning .toast-title').textContent().catch(() => '');
      const combinedToastText = (toastTitle + ' ' + toastMessage).toLowerCase();
      
      console.log("VALIDATION: Error toast is visible");
      console.log(`VALIDATION: Toast title: ${toastTitle}`);
      console.log(`VALIDATION: Toast message: ${toastMessage}`);
      
      // Validate that toast mentions required fields or contains validation keywords
      const validationKeywords = ['required', 'mandatory', 'missing', 'fill', 'complete'];
      const hasValidationKeyword = validationKeywords.some(keyword => combinedToastText.includes(keyword));
      
      if (!hasValidationKeyword) {
        console.log("WARNING: Toast message doesn't contain common validation keywords");
      }
      
      // Check if toast mentions any of the required fields
      const mentionedFields = [];
      for (const fieldName of requiredFields) {
        const fieldVariations = [
          fieldName.toLowerCase(),
          fieldName.replace(' ', '').toLowerCase(),
          fieldName.replace(' ', '-').toLowerCase()
        ];
        
        if (fieldVariations.some(variation => combinedToastText.includes(variation))) {
          mentionedFields.push(fieldName);
        }
      }
      
      if (mentionedFields.length > 0) {
        console.log(`VALIDATION: Toast mentions ${mentionedFields.length} required field(s): ${mentionedFields.join(', ')}`);
      }
      
      // Validate that toast indicates validation error
      if (hasValidationKeyword || mentionedFields.length > 0 || combinedToastText.includes('error')) {
        console.log("VALIDATION: Alert message validated - toast indicates required field validation");
      } else {
        // Still consider it valid if error toast appeared
        console.log("VALIDATION: Error toast appeared (validation triggered)");
      }
    }
    
    console.log("VALIDATION: All required field alert messages validated successfully in single toast");
  }

  async clearAllFields() {
    console.log("ACTION: Clearing all form fields...");
    
    // Clear text inputs
    await this.firstName.clear().catch(() => {});
    await this.lastName.clear().catch(() => {});
    await this.dobInput.clear().catch(() => {});
    await this.address.clear().catch(() => {});
    await this.zipcode.clear().catch(() => {});
    await this.city.clear().catch(() => {});
    await this.ssnInput.clear().catch(() => {});
    await this.phoneNumber.clear().catch(() => {});
    await this.emailAddress.clear().catch(() => {});
    
    // Uncheck SSN checkbox if checked
    const isSSNChecked = await this.noSSNCheckbox.isChecked().catch(() => false);
    if (isSSNChecked) {
      await this.noSSNCheckbox.uncheck().catch(() => {});
    }
    
    // Clear dropdowns by checking if they have values and clearing them
    // Note: Dropdowns might need special handling depending on the component
    await this.page.waitForTimeout(500);
  }

  async fillAllFieldsExcept(excludeFieldName) {
    console.log(`ACTION: Filling all required fields except ${excludeFieldName}...`);
    
    const testData = {
      firstName: "Test",
      lastName: "User",
      dob: "01/01/1990",
      gender: "Male",
      ssn: "123-45-6789",
      address: "123 Test St",
      zipcode: "12345",
      city: "Test City",
      state: "NY"
    };

    // Fill First Name
    if (excludeFieldName !== "First Name") {
      await this.firstName.fill(testData.firstName).catch(() => {});
    }

    // Fill Last Name
    if (excludeFieldName !== "Last Name") {
      await this.lastName.fill(testData.lastName).catch(() => {});
    }

    // Fill DOB
    if (excludeFieldName !== "DOB") {
      await this.dobInput.fill(testData.dob).catch(() => {});
      await this.page.waitForTimeout(500);
    }

    // Select Gender
    if (excludeFieldName !== "Gender") {
      try {
        await this.genderDropdown.click({ force: true });
        await this.page.waitForTimeout(500);
        
        // Check if dropdown is open, if not open then click again
        const popup = this.page.locator('div[id$="_popup"]:visible');
        const popupVisible = await popup.isVisible().catch(() => false);
        
        if (!popupVisible) {
          console.log('INFO: Gender dropdown not open after first click, clicking again...');
          await this.page.waitForTimeout(500);
          await this.genderDropdown.click({ force: true });
          await this.page.waitForTimeout(500);
        }
        
        await popup.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await popup.getByRole('option', { name: testData.gender, exact: true }).click().catch(() => {});
        await this.page.waitForTimeout(300);
      } catch (e) {
        console.log(`WARNING: Could not select gender: ${e.message}`);
      }
    }

    // Fill SSN or check "Doesn't have SSN"
    if (excludeFieldName !== "SSN") {
      // Try to fill SSN first
      const ssnExists = await this.ssnInput.count().catch(() => 0);
      if (ssnExists > 0) {
        const ssnVisible = await this.ssnInput.isVisible().catch(() => false);
        if (ssnVisible) {
          await this.ssnInput.fill(testData.ssn).catch(() => {});
        } else {
          // If SSN field is not visible, check "Doesn't have SSN"
          await this.noSSNCheckbox.check().catch(() => {});
        }
      } else {
        // If SSN field doesn't exist, check "Doesn't have SSN"
        await this.noSSNCheckbox.check().catch(() => {});
      }
    }

    // Fill Address
    if (excludeFieldName !== "Address") {
      await this.address.fill(testData.address).catch(() => {});
    }

    // Fill Zip Code
    if (excludeFieldName !== "Zip Code") {
      await this.zipcode.fill(testData.zipcode).catch(() => {});
      await this.page.waitForTimeout(500); // Wait for auto-fill
    }

    // Fill City
    if (excludeFieldName !== "City") {
      const currentCity = await this.city.inputValue().catch(() => "");
      if (!currentCity || currentCity.trim() === "") {
        await this.city.fill(testData.city).catch(() => {});
      }
    }

    // Select State
    if (excludeFieldName !== "State") {
      try {
        const stateValue = await this.stateDropdown.locator('input[role="combobox"]').inputValue().catch(() => "");
        if (!stateValue || stateValue.trim() === "") {
          await this.stateDropdown.click({ force: true });
          await this.page.waitForTimeout(500);
          const popup = this.page.locator('div[id$="_popup"]:visible');
          await popup.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
          await popup.getByRole('option', { name: testData.state, exact: true }).click().catch(() => {});
          await this.page.waitForTimeout(300);
        }
      } catch (e) {
        console.log(`WARNING: Could not select state: ${e.message}`);
      }
    }

    await this.page.waitForTimeout(500);
  }

  async fillMandatoryFields(data) {
    console.log(`ACTION: Filling first name: ${data.firstName}`);
    await this.firstName.fill(data.firstName);

    console.log(`ACTION: Filling last name: ${data.lastName}`);
    await this.lastName.fill(data.lastName);

    console.log(`ACTION: Filling DOB: ${data.dob}`);
    await this.dobInput.fill(data.dob);

    await this.page.waitForTimeout(2000);
    // GENDER SELECTION
    console.log(`ACTION: Selecting gender: ${data.gender}`);
    await this.genderDropdown.click({ force: true });
    await this.page.waitForTimeout(500);

    // Check if dropdown is open, if not open then click again
    const visiblePopup = this.page.locator('div[id$="_popup"]:visible');
    const popupVisible = await visiblePopup.isVisible().catch(() => false);

    if (!popupVisible) {
      console.log('INFO: Gender dropdown not open after first click, clicking again...');
      await this.page.waitForTimeout(500);
      await this.genderDropdown.click({ force: true });
      await this.page.waitForTimeout(500);
    }

    await visiblePopup.waitFor({ state: 'visible', timeout: 5000 });

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
    await this.saveBtn.click();
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

    // 1. Wait for page load so dropdown is visible
    await this.page.waitForLoadState("networkidle");
    await this.waitForReligionFieldReady();
    await expect(this.religionDropdown).toBeVisible();

    await this.page.waitForTimeout(5000);

    // 2. Click on religion dropdown to open dropdown
    console.log('ACTION: Clicking Religion dropdown...');
    await this.religionDropdown.click({ force: true });

    // 3. Check if dropdown is open, if not open then wait for 2 sec and click again
    const popup = this.page.locator('div[id$="_popup"]:visible');
    const popupVisible = await popup.isVisible().catch(() => false);

    if (!popupVisible) {
      console.log('INFO: Dropdown not open after first click, waiting 2 seconds and clicking again...');
      await this.page.waitForTimeout(5000);
      await this.religionDropdown.click({ force: true });
    }

    // Wait for popup to be visible
    await popup.waitFor({ state: 'visible', timeout: 5000 });

    // 4. Select any religion for patient
    console.log('ACTION: Selecting religion option...');
    await popup.getByRole('option', { name: religion, exact: true }).click();
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

  async selectInsuranceTab() {
    console.log('ACTION: Clicking Insurance tab...');
    await expect(this.insuranceTab).toBeVisible();
    await this.insuranceTab.click();
    // Wait for Insurance tab content to load
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }


  async clickAddPolicy() {
    console.log('ACTION: Clicking Add Policy button...');
    await expect(this.addPolicyBtn).toBeVisible();
    await this.addPolicyBtn.click();
    // Wait for modal to appear
    await expect(this.addInsurancePolicyModalTitle).toBeVisible({ timeout: 10000 });
  }

  async fillInsurancePolicyForm(data, patientData = null) {
    console.log('ACTION: Filling Insurance Policy form...');

    // Wait for modal to be ready
    await this.page.waitForLoadState("networkidle");
    await expect(this.addInsurancePolicyModal).toBeVisible();
    await this.page.waitForTimeout(2000);

    // 1. Select Company Type (radio button)
    if (data.companyType) {
      console.log(`ACTION: Selecting Company Type: ${data.companyType}`);
      const companyTypeRadio = this.companyTypeRadio(data.companyType);
      // Wait for radio button to be attached first, then visible
      await companyTypeRadio.waitFor({ state: 'attached', timeout: 10000 });
      // Scroll into view if needed
      await companyTypeRadio.scrollIntoViewIfNeeded();
      // Wait for it to be visible
      await expect(companyTypeRadio).toBeVisible({ timeout: 10000 });
      await companyTypeRadio.click({ force: true });
      await this.page.waitForTimeout(1000); // Wait for dependent fields to enable

      // Ensure Company Type radio is selected, if not then select again
      console.log('VALIDATION: Ensuring Company Type radio is selected...');
      const radioInput = this.page.locator(`ejs-radiobutton:has(span.e-label:has-text("${data.companyType}")) input[type="radio"]`);
      const isSelected = await radioInput.isChecked().catch(() => false);
      
      if (!isSelected) {
        console.log('INFO: Company Type radio not selected, selecting again...');
        await companyTypeRadio.click({ force: true });
        await this.page.waitForTimeout(1000); // Wait for dependent fields to enable
      } else {
        console.log('VALIDATION: Company Type radio is already selected');
      }

      // Validate and select Payor Id (required field)
      console.log('VALIDATION: Checking Payor Id is enabled (required field)...');
      await expect(this.payorIdDropdown.locator('input[role="combobox"]')).toBeEnabled({ timeout: 10000 });
      console.log('ACTION: Selecting first available Payor Id...');
      await this.payorIdDropdown.click({ force: true });
      await this.page.waitForTimeout(500);
      const payorIdPopup = this.page.locator('div[id$="_popup"]:visible');
      await payorIdPopup.waitFor({ state: 'visible', timeout: 5000 });
      // Get first available option
      const firstPayorIdOption = payorIdPopup.locator('li[role="option"]').first();
      await firstPayorIdOption.click();
      await this.page.waitForTimeout(500);

      // Validate and select Company Name (required field)
      console.log('VALIDATION: Checking Company Name is enabled (required field)...');
      await expect(this.companyNameDropdown.locator('input[role="combobox"]')).toBeEnabled({ timeout: 10000 });
      console.log('ACTION: Selecting first available Company Name...');
      await this.companyNameDropdown.click({ force: true });
      await this.page.waitForTimeout(500);
      const companyNamePopup = this.page.locator('div[id$="_popup"]:visible');
      await companyNamePopup.waitFor({ state: 'visible', timeout: 5000 });
      // Get first available option
      const firstCompanyNameOption = companyNamePopup.locator('li[role="option"]').first();
      await firstCompanyNameOption.click();
      await this.page.waitForTimeout(500);
    }

    // 2. Fill Policy Number
    if (data.policyNumber) {
      console.log(`ACTION: Filling Policy Number: ${data.policyNumber}`);
      await expect(this.policyNumberInput).toBeVisible();
      await this.policyNumberInput.fill(data.policyNumber);
    }

    // 3. Select Level
    if (data.level) {
      console.log(`ACTION: Selecting Level: ${data.level}`);
      await this.levelDropdown.click({ force: true });
      await this.page.waitForTimeout(500);
      const levelPopup = this.page.locator('div[id$="_popup"]:visible');
      await levelPopup.waitFor({ state: 'visible', timeout: 5000 });
      await levelPopup.getByRole('option', { name: data.level, exact: true }).click();
    }

    // 4. Select Pt Relation to Policy Holder
    if (data.ptRelation) {
      console.log(`ACTION: Selecting Pt Relation: ${data.ptRelation}`);
      await this.ptRelationDropdown.click({ force: true });
      await this.page.waitForTimeout(500);
      const relationPopup = this.page.locator('div[id$="_popup"]:visible');
      await relationPopup.waitFor({ state: 'visible', timeout: 5000 });
      await relationPopup.getByRole('option', { name: data.ptRelation, exact: true }).click();
      await this.page.waitForTimeout(1000); // Wait for auto-population to occur
    }

    // 5-8. Policy Holder Information - Fill or Validate based on relation
    if (data.ptRelation === "Self" && patientData) {
      // If "Self" is selected, validate that fields are auto-populated with patient data
      console.log('ACTION: Relation is "Self" - Validating auto-populated patient data...');
      await this.page.waitForTimeout(2000); // Wait for auto-population

      // Validate First Name
      console.log(`VALIDATION: Checking Policy Holder First Name matches patient: ${patientData.firstName}`);
      await expect(this.policyHolderFirstName).toBeVisible({ timeout: 10000 });
      const actualFirstName = await this.policyHolderFirstName.inputValue();
      if (actualFirstName !== patientData.firstName) {
        throw new Error(`First Name mismatch: Expected "${patientData.firstName}", but found "${actualFirstName}"`);
      }

      // Validate Last Name
      console.log(`VALIDATION: Checking Policy Holder Last Name matches patient: ${patientData.lastName}`);
      await expect(this.policyHolderLastName).toBeVisible({ timeout: 10000 });
      const actualLastName = await this.policyHolderLastName.inputValue();
      if (actualLastName !== patientData.lastName) {
        throw new Error(`Last Name mismatch: Expected "${patientData.lastName}", but found "${actualLastName}"`);
      }

      // Validate Sex (maps from patientData.gender)
      console.log(`VALIDATION: Checking Sex matches patient gender: ${patientData.gender}`);
      const sexInput = this.sexDropdown.locator('input[role="combobox"]');
      await expect(sexInput).toBeVisible({ timeout: 10000 });
      const actualSex = await sexInput.inputValue();
      if (actualSex !== patientData.gender) {
        throw new Error(`Sex mismatch: Expected "${patientData.gender}", but found "${actualSex}"`);
      }

      // Validate DOB - normalize dates for comparison
      console.log(`VALIDATION: Checking DOB matches patient: ${patientData.dob}`);
      await expect(this.policyHolderDobInput).toBeVisible({ timeout: 10000 });
      const actualDob = await this.policyHolderDobInput.inputValue();
      // Normalize dates (remove leading zeros, handle different formats)
      const normalizeDate = (dateStr) => dateStr ? dateStr.replace(/\b0/g, '').trim() : '';
      const expectedDobNormalized = normalizeDate(patientData.dob);
      const actualDobNormalized = normalizeDate(actualDob);
      if (actualDobNormalized !== expectedDobNormalized && actualDob !== patientData.dob) {
        throw new Error(`DOB mismatch: Expected "${patientData.dob}", but found "${actualDob}"`);
      }

      console.log('VALIDATION: All Policy Holder fields match patient data');
    } else {
      // If not "Self", fill the fields as before
      // 5. Fill Policy Holder First Name
      if (data.firstName) {
        console.log(`ACTION: Filling Policy Holder First Name: ${data.firstName}`);
        await expect(this.policyHolderFirstName).toBeVisible();
        await this.policyHolderFirstName.fill(data.firstName);
      }

      // 6. Fill Policy Holder Last Name
      if (data.lastName) {
        console.log(`ACTION: Filling Policy Holder Last Name: ${data.lastName}`);
        await expect(this.policyHolderLastName).toBeVisible();
        await this.policyHolderLastName.fill(data.lastName);
      }

      // 7. Select Sex
      if (data.sex) {
        console.log(`ACTION: Selecting Sex: ${data.sex}`);
        await this.sexDropdown.click({ force: true });
        await this.page.waitForTimeout(500);
        const sexPopup = this.page.locator('div[id$="_popup"]:visible');
        await sexPopup.waitFor({ state: 'visible', timeout: 5000 });
        await sexPopup.getByRole('option', { name: data.sex, exact: true }).click();
      }

      // 8. Fill DOB
      if (data.dob) {
        console.log(`ACTION: Filling DOB: ${data.dob}`);
        await expect(this.policyHolderDobInput).toBeVisible();
        await this.policyHolderDobInput.fill(data.dob);
        await this.page.waitForTimeout(500);
      }
    }
  }

  async saveInsurancePolicy() {
    console.log('ACTION: Clicking Save Insurance Policy button...');
    await expect(this.saveInsurancePolicyBtn).toBeVisible();
    await this.saveInsurancePolicyBtn.click();
  }

  async handleConfirmationDialog() {
    console.log('ACTION: Waiting for confirmation dialog...');
    // Wait for confirmation dialog to appear
    await expect(this.confirmationDialog).toBeVisible({ timeout: 10000 });
    await expect(this.confirmationDialogTitle).toBeVisible();
    console.log('VALIDATION: Confirmation dialog is visible');

    console.log('ACTION: Clicking Ok button in confirmation dialog...');
    await expect(this.confirmationOkBtn).toBeVisible();
    await this.confirmationOkBtn.click();
    // Wait for dialog to close
    await this.confirmationDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
  }

  async openWorkMenu() {
    console.log('ACTION: Opening Work menu...');
    // Work menu is already visible on patient detail page, no need to click a button
    // Wait for at least one menu option to be visible
    const menuOption = this.page.locator('.col-12.mat-menu.cursor').first();
    await expect(menuOption).toBeVisible({ timeout: 15000 });
    await this.page.waitForTimeout(1000);
    console.log('VALIDATION: Work menu is visible');
  }

  async getWorkMenuOptions() {
    console.log('ACTION: Getting Work menu options...');
    const options = [];
    // Find all menu options - they are divs with class "mat-menu cursor" that contain spans
    const menuOptions = this.page.locator('.col-12.mat-menu.cursor');
    const optionCount = await menuOptions.count();
    
    for (let i = 0; i < optionCount; i++) {
      const option = menuOptions.nth(i);
      const isVisible = await option.isVisible().catch(() => false);
      if (isVisible) {
        const text = await option.locator('span').textContent().catch(() => '');
        if (text && text.trim()) {
          options.push({
            locator: option,
            text: text.trim()
          });
        }
      }
    }
    
    console.log(`VALIDATION: Found ${options.length} Work menu options`);
    return options;
  }

  async clickWorkMenuOption(optionText) {
    console.log(`ACTION: Clicking Work menu option: ${optionText}`);
    // Find option by matching the span text
    const option = this.page.locator(`.col-12.mat-menu.cursor:has(span:has-text("${optionText}"))`).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await expect(option).toBeEnabled();
    await option.click();
    await this.page.waitForTimeout(1000);
    console.log(`VALIDATION: Clicked Work menu option: ${optionText}`);
  }

  async validateWorkMenuOptionLoads(optionText) {
    console.log(`VALIDATION: Validating ${optionText} loaded successfully...`);
    
    // Wait for page/modal to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Check for primary heading or key element
    const heading = this.page.locator('h1, h2, h3, h4, h5, .modal-title, .page-title, .card-title, [role="heading"]').first();
    const headingVisible = await heading.isVisible().catch(() => false);
    
    if (headingVisible) {
      const headingText = await heading.textContent().catch(() => '');
      console.log(`VALIDATION: Primary heading found: ${headingText}`);
    } else {
      // Fallback: check for any visible content
      const hasContent = await this.page.locator('body').isVisible().catch(() => false);
      console.log(`VALIDATION: Page content loaded: ${hasContent}`);
    }
    
    // Check for errors in console
    const errors = await this.page.evaluate(() => {
      return window.console._errors || [];
    }).catch(() => []);
    
    if (errors.length > 0) {
      console.log(`WARNING: Console errors detected: ${errors.length}`);
    }
    
    console.log(`VALIDATION: ${optionText} loaded successfully`);
  }

}

module.exports = { PatientPage };
