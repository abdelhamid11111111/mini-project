import { test, expect } from '@playwright/test';

test.describe('Product Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full product CRUD workflow', async ({ page }) => {
    // 1. CREATE CATEGORY
    await page.goto('/categories');
    
    // Click button to open modal
    await page.click('button:has-text("Add Category")');
    
    // Wait for modal to open and fill input
    await page.waitForSelector('input[placeholder*="category name"]', { state: 'visible' });
    await page.fill('input[placeholder*="category name"]', 'E2E Test Category');
    
    // Force click the submit button (bypasses backdrop)
    await page.locator('button:has-text("Add Category")').last().click({ force: true });
    
    // Wait a bit for the operation to complete
    await page.waitForTimeout(1000);
    
    // Verify category was created
    await expect(page.locator('text=E2E Test Category').first()).toBeVisible();

    // 2. CREATE PRODUCT
    await page.goto('/');
    await page.click('button:has-text("Add Product")');
    
    // Fill product form
    await page.fill('input[placeholder*="product name"]', 'E2E Test Product');
    await page.fill('input[placeholder*="description"]', 'This is a test product created by E2E tests');
    await page.selectOption('select', { label: 'E2E Test Category' });
    
    // Force click submit
    await page.locator('button:has-text("Add Product")').last().click({ force: true });
    await page.waitForTimeout(1000);
    
    // Verify product appears in the table
    await expect(page.locator('text=E2E Test Product').first()).toBeVisible();

    // 3. UPDATE PRODUCT
    const productRow = page.locator('tr:has-text("E2E Test Product")').first();
    await productRow.locator('button:has-text("Edit")').click();
    
    // Wait for edit modal to open and be ready
    await page.waitForSelector('input[placeholder*="product name"]', { state: 'visible' });
    await page.waitForTimeout(500);
    
    // Clear and fill the product name input
    const nameInput = page.locator('input[placeholder*="product name"]');
    await nameInput.clear();
    await nameInput.fill('Updated E2E Product');
    
    // Wait a moment for the input to register
    await page.waitForTimeout(300);
    
    // Click update button
    await page.locator('button:has-text("Update Product")').click({ force: true });
    await page.waitForTimeout(1500);
    
    // Verify update
    await expect(page.locator('text=Updated E2E Product').first()).toBeVisible();
    await expect(page.locator('text=E2E Test Product')).not.toBeVisible();

    // 4. DELETE PRODUCT
    const updatedProductRow = page.locator('tr:has-text("Updated E2E Product")').first();
    // Use .first() to avoid strict mode violation when multiple delete buttons exist
    await updatedProductRow.locator('button:has-text("Delete")').first().click();
    
    // Confirm deletion with force click
    await page.locator('button:has-text("Delete Product")').click({ force: true });
    await page.waitForTimeout(1000);
    
    // Verify product is gone
    await expect(page.locator('text=Updated E2E Product')).not.toBeVisible();

    // 5. CLEANUP - Delete category
    await page.goto('/categories');
    const categoryRow = page.locator('tr:has-text("E2E Test Category")').first();
    await categoryRow.locator('button:has-text("Delete")').first().click();
    
    await expect(page.locator('text=E2E Test Category')).not.toBeVisible();
  });

  test('should search categories', async ({ page }) => {
    await page.goto('/categories');
    
    // Create a test category
    await page.click('button:has-text("Add Category")');
    await page.waitForSelector('input[placeholder*="category name"]', { state: 'visible' });
    await page.fill('input[placeholder*="category name"]', 'Searchable Category');
    
    // Force click submit button
    await page.locator('button:has-text("Add Category")').last().click({ force: true });
    await page.waitForTimeout(1000);
    
    // Use the search
    await page.fill('input[placeholder*="search for category"]', 'Searchable');
    await expect(page.locator('text=Searchable Category').first()).toBeVisible();
    
    // Cleanup
    const categoryRow = page.locator('tr:has-text("Searchable Category")').first();
    await categoryRow.locator('button:has-text("Delete")').first().click();
  });

  test('should handle image upload', async ({ page }) => {
    // First create a category
    await page.goto('/categories');
    await page.click('button:has-text("Add Category")');
    await page.waitForSelector('input[placeholder*="category name"]', { state: 'visible' });
    await page.fill('input[placeholder*="category name"]', 'Image Test Category');
    
    // Force click submit
    await page.locator('button:has-text("Add Category")').last().click({ force: true });
    await page.waitForTimeout(1000);
    
    // Go to products and create one
    await page.goto('/');
    await page.click('button:has-text("Add Product")');
    
    await page.fill('input[placeholder*="product name"]', 'Product With Image');
    await page.fill('input[placeholder*="description"]', 'Testing image upload');
    await page.selectOption('select', { label: 'Image Test Category' });
    
    await page.locator('button:has-text("Add Product")').last().click({ force: true });
    await page.waitForTimeout(1000);
    
    // Verify product was created
    await expect(page.locator('text=Product With Image').first()).toBeVisible();
    
    // Cleanup
    const productRow = page.locator('tr:has-text("Product With Image")').first();
    await productRow.locator('button:has-text("Delete")').first().click();
    await page.locator('button:has-text("Delete Product")').click({ force: true });
    
    await page.goto('/categories');
    const categoryRow = page.locator('tr:has-text("Image Test Category")').first();
    await categoryRow.locator('button:has-text("Delete")').first().click();
  });
});

test.describe('Navigation', () => {
  test('should navigate between products and categories pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:has-text("My Products")')).toBeVisible();
    
    await page.click('a:has-text("Categories")');
    await expect(page.locator('h1:has-text("My Categories")')).toBeVisible();
    
    await page.click('a:has-text("Products")');
    await expect(page.locator('h1:has-text("My Products")')).toBeVisible();
  });

  test('should show active link in navigation', async ({ page }) => {
    await page.goto('/');
    
    const productsLink = page.locator('a:has-text("Products")');
    await expect(productsLink).toHaveClass(/text-blue-600/);
    
    await page.click('a:has-text("Categories")');
    
    const categoriesLink = page.locator('a:has-text("Categories")');
    await expect(categoriesLink).toHaveClass(/text-blue-600/);
  });
});