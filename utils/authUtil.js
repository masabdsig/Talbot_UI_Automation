import fs from 'fs';

export async function loginAndSaveSession(page) {

  // 1️⃣ Navigate to login page
  await page.goto(process.env.LOGIN_URL);

  // 2️⃣ Login using actual working locators
  const usernameField = page.getByRole('textbox', { name: 'Username' });
  const passwordField = page.getByRole('textbox', { name: 'Password' });
  const signInButton  = page.getByRole('button', { name: 'Sign In' });

  await usernameField.fill(process.env.LOGIN_USERNAME);
  await passwordField.fill(process.env.LOGIN_PASSWORD);
  await signInButton.click();

  // 3️⃣ Handle MFA Skip if present
  try {
    const mfaSkipButton = page.getByRole('button', { name: ' Skip' });
    await mfaSkipButton.click({ timeout: 5000 });
  } catch {
    console.log("ℹ️ MFA skip button not shown. Continuing...");
  }

  // 4️⃣ Wait for dashboard to fully load
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // 5️⃣ Extract localStorage (needed for Cognito/SPA apps)
  const localStorage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  });

  // 6️⃣ Extract cookies
  const state = await page.context().storageState();

  // 7️⃣ Merge cookies + localStorage
  const fullState = {
    ...state,
    origins: [
      {
        origin: process.env.BASE_ORIGIN || "https://talbot-dev.atcemr.com",
        localStorage: Object.entries(localStorage).map(([name, value]) => ({
          name,
          value
        }))
      }
    ]
  };

  // 8️⃣ Write final session file
  fs.writeFileSync("authState.json", JSON.stringify(fullState, null, 2));

  console.log("✅ Session saved successfully to authState.json");
}
