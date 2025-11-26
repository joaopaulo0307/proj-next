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
  const produtos = produtosString.split(",")

  const data = { ...Object.fromEntries(formData), produtos }
  const result = pedidoSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Erro de validação' }
  }

  try {
    await prisma.pedidos.create({
      data: {
        nome: result.data.nome,
        endereco: result.data.endereco,
        telefone: result.data.telefone,
        produtos: {
          create: result.data.produtos.map((produtoId) => ({
            produto: {
              connect: { id: produtoId }
            }
          })),
        },
      },
    })

    revalidatePath('/painel/pedidos')
    return { success: true }

  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return { error: "Erro ao criar pedido" }
  }
}

export async function editarPedido(id: string, formData: FormData) {
  const produtosString = formData.get("produtos") as string
  const produtos = produtosString.split(",")

  const data = { ...Object.fromEntries(formData), produtos }
  const result = pedidoSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Erro de validação' }
  }

  try {
   
    await prisma.pedidosProdutos.deleteMany({
      where: { pedidoId: id }
    })

    await prisma.pedidos.update({
      where: { id },
      data: {
        nome: result.data.nome,
        endereco: result.data.endereco,
        telefone: result.data.telefone,
        produtos: {
          create: result.data.produtos.map((produtoId) => ({
            produto: {
              connect: { id: produtoId }
            }
          })),
        },
      },
    })

    revalidatePath('/painel/pedidos')
    return { success: true }

  } catch (error) {
    console.error("Erro ao atualizar pedido:", error)
    return { error: "Erro ao atualizar pedido" }
  }
}

export async function excluirPedido(id: string) {
  try {
    await prisma.pedidosProdutos.deleteMany({
      where: { pedidoId: id }
    })

    await prisma.pedidos.delete({
      where: { id },
    })

    revalidatePath('/painel/pedidos')
    return { success: true }

  } catch (error) {
    console.error("Erro ao excluir pedido:", error)
    return { error: "Erro ao excluir pedido" }
  }
}
