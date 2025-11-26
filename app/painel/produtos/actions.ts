'use server'

import prisma from '@/lib/prisma-client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { unlink } from 'fs/promises'

// Schema atualizado com imagem
const produtoSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  preco: z.coerce.number().positive('O preço deve ser maior que zero'),
  descricao: z.string().optional(),
  categoriaId: z.string().uuid('Selecione uma categoria válida'),
  imagemUrl: z.string().optional().nullable(),
})

// Schema para validação sem imagem (usado no parse)
const produtoSchemaSemImagem = produtoSchema.omit({ imagemUrl: true })

export async function criarProduto(formData: FormData) {
  try {
    // Extrai dados do formData
    const data = {
      nome: formData.get('nome') as string,
      preco: formData.get('preco') as string,
      descricao: formData.get('descricao') as string,
      categoriaId: formData.get('categoriaId') as string,
    }

    // Valida dados básicos
    const result = produtoSchemaSemImagem.safeParse(data)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return { error: firstError.message }
    }

    let imagemUrl: string | null = null

    // Processa a imagem se foi enviada
    const imagem = formData.get('imagem') as File
    if (imagem && imagem.size > 0) {
      // Validações da imagem
      if (!imagem.type.startsWith('image/')) {
        return { error: 'O arquivo deve ser uma imagem válida' }
      }

      if (imagem.size > 5 * 1024 * 1024) {
        return { error: 'A imagem deve ter no máximo 5MB' }
      }

      try {
        // Converte a imagem para buffer
        const bytes = await imagem.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Cria nome único para o arquivo
        const timestamp = Date.now()
        const extension = imagem.name.split('.').pop() || 'jpg'
        const filename = `produto-${timestamp}.${extension}`
        
        // Define o caminho onde salvar
        const uploadDir = join(process.cwd(), 'public/uploads')
        const filepath = join(uploadDir, filename)
        
        // Salva o arquivo
        await writeFile(filepath, buffer)
        
        // Define a URL para acessar a imagem
        imagemUrl = `/uploads/${filename}`
      } catch (error) {
        console.error('Erro ao salvar imagem:', error)
        return { error: 'Erro ao processar a imagem' }
      }
    }

    // Cria o produto no banco
    await prisma.produtos.create({
      data: {
        ...result.data,
        imagemUrl,
      },
    })

    revalidatePath('/painel/produtos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return { error: 'Erro interno ao criar produto' }
  }
}

export async function editarProduto(id: string, formData: FormData) {
  try {
    // Extrai dados do formData
    const data = {
      nome: formData.get('nome') as string,
      preco: formData.get('preco') as string,
      descricao: formData.get('descricao') as string,
      categoriaId: formData.get('categoriaId') as string,
    }

    // Valida dados básicos
    const result = produtoSchemaSemImagem.safeParse(data)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return { error: firstError.message }
    }

    // Busca produto atual para verificar se tem imagem antiga
    const produtoAtual = await prisma.produtos.findUnique({
      where: { id },
      select: { imagemUrl: true }
    })

    let imagemUrl: string | null = produtoAtual?.imagemUrl || null

    // Processa a nova imagem se foi enviada
    const imagem = formData.get('imagem') as File
    if (imagem && imagem.size > 0) {
      // Validações da imagem
      if (!imagem.type.startsWith('image/')) {
        return { error: 'O arquivo deve ser uma imagem válida' }
      }

      if (imagem.size > 5 * 1024 * 1024) {
        return { error: 'A imagem deve ter no máximo 5MB' }
      }

      try {
        // Remove imagem antiga se existir
        if (produtoAtual?.imagemUrl) {
          const oldImagePath = join(process.cwd(), 'public', produtoAtual.imagemUrl)
          try {
            await unlink(oldImagePath)
          } catch (error) {
            console.warn('Não foi possível remover imagem antiga:', error)
          }
        }

        // Converte a nova imagem para buffer
        const bytes = await imagem.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Cria nome único para o arquivo
        const timestamp = Date.now()
        const extension = imagem.name.split('.').pop() || 'jpg'
        const filename = `produto-${timestamp}.${extension}`
        
        // Define o caminho onde salvar
        const uploadDir = join(process.cwd(), 'public/uploads')
        const filepath = join(uploadDir, filename)
        
        // Salva o arquivo
        await writeFile(filepath, buffer)
        
        // Define a URL para acessar a imagem
        imagemUrl = `/uploads/${filename}`
      } catch (error) {
        console.error('Erro ao salvar imagem:', error)
        return { error: 'Erro ao processar a imagem' }
      }
    }

    // Atualiza o produto no banco
    await prisma.produtos.update({
      where: { id },
      data: {
        ...result.data,
        imagemUrl,
      },
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
    // Busca produto para remover imagem se existir
    const produto = await prisma.produtos.findUnique({
      where: { id },
      select: { imagemUrl: true }
    })

    // Remove a imagem do sistema de arquivos se existir
    if (produto?.imagemUrl) {
      const imagePath = join(process.cwd(), 'public', produto.imagemUrl)
      try {
        await unlink(imagePath)
      } catch (error) {
        console.warn('Não foi possível remover imagem:', error)
      }
    }

    // Exclui o produto do banco
    await prisma.produtos.delete({ where: { id } })
    revalidatePath('/painel/produtos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return { error: 'Erro interno ao excluir produto' }
  }
}

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