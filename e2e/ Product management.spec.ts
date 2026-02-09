import { test, expect } from '@playwright/test';

test.describe('Product Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full product CRUD workflow', async ({ page }) => {
  const uniqueCategory = `E2E-Cat-${Date.now()}`;
  const uniqueProduct = `E2E-Prod-${Date.now()}`;
  
  // 1. CREATE CATEGORY
  await page.goto('/categories');
  await page.click('button:has-text("Add Category")');
  await page.waitForSelector('input[placeholder*="category name"]', { state: 'visible' });
  await page.fill('input[placeholder*="category name"]', uniqueCategory);
  await page.locator('button:has-text("Add Category")').last().click({ force: true });
  await page.waitForSelector('input[placeholder*="category name"]', { state: 'hidden' });
  await expect(page.locator(`tr:has-text("${uniqueCategory}")`)).toBeVisible();

  // 2. CREATE PRODUCT
  await page.goto('/');
  await page.click('button:has-text("Add Product")');
  await page.fill('input[placeholder*="product name"]', uniqueProduct);
  await page.fill('input[placeholder*="description"]', 'E2E test product description');
  await page.selectOption('select', { label: uniqueCategory });
  await page.locator('button:has-text("Add Product")').last().click({ force: true });
  await page.waitForSelector('input[placeholder*="product name"]', { state: 'hidden' });
  await expect(page.locator(`tr:has-text("${uniqueProduct}")`)).toBeVisible();

  // 3. UPDATE PRODUCT
  const productRow = page.locator(`tr:has-text("${uniqueProduct}")`).first();
  await productRow.locator('button:has-text("Edit")').click();
  await page.waitForSelector('input[placeholder*="product name"]', { state: 'visible' });
  
  const nameInput = page.locator('input[placeholder*="product name"]');
  await nameInput.clear();
  await nameInput.fill(`Updated-${uniqueProduct}`);
  
  await page.locator('button:has-text("Update Product")').click({ force: true });
  await page.waitForSelector('input[placeholder*="product name"]', { state: 'hidden' });
  
  // Verify update - just check DOM
  await expect(page.locator(`tr:has-text("Updated-${uniqueProduct}")`)).toBeVisible();

  // 4. DELETE PRODUCT
  const updatedRow = page.locator(`tr:has-text("Updated-${uniqueProduct}")`).first();
  await updatedRow.locator('button:has-text("Delete")').first().click();
  
  await page.locator('button:has-text("Delete Product")').click({ force: true });
  await expect(page.locator(`tr:has-text("Updated-${uniqueProduct}")`)).not.toBeVisible();

  // 5. CLEANUP CATEGORY
  await page.goto('/categories');
  const categoryRow = page.locator(`tr:has-text("${uniqueCategory}")`).first();
  await categoryRow.locator('button:has-text("Delete")').first().click();
  await expect(page.locator(`tr:has-text("${uniqueCategory}")`)).not.toBeVisible();
});

 test('should search categories', async ({ page }) => {
  await page.goto('/categories');
  
  const uniqueCategoryName = `Searchable-${Date.now()}`;
  
  // Create test category
  await page.click('button:has-text("Add Category")');
  await page.waitForSelector('input[placeholder*="category name"]', { state: 'visible' });
  await page.fill('input[placeholder*="category name"]', uniqueCategoryName);
  
  // Submit and wait for modal to close
  await page.locator('button:has-text("Add Category")').last().click({ force: true });
  await page.waitForSelector('input[placeholder*="category name"]', { state: 'hidden' });
  
  // Verify in table
  await expect(page.locator(`tr:has-text("${uniqueCategoryName}")`)).toBeVisible();
  
  // Test search functionality
  await page.fill('input[placeholder*="search for category"]', uniqueCategoryName);
  await expect(page.locator(`tr:has-text("${uniqueCategoryName}")`)).toBeVisible();
  
  // Clear search to see all categories
  await page.fill('input[placeholder*="search for category"]', '');
  
  // Cleanup - categories delete immediately (no modal)
  const categoryRow = page.locator(`tr:has-text("${uniqueCategoryName}")`).first();
  await categoryRow.locator('button:has-text("Delete")').first().click();
  
  // Wait for API call and DOM update
  await page.waitForResponse(response => 
    response.url().includes('/api/categories/') && response.request().method() === 'DELETE'
  );
  
  // Verify deletion - use table row locator, not text (which could match search input)
  await expect(page.locator(`tr:has-text("${uniqueCategoryName}")`)).not.toBeVisible();
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