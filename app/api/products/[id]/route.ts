import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveFile } from "@/lib/upload";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("server error", error);
    return NextResponse.json({ error: "server error DELETE" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fetchProduct = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
      },
    });
    return NextResponse.json(fetchProduct, { status: 200 });
  } catch (error) {
    console.error("sever error", error);
    return NextResponse.json({ error: "server error GET" }, { status: 500 });
  }
}

export async function PUT(req: Request, {params}: {params: Promise<{id: string}>}){
    try{
        const {id} = await params
        const formData = await req.formData()
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const categoryId = formData.get('categoryId') as string
        const image = formData.get('image') as File | null

        if(!name || !description || !categoryId){
            return NextResponse.json({error: 'Please fill in all required field'}, {status: 400})
        }

        const currentProduct = await prisma.product.findUnique({
          where: { id: Number(id) }
        })

        let imagePath = currentProduct?.image || ''

        if(image && image.size > 0){
          imagePath = await saveFile(image)
        }

        const ProductUpdated = await prisma.product.update({
            where: {
                id: Number(id) 
            },
            data: {
                name: name.trim(),
                description: description.trim(),
                image: imagePath || null,
                category: {
                    connect: { id: parseInt(categoryId, 10) }
                }
            },
            include: {
                category: true
            }
        })
        return NextResponse.json(ProductUpdated, {status: 201})
    } catch(error){
        console.error('server error', error);
        return NextResponse.json({error: 'server error POST'}, {status: 500})
    }
}
