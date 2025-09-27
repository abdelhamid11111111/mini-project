import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";



export async function POST(req: Request){
    try{
        const { form } = await req.json()

        if(!form || !form.name || !form.description || !form.categoryId){
            return NextResponse.json({error: 'Please fill in all required field'}, {status: 400})
        }

        const ProductCreated = await prisma.product.create({
            data: {
                name: form.name.trim(),
                description: form.description.trim(),
                category: {
                    connect: { id: parseInt(form.categoryId, 10) }
                }
            },
            include: {
                category: true
            }
        })
        return NextResponse.json(ProductCreated, {status: 201})
    } catch(error){
        console.error('server error', error);
        return NextResponse.json({error: 'server error POST'}, {status: 500})
    }
}

export async function GET(){
    try{
        const products = await prisma.product.findMany({
            orderBy: {
                id: 'desc'
            },
            include: {
                category: true
            }
        })
        return NextResponse.json(products, {status: 200})
    } catch(error){
        console.error('server error', error);
        return NextResponse.json({error: 'server error GET'}, {status: 500})
    }
}