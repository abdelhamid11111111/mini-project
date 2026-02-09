import { POST, GET } from '../../../app/api/categories/route';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('Categories API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/categories', () => {
    test('should create a new category successfully', async () => {
      const mockCategory = { id: 1, name: 'Electronics' };
      
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.category.create as jest.Mock).mockResolvedValue(mockCategory);

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({ categoryName: 'Electronics' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Electronics' },
      });
    });

    test('should return error when category name is empty', async () => {
      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({ categoryName: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please fill in all required field');
    });

    test('should return error when category already exists', async () => {
      const existingCategory = { id: 1, name: 'Electronics' };
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(existingCategory);

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({ categoryName: 'Electronics' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('This category already exist');
    });

    test('should handle server errors', async () => {
      (prisma.category.findFirst as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({ categoryName: 'Electronics' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('server error POST');
    });
  });

  describe('GET /api/categories', () => {
    test('should fetch all categories in descending order', async () => {
      const mockCategories = [
        { id: 2, name: 'Books' },
        { id: 1, name: 'Electronics' },
      ];

      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCategories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
      });
    });

    test('should handle errors when fetching categories', async () => {
      (prisma.category.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('server error GET');
    });
  });
});