// app/painel/produtos/actions.ts
'use server'

import prisma from '@/lib/prisma-client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const produtoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  preco: z.number().min(0.01, 'Preço deve ser maior que zero'),
  descricao: z.string().optional(),
  categoriaId: z.string().uuid('Categoria inválida'),
})

export async function criarProduto(formData: FormData) {
  const data = {
    nome: formData.get('nome') as string,
    preco: parseFloat(formData.get('preco') as string),
    descricao: formData.get('descricao') as string,
    categoriaId: formData.get('categoriaId') as string,
  }

  const result = produtoSchema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Erro de validação'
    return { error: firstError }
  }

  try {
    await prisma.produtos.create({
      data: result.data,
    })

    revalidatePath('/painel/produtos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return { error: 'Erro interno ao criar produto' }
  }
}

export async function editarProduto(id: string, formData: FormData) {
  const data = {
    nome: formData.get('nome') as string,
    preco: parseFloat(formData.get('preco') as string),
    descricao: formData.get('descricao') as string,
    categoriaId: formData.get('categoriaId') as string,
  }

  const result = produtoSchema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Erro de validação'
    return { error: firstError }
  }

  try {
    await prisma.produtos.update({
      where: { id },
      data: result.data,
    })

    revalidatePath('/painel/produtos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao editar produto:', error)
    return { error: 'Erro interno ao editar produto' }
  }
}

export async function excluirProduto(id: string) {
  try {
    await prisma.produtos.delete({
      where: { id },
    })

    revalidatePath('/painel/produtos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return { error: 'Erro interno ao excluir produto' }
  }
}