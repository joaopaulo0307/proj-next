'use server'

import prisma from '@delivery/db'
import { revalidatePath } from 'next/cache'

export async function criarCategoria(formData: FormData) {
  const nome = formData.get('nome') as string

  if (!nome || nome.trim() === '') {
    return { error: 'Nome da categoria é obrigatório' }
  }

  try {
    await prisma.categorias.create({
      data: {
        nome: nome.trim(),
      },
    })

    revalidatePath('/painel/categorias')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return { error: 'Erro ao criar categoria' }
  }
}

export async function editarCategoria(id: string, formData: FormData) {
  const nome = formData.get('nome') as string

  if (!nome || nome.trim() === '') {
    return { error: 'Nome da categoria é obrigatório' }
  }

  try {
    await prisma.categorias.update({
      where: { id },
      data: {
        nome: nome.trim(),
      },
    })

    revalidatePath('/painel/categorias')
    return { success: true }
  } catch (error) {
    console.error('Erro ao editar categoria:', error)
    return { error: 'Erro ao editar categoria' }
  }
}

export async function excluirCategoria(id: string) {
  try {
    await prisma.categorias.delete({
      where: { id },
    })

    revalidatePath('/painel/categorias')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return { error: 'Erro ao excluir categoria' }
  }
}