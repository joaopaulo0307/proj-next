'use server'

import prisma from '@/lib/prisma-client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const pedidoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  telefone: z.string().min(8, 'Telefone deve ter pelo menos 8 dígitos'),
  produtos: z.array(z.string().uuid()).min(1, 'Selecione ao menos um produto'),
})

export async function criarPedido(formData: FormData) {
  const produtos = formData.getAll('produtos') as string[]
  const data = { 
    nome: formData.get('nome') as string,
    endereco: formData.get('endereco') as string,
    telefone: formData.get('telefone') as string,
    produtos 
  }
  
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
    return { error: 'Erro interno ao criar pedido' }
  }
}

export async function editarPedido(id: string, formData: FormData) {
  const produtos = formData.getAll('produtos') as string[]
  const data = { 
    nome: formData.get('nome') as string,
    endereco: formData.get('endereco') as string,
    telefone: formData.get('telefone') as string,
    produtos 
  }
  
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
          set: [],
          connect: result.data.produtos.map((id) => ({ id })),
        },
      },
    })

    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (err) {
    console.error('Erro ao editar pedido:', err)
    return { error: 'Erro interno ao editar pedido' }
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
    return { error: 'Erro interno ao excluir pedido' }
  }
}