'use server'

import prisma from '@/lib/prisma-client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const pedidoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  telefone: z.string().min(8, 'Telefone inválido'),
  produtos: z.array(z.string().uuid()).min(1, 'Selecione ao menos um produto'),
})

export async function criarPedido(formData: FormData) {
  const produtos = formData.getAll('produtos') as string[]
  const data = { ...Object.fromEntries(formData), produtos }
  const result = pedidoSchema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Erro de validação'
    return { error: firstError }
  }

  try {
    await prisma.pedidos.create({
      data: {
        nome: result.data.nome,
        endereco: result.data.endereco,
        telefone: result.data.telefone,
        produtos: {
          connect: result.data.produtos.map((id) => ({ id })),
        },
      },
    })

    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (err) {
    console.error('Erro ao criar pedido:', err)
    return { error: 'Erro ao criar pedido' }
  }
}
export async function editarPedido(id: string, formData: FormData) {
  const produtos = formData.getAll('produtos') as string[]
  const data = { ...Object.fromEntries(formData), produtos }
  const result = pedidoSchema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Erro de validação'
    return { error: firstError }
  }

  try {
    await prisma.pedidos.update({
      where: { id },
      data: {
        nome: result.data.nome,
        endereco: result.data.endereco,
        telefone: result.data.telefone,
        produtos: {
          // limpa e reconecta produtos
          set: [],
          connect: result.data.produtos.map((id) => ({ id })),
        },
      },
    })

    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (err) {
    console.error('Erro ao editar pedido:', err)
    return { error: 'Erro ao editar pedido' }
  }
}

export async function excluirPedido(id: string) {
  try {
    await prisma.pedidos.delete({
      where: { id },
    })

    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (err) {
    console.error('Erro ao excluir pedido:', err)
    return { error: 'Erro ao excluir pedido' }
  }
}

