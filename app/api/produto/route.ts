import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma-client'

export async function GET() {
  try {
    const produtos = await prisma.produtos.findMany({
      select: {
        id: true,
        nome: true,
        preco: true,
      },
      orderBy: {
        nome: 'asc'
      }
    })
    
    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}