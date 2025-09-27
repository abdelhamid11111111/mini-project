import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("server error", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("server error", error);
    return NextResponse.json({ error: "server error GET" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { categoryName } = await req.json();

    if (!categoryName) {
      return NextResponse.json(
        { error: "Please fill in all required field" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name: categoryName,
      },
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: "This category already exist" },
        { status: 400 }
      );
    }

    const categoryUpdated = await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name: categoryName,
      },
    });
    return NextResponse.json(categoryUpdated, { status: 201 });
  } catch (error) {
    console.error("server error", error);
    return NextResponse.json({ error: "server error PUT" }, { status: 500 });
  }
}
