import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma-client'
import { z } from 'zod'

const pedidoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  telefone: z.string().min(8, 'Telefone inválido'),
  produtos: z.array(z.string().uuid()).min(1, 'Selecione ao menos um produto'),
})

// 🔹 Listar pedidos
export async function GET() {
  const pedidos = await prisma.pedidos.findMany({
    include: { produtos: true },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(pedidos)
}

// 🔹 Criar pedido
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = pedidoSchema.safeParse(body)
    if (!result.success) {
      const error = result.error.issues[0]?.message ?? 'Erro de validação'
      return NextResponse.json({ error }, { status: 400 })
    }

    const novo = await prisma.pedidos.create({
      data: {
        nome: result.data.nome,
        endereco: result.data.endereco,
        telefone: result.data.telefone,
        produtos: {
          connect: result.data.produtos.map((id) => ({ id })),
        },
      },
    })

    return NextResponse.json(novo)
  } catch (err) {
    console.error('Erro ao criar pedido:', err)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
