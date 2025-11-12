import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma-client'
import { z } from 'zod'

const produtoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  preco: z.coerce.number().positive('Preço inválido'),
  categoriaId: z.string().uuid('Categoria inválida'),
})

// 🔹 Listar produtos
export async function GET() {
  const produtos = await prisma.produtos.findMany({
    include: { categoria: true },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(produtos)
}

// 🔹 Criar produto
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = produtoSchema.safeParse(body)
    if (!result.success) {
      const error = result.error.issues[0]?.message ?? 'Erro de validação'
      return NextResponse.json({ error }, { status: 400 })
    }

    const novo = await prisma.produtos.create({
      data: result.data,
    })
    return NextResponse.json(novo)
  } catch (err) {
    console.error('Erro ao criar produto:', err)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
