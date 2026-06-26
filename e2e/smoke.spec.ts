import { test, expect } from '@playwright/test';

test.describe('Clínica IEQ WorkCenter - Smoke Tests', () => {
  test('should load the login page successfully', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');

    // Verify page title / main heading is visible
    const brandTitle = page.locator('text=Clínica IEQ').first();
    await expect(brandTitle).toBeVisible();

    // Verify email and password input fields exist
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify login button is present
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
  });

  test('should show validation error on invalid email formatting on client side', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid email format
    await page.locator('#email').fill('invalid-email');
    await page.locator('#password').fill('somepassword');

    // Click submit
    await page.locator('button[type="submit"]').click();

    // Verify toast or client-side error container is shown (e.g. checking for validation text)
    const errorMsg = page.locator('text=Ingrese un email corporativo válido.');
    await expect(errorMsg).toBeVisible();
  });
});
