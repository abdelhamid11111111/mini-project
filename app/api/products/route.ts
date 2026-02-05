import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveFile } from "@/lib/upload";

const ITEMS_PER_PAGE = 4;

export async function GET(req: NextRequest) {
  try {
    // extract page number form query in url
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");

    // extract category id form query in url
    const categoryId = searchParams.get("categoryId");

    if (page < 1) {
      return NextResponse.json(
        { error: "page must be positive number" },
        { status: 400 },
      );
    }

    const offset = (page - 1) * ITEMS_PER_PAGE;

    // build condition
    const categoryCondition =
      categoryId && categoryId !== "0"
        ? { categoryId: parseInt(categoryId) }
        : {};

    // Count total items with filter applied
    const totalItems = await prisma.product.count({
      where: categoryCondition
    });

    // Fetch products with filter applied
    const products = await prisma.product.findMany({
      where: categoryCondition,
      orderBy: {
        id: "desc",
      },
      include: {
        category: true,
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    const totalPage = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const hasNextPage = page < totalPage;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        data: products,
        Pagination: {
          currentPage: page,
          totalPage: totalPage,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
          totalItems: totalItems,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("server error", error);
    return NextResponse.json({ error: "server error GET" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // use formDate() instead of json()
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const image = formData.get("image") as File | null;

    if (!formData || !name || !description || !categoryId) {
      return NextResponse.json(
        { error: "Please fill in all required field" },
        { status: 400 },
      );
    }

    let imagePath = "";

    // check if image exist & is it hv size then save it in specific path
    if (image && image.size > 0) {
      imagePath = await saveFile(image); // get path from the func
    }

    const ProductCreated = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        image: imagePath || null, // should create it as path
        category: {
          connect: { id: parseInt(categoryId, 10) },
        },
      },
      include: {
        category: true,
      },
    });
    return NextResponse.json(ProductCreated, { status: 201 });
  } catch (error) {
    console.error("server error", error);
    return NextResponse.json({ error: "server error POST" }, { status: 500 });
  }
}
