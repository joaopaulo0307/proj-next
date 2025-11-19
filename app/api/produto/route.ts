import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma-client"

export async function GET() {
  try {
    const produtos = await prisma.produtos.findMany({
      orderBy: { nome: 'asc' },
      include: {
        categoria: true,
      },
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}