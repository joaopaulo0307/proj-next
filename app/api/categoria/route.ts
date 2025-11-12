import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma-client'
import { z } from 'zod'

const categoriaSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
})

// 🔹 Listar categorias
export async function GET() {
  const categorias = await prisma.categorias.findMany({
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(categorias)
}

// 🔹 Criar categoria
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = categoriaSchema.safeParse(body)
    if (!result.success) {
      const error = result.error.issues[0]?.message ?? 'Erro de validação'
      return NextResponse.json({ error }, { status: 400 })
    }

    const nova = await prisma.categorias.create({
      data: result.data,
    })
    return NextResponse.json(nova)
  } catch (err) {
    console.error('Erro ao criar categoria:', err)
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
