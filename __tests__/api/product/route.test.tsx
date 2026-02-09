import { GET, POST } from "../../../app/api/products/route";
import prisma from "@/lib/prisma";
import { saveFile } from "@/lib/upload";
import { NextRequest } from "next/server";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/upload", () => ({
  saveFile: jest.fn(),
}));

// Helper to create mock NextRequest
function createMockRequest(searchParams: string): NextRequest {
  return {
    nextUrl: {
      searchParams: new URLSearchParams(searchParams),
    },
  } as NextRequest;
}

// Helper to create mock Request with FormData
function createMockFormDataRequest(formData: FormData): Request {
  return {
    formData: async () => formData,
  } as Request;
}

describe("Products API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    test("should fetch products with pagination", async () => {
      const mockProducts = [
        {
          id: 1,
          name: "Product 1",
          description: "Description 1",
          image: "/uploads/image1.jpg",
          categoryId: 1,
          createdAt: new Date("2026-02-09T05:18:10.864Z").toISOString(), // Convert to string
          category: {
            id: 1,
            name: "Electronics",
          },
        },
      ];

      (prisma.product.count as jest.Mock).mockResolvedValue(10);
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const request = createMockRequest("page=1");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockProducts);
      expect(data.Pagination).toEqual({
        currentPage: 1,
        totalPage: 3,
        hasNextPage: true,
        hasPrevPage: false,
        totalItems: 10,
      });
    });

    test("should filter products by category", async () => {
      const mockProducts = [
        {
          id: 1,
          name: "Product 1",
          description: "Description 1",
          categoryId: 1,
          category: { id: 1, name: "Electronics" },
          createdAt: new Date(),
        },
      ];

      (prisma.product.count as jest.Mock).mockResolvedValue(1);
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const request = createMockRequest("page=1&categoryId=1");
      const response = await GET(request);
      const data = await response.json();

      expect(prisma.product.count).toHaveBeenCalledWith({
        where: { categoryId: 1 },
      });
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { categoryId: 1 },
        orderBy: { id: "desc" },
        include: { category: true },
        take: 4,
        skip: 0,
      });
    });

    test("should return error for invalid page number", async () => {
      const request = createMockRequest("page=0");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("page must be positive number");
    });

    test("should handle pagination boundaries correctly", async () => {
      (prisma.product.count as jest.Mock).mockResolvedValue(4);
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest("page=1");
      const response = await GET(request);
      const data = await response.json();

      expect(data.Pagination).toEqual({
        currentPage: 1,
        totalPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalItems: 4,
      });
    });
  });

  describe("POST /api/products", () => {
    test("should create product without image", async () => {
      const mockProduct = {
        id: 1,
        name: "Test Product",
        description: "Test Description",
        image: null,
        categoryId: 1,
        category: { id: 1, name: "Electronics" },
        createdAt: new Date(),
      };

      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const formData = new FormData();
      formData.append("name", "Test Product");
      formData.append("description", "Test Description");
      formData.append("categoryId", "1");

      const request = createMockFormDataRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("Test Product");
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: "Test Product",
          description: "Test Description",
          image: null,
          category: {
            connect: { id: 1 },
          },
        },
        include: { category: true },
      });
    });

    test("should create product with image", async () => {
      const mockProduct = {
        id: 1,
        name: "Test Product",
        description: "Test Description",
        image: "/uploads/test.jpg",
        categoryId: 1,
        category: { id: 1, name: "Electronics" },
        createdAt: new Date(),
      };

      (saveFile as jest.Mock).mockResolvedValue("/uploads/test.jpg");
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      // Create a mock file
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("name", "Test Product");
      formData.append("description", "Test Description");
      formData.append("categoryId", "1");
      formData.append("image", file);

      const request = createMockFormDataRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(saveFile).toHaveBeenCalledWith(file);
      expect(data.image).toBe("/uploads/test.jpg");
    });

    test("should return error when required fields are missing", async () => {
      const formData = new FormData();
      formData.append("name", "Test Product");
      // Missing description and categoryId

      const request = createMockFormDataRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Please fill in all required field");
    });
  });
});
