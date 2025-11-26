'use server'

import prisma from "@/lib/prisma-client"
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const pedidoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  telefone: z.string().min(8, 'Telefone deve ter pelo menos 8 caracteres'),
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
    // 1. Primeiro cria o pedido
    const pedido = await prisma.pedidos.create({
      data: {
        nome: result.data.nome,
        endereco: result.data.endereco,
        telefone: result.data.telefone,
      },
    })

    // 2. Depois cria as relações na tabela de junção
    if (result.data.produtos.length > 0) {
      await prisma.pedidosProdutos.createMany({
        data: result.data.produtos.map((produtoId) => ({
          pedidoId: pedido.id,
          produtoId: produtoId
        })),
        skipDuplicates: true,
      })
    }

    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return { error: 'Erro interno ao criar pedido' }
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
    await prisma.$transaction(async (tx) => {
      // 1. Deleta as relações antigas
      await tx.pedidosProdutos.deleteMany({
        where: { pedidoId: id }
      })

      // 2. Atualiza o pedido
      await tx.pedidos.update({
        where: { id },
        data: {
          nome: result.data.nome,
          endereco: result.data.endereco,
          telefone: result.data.telefone,
        },
      })

      // 3. Cria as novas relações
      if (result.data.produtos.length > 0) {
        await tx.pedidosProdutos.createMany({
          data: result.data.produtos.map((produtoId) => ({
            pedidoId: id,
            produtoId: produtoId
          })),
          skipDuplicates: true,
        })
      }
    })

    revalidatePath('/painel/pedidos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return { error: 'Erro interno ao atualizar pedido' }
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
    return { error: 'Erro interno ao excluir pedido' }
  }
}

export async function buscarPedidoComProdutos(id: string) {
  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id },
      include: {
        produtos: {
          include: {
            produto: true
          }
        }
      }
    })
    return pedido
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return null
  }
}

export async function listarPedidos() {
  try {
    const pedidos = await prisma.pedidos.findMany({
      include: {
        produtos: {
          include: {
            produto: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return pedidos
  } catch (error) {
    console.error('Erro ao listar pedidos:', error)
    return []
  }
}