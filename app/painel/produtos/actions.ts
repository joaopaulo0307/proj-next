'use server'

import prisma from '@/lib/prisma-client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const produtoSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  preco: z.coerce.number().positive('O preço deve ser maior que zero'),
  descricao: z.string().optional(),
  categoriaId: z.string().uuid('Selecione uma categoria válida'),
})

export async function criarProduto(formData: FormData) {
  const data = Object.fromEntries(formData)
  const result = produtoSchema.safeParse(data)

  if (!result.success) {
 
    const firstError = result.error.issues[0]
    return { error: firstError.message }
  }

  try {
    await prisma.produtos.create({ data: result.data })
    revalidatePath('/painel/produtos')
    return { success: true }
  } catch {
    return { error: 'Erro ao criar produto' }
  }
}

export async function editarProduto(id: string, formData: FormData) {
  const data = Object.fromEntries(formData)
  const result = produtoSchema.safeParse(data)

  if (!result.success) {

    const firstError = result.error.issues[0]
    return { error: firstError.message }
  }

  try {
    await prisma.produtos.update({ where: { id }, data: result.data })
    revalidatePath('/painel/produtos')
    return { success: true }
  } catch {
    return { error: 'Erro ao editar produto' }
  }
}

export async function excluirProduto(id: string) {
  try {
    await prisma.produtos.delete({ where: { id } })
    revalidatePath('/painel/produtos')
    return { success: true }
  } catch {
    return { error: 'Erro ao excluir produto' }
  }
}


// Em actions.ts (produtos)
export async function buscarCategorias() {
  try {
    const categorias = await prisma.categorias.findMany({
      select: {
        id: true,
        nome: true
      },
      orderBy: {
        nome: 'asc'
      }
    })
    return categorias
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }
}