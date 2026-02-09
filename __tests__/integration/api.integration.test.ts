/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST as createProduct, GET as getProducts } from '@/app/api/products/route';
import { DELETE as deleteProduct, PUT as updateProduct } from '@/app/api/products/[id]/route';
import { POST as createCategory } from '@/app/api/categories/route';
import prisma from '@/lib/prisma';

// Helper function to create mock requests
const createMockRequest = (url: string, options?: { method?: string; body?: unknown }) => {
  const parsedUrl = new URL(url);
  return {
    method: options?.method || 'GET',
    url: url,
    nextUrl: {
      searchParams: parsedUrl.searchParams,
    },
    json: async () => options?.body || {},
    formData: async () => (options?.body instanceof FormData ? options.body : new FormData()),
  } as any;
};

describe('Product CRUD Integration Tests', () => {
  let testCategoryId: number;
  let testProductId: number;

  beforeAll(async () => {
    // Create a test category directly with Prisma
    const category = await prisma.category.create({
      data: { name: 'Test Integration Category' },
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.product.deleteMany({
      where: { categoryId: testCategoryId },
    });
    await prisma.category.delete({
      where: { id: testCategoryId },
    });
    await prisma.$disconnect();
  });

  describe('Full CRUD Flow', () => {
    test('should create, read, update, and delete a product', async () => {
      // 1. CREATE
      const formData = new FormData();
      formData.append('name', 'Integration Test Product');
      formData.append('description', 'This is a test product');
      formData.append('categoryId', testCategoryId.toString());

      const createRequest = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData,
      });

      const createResponse = await createProduct(createRequest);
      const createdProduct = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createdProduct.name).toBe('Integration Test Product');
      expect(createdProduct.categoryId).toBe(testCategoryId);

      testProductId = createdProduct.id;

      // 2. READ
      const getRequest = createMockRequest('http://localhost:3000/api/products?page=1');
      const getResponse = await getProducts(getRequest);
      const { data: products } = await getResponse.json();

      const foundProduct = products.find((p: { id: number }) => p.id === testProductId);
      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe('Integration Test Product');

      // 3. UPDATE
      const updateFormData = new FormData();
      updateFormData.append('name', 'Updated Product Name');
      updateFormData.append('description', 'Updated description');
      updateFormData.append('categoryId', testCategoryId.toString());

      const updateRequest = createMockRequest(
        `http://localhost:3000/api/products/${testProductId}`,
        {
          method: 'PUT',
          body: updateFormData,
        }
      );

      const updateResponse = await updateProduct(
        updateRequest,
        { params: Promise.resolve({ id: testProductId.toString() }) }
      );
      const updatedProduct = await updateResponse.json();

      expect(updateResponse.status).toBe(201);
      expect(updatedProduct.name).toBe('Updated Product Name');
      expect(updatedProduct.description).toBe('Updated description');

      // 4. DELETE
      const deleteRequest = createMockRequest(
        `http://localhost:3000/api/products/${testProductId}`,
        { method: 'DELETE' }
      );

      const deleteResponse = await deleteProduct(
        deleteRequest,
        { params: Promise.resolve({ id: testProductId.toString() }) }
      );

      expect(deleteResponse.status).toBe(200);

      // Verify deletion
      const verifyProduct = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(verifyProduct).toBeNull();
    });
  });

  describe('Business Logic Validation', () => {
    test('should enforce required fields', async () => {
      const formData = new FormData();
      formData.append('name', 'Product Without Description');
      // Missing description and categoryId

      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData,
      });

      const response = await createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please fill in all required field');
    });

    test('should trim whitespace from inputs', async () => {
      const formData = new FormData();
      formData.append('name', '  Whitespace Product  ');
      formData.append('description', '  Whitespace Description  ');
      formData.append('categoryId', testCategoryId.toString());

      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData,
      });

      const response = await createProduct(request);
      const product = await response.json();

      expect(product.name).toBe('Whitespace Product');
      expect(product.description).toBe('Whitespace Description');

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } });
    });
  });

  describe('Pagination Logic', () => {
    let paginationCategoryId: number;

    beforeAll(async () => {
      // Create a separate category for pagination tests
      const paginationCategory = await prisma.category.create({
        data: { name: 'Pagination Test Category' },
      });
      paginationCategoryId = paginationCategory.id;

      // Create 10 test products
      for (let i = 1; i <= 10; i++) {
        await prisma.product.create({
          data: {
            name: `Pagination Test Product ${i}`,
            description: `Description ${i}`,
            categoryId: paginationCategoryId,
          },
        });
      }
    });

    afterAll(async () => {
      // Cleanup pagination test products and category
      await prisma.product.deleteMany({
        where: {
          categoryId: paginationCategoryId,
        },
      });
      await prisma.category.delete({
        where: { id: paginationCategoryId },
      });
    });

    test('should paginate results correctly', async () => {
      // Page 1
      const page1Request = createMockRequest('http://localhost:3000/api/products?page=1');
      const page1Response = await getProducts(page1Request);
      const page1Data = await page1Response.json();

      expect(page1Data.data.length).toBeLessThanOrEqual(4); // ITEMS_PER_PAGE = 4
      expect(page1Data.Pagination.currentPage).toBe(1);

      // Page 2
      const page2Request = createMockRequest('http://localhost:3000/api/products?page=2');
      const page2Response = await getProducts(page2Request);
      const page2Data = await page2Response.json();

      expect(page2Data.data.length).toBeLessThanOrEqual(4);
      expect(page2Data.Pagination.currentPage).toBe(2);
    });

    test('should filter by category', async () => {
      const request = createMockRequest(
        `http://localhost:3000/api/products?page=1&categoryId=${paginationCategoryId}`
      );
      const response = await getProducts(request);
      const data = await response.json();

      // All products should belong to paginationCategoryId
      data.data.forEach((product: { categoryId: number | string }) => {
        expect(product.categoryId).toBe(paginationCategoryId);
      });
    });
  });
});