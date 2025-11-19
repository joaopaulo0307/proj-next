'use server'

import prisma from "@/lib/prisma-client"
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const pedidoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  telefone: z.string().min(8, 'Telefone inválido'),
  produtos: z.array(z.string().uuid()).min(1, 'Selecione ao menos um produto'),
})

export async function criarPedido(formData: FormData) {
  const produtosString = formData.get("produtos") as string
  const produtos = produtosString ? produtosString.split(",").filter(Boolean) : []

  const data = { 
    nome: formData.get("nome") as string,
    endereco: formData.get("endereco") as string,
    telefone: formData.get("telefone") as string,
    produtos 
  }
  
  const result = pedidoSchema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || 'Erro de validação'
    return { error: firstError }
  }

  try {
    await prisma.pedidos.create({
      data: {
        nome: result.data.nome,
        endereco: result.data.endereco,
        telefone: result.data.telefone,
        produtos: {
          create: result.data.produtos.map((produtoId) => ({
            produtoId: produtoId // ✅ CORRETO para seu schema
          })),
        },
      },
    })
    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return { error: 'Erro ao criar pedido' }
  }
}

export async function editarPedido(id: string, formData: FormData) {
  const produtosString = formData.get("produtos") as string
  const produtos = produtosString ? produtosString.split(",").filter(Boolean) : []

  const data = { 
    nome: formData.get("nome") as string,
    endereco: formData.get("endereco") as string,
    telefone: formData.get("telefone") as string,
    produtos 
  }
  
  const result = pedidoSchema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || 'Erro de validação'
    return { error: firstError }
  }

  try {
    // Usar transaction para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Deleta as relações antigas
      await tx.pedidosProdutos.deleteMany({
        where: { pedidoId: id }
      })

      // Atualiza o pedido e cria novas relações
      await tx.pedidos.update({
        where: { id },
        data: {
          nome: result.data.nome,
          endereco: result.data.endereco,
          telefone: result.data.telefone,
          produtos: {
            create: result.data.produtos.map((produtoId) => ({
              produtoId: produtoId // ✅ CORRETO para seu schema
            })),
          },
        },
      })
    })

    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return { error: 'Erro ao atualizar pedido' }
  }
}

export async function excluirPedido(id: string) {
  try {
    await prisma.pedidos.delete({
      where: { id },
    })
    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir pedido:', error)
    return { error: 'Erro ao excluir pedido' }
  }
}