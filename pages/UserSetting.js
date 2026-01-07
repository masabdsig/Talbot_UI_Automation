// pages/DashboardLocators.js
import { test, expect } from '@playwright/test';

export class DashboardLocators {
    constructor(page) {
        this.page = page;

        this.enable2FATitle = page.locator('h6.modal-title', { hasText: 'Enable Two Factor Authentication' });
        this.skipButton = page.getByRole('button', { name: 'Skip' });
        this.avatarIcon = page.locator('img.userProfilePicture[alt="Avatar"]');
        this.userSettingsButton = page.getByText('User Settings', { exact: true });
        this.userSettingsModal = page.locator('patient-capture-signature');
        // Setup Digital Signature menu - scoped to modal's list-group (menu area)
        this.setupDigitalSignatureMenu = this.userSettingsModal.locator('.list-group').getByText('Set-up Digital Signature', { exact: true });
        this.setupDigitalSignatureMenuActive = this.userSettingsModal.locator('.list-group').locator('.active-menu, [class*="active"]').filter({ hasText: 'Set-up Digital Signature' });
        this.signatureImage = page.locator('img[src^="data:image/png"]');
        this.clearButton = page.locator('button.btn.btn-danger', { hasText: 'Clear' });
        this.signPadButton = page.locator('button.btn.btn-primary', { hasText: 'Sign With SignaturePad' });
        this.pinInput = page.locator('input[type="password"].e-input');
        this.pinEyeToggle = page.locator('i.fa-eye-slash.icon');
        this.uploadSignatureButton = page.locator('button.btn.btn-primary.position-relative', { hasText: 'Upload Signature' });
        this.uploadFileInput = this.uploadSignatureButton.locator('input[type="file"]');
        this.saveSignatureButton = page.locator('button.btn.btn-primary', { hasText: 'Save Signature' });
        this.updatePinButton = page.locator('button.btn.btn-primary', { hasText: 'Update PIN' });
        this.closeButton = page.locator('button.btn.btn-danger', { hasText: 'Close' });
        this.signatureCanvas = page.locator('signature-pad canvas');
        this.toastTitle = page.locator('.toast-title');
        this.toastMessage = page.locator('.toast-message');

        // Success toaster
        this.successToastTitle = page.locator('.toast-success .toast-title');
        this.successToastMessage = page.locator('.toast-success .toast-message');

        this.LEFT_MENU_ITEMS = [
            "Set-up Digital Signature",
            "Set-up Two Factor Authentication",
            "Scan Documents",
            "Provider Availability",
            "Provider Orientation Checklist",
            "Personnel File Checklist",
            "Set-up Online Appointments",
            "Set-up Dosespot PIN",
            "TFA/Dual Mobile Activation"
        ];

        // Left menu locators - menu items are in .list-group within the modal
        // Each menu item is a generic element containing text (they're clickable divs)
        // Use a more generic selector that finds all clickable menu items
        this.leftMenuItems = this.userSettingsModal.locator('.list-group > *');
        this.providerAvailabilityMenu = this.userSettingsModal.locator('.list-group').getByText('Provider Availability', { exact: true });

        // Provider Availability Grid
        this.providerAvailabilityGrid = page.locator('.e-gridcontent');

        // Add Provider Availability Button
        this.addProviderAvailabilityButton = page.getByRole('button', { name: /Add Provider Availability/i });

        // Provider Modal Title
        this.providerModalTitle = page.getByRole('heading', { name: 'Provider Availability' });

        // Weekday checkbox (dynamic, e.g. "Wednesday")
        this.weekdayCheckbox = (day) =>
            page.locator(`label:has-text("${day}")`).locator('input[type="checkbox"]');

        // Radio buttons - use text-based selector for more reliability
        // Find label containing "Available" text, with fallback to ID-based selector
        this.availableRadio = page.locator('label:has-text("Available")').first().or(page.locator('label[for="e-radio_49"]'));
        this.unavailableRadio = page.locator('label:has-text("Unavailable")').first().or(page.locator('label[for="e-radio_50"]'));

        // Datepickers
        this.fromDateInput = page.locator('#from_date_datepicker_input');
        this.toDateInput = page.locator('#to_date_datepicker_input');

        // From Date icon (2nd element in snapshot)
        this.fromDateIcon = page.locator('#from_date_datepicker').getByRole('button', { name: 'select' });

        // To Date icon (3rd element in snapshot)
        this.toDateIcon = page.locator('#to_date_datepicker').getByRole('button', { name: 'select' });

        // Time icons
        this.fromTimeIcon = page.locator('#from_time_timepicker').locator('.e-input-group-icon.e-time-icon.e-icons');
        this.toTimeIcon = page.locator('#to_time_timepicker').locator('.e-input-group-icon.e-time-icon.e-icons');

        // Save button in Provider Availability modal
        this.saveProviderAvailability = page.getByRole('button', { name: /Save/i });
    }

    // DRAWING FUNCTION
    // ----------------------------------------------------
    async drawOnCanvas() {
        const canvas = this.signatureCanvas;
        await expect(canvas).toBeVisible();

        const box = await canvas.boundingBox();
        if (!box) throw new Error("Canvas not found.");

        const w = box.width;
        const h = box.height;

        let x = box.x + w * 0.1;
        let y = box.y + h * 0.5;

        await this.page.mouse.move(x, y);
        await this.page.mouse.down();

        const strokes = Math.floor(Math.random() * 4) + 5;

        for (let i = 0; i < strokes; i++) {
            x += Math.floor(Math.random() * (w * 0.15)) + 30;
            let yOffset = Math.floor(Math.random() * 40) * (Math.random() > 0.5 ? 1 : -1);
            y = Math.max(box.y + 10, Math.min(box.y + h - 10, y + yOffset));

            await this.page.mouse.move(x, y, { steps: 15 });

            await this.page.waitForTimeout(80);
        }

        await this.page.mouse.up();
        await this.page.keyboard.press('Enter');
    }

    // Canvas checksum
    async getCanvasData() {
        return await this.page.evaluate(() => {
            const canvas = document.querySelector('signature-pad canvas');
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            return data.reduce((n, v) => n + v, 0);
        });
    }

    async selectNextDay() {
        await this.page.waitForSelector('.e-calendar');

        const nextDayCell = this.page.locator('.e-calendar td.e-today + td');

        await nextDayCell.waitFor({ state: 'visible', timeout: 5000 });
        await nextDayCell.click();
    }

}
