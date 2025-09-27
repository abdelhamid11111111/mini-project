import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const {categoryName}  = await req.json();

    if (!categoryName) {
      return NextResponse.json(
        { error: "Please fill in all required field" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findFirst({
      where:{
        name: categoryName
      }
    })
    if(existingCategory){
      return NextResponse.json(
        { error: "This category already exist" },
        { status: 400 }
      );
    }

    const categoryCreated = await prisma.category.create({
      data: {
        name: categoryName
      },
    });
    return NextResponse.json(categoryCreated, { status: 201 });
  } catch (error) {
    console.error("server error", error);
    return NextResponse.json({ error: "server error POST" }, { status: 500 });
  }
}

export async function GET(){
    try{
        const categories = await prisma.category.findMany({
          orderBy: {
            id: 'desc'
          }
        })
        return NextResponse.json(categories, {status: 200})
    } catch(error){
        console.error('server error', error);
        return NextResponse.json({error: 'server error GET'}, {status: 500})
    }
}