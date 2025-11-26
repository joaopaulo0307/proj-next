'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useTransition, useEffect } from 'react'
import { editarProduto, buscarCategorias } from '../actions'
import { toast } from 'sonner'

interface Produto {
  id: string
  nome: string
  preco: number
  descricao: string | null
  categoriaId: string
}

interface EditProdutoProps {
  produto: Produto
  onSuccess?: () => void
}

interface EditProdutoProps {
  produto: Produto
  categorias: { id: string; nome: string }[] // ← Adicione esta linha
  onSuccess?: () => void
}

export default function EditProduto({ produto, onSuccess }: EditProdutoProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const categoriasData = await buscarCategorias()
        setCategorias(categoriasData)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        toast.error('Erro ao carregar categorias')
      }
    }

    if (open) {
      carregarCategorias()
    }
  }, [open])

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await editarProduto(produto.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Produto atualizado com sucesso!')
        setOpen(false)
        onSuccess?.()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Editar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>Atualize as informações do produto.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input 
                id="nome" 
                name="nome" 
                defaultValue={produto.nome}
                required 
                disabled={isPending} 
              />
            </div>
            <div>
              <Label htmlFor="preco">Preço</Label>
              <Input 
                id="preco" 
                name="preco" 
                type="number" 
                step="0.01" 
                defaultValue={produto.preco}
                required 
                disabled={isPending} 
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input 
                id="descricao" 
                name="descricao" 
                placeholder="Opcional" 
                defaultValue={produto.descricao || ''}
                disabled={isPending} 
              />
            </div>
            <div>
              <Label htmlFor="categoriaId">Categoria</Label>
              <select 
                id="categoriaId" 
                name="categoriaId" 
                className="border rounded-md p-2 w-full" 
                defaultValue={produto.categoriaId}
                required 
                disabled={isPending || categorias.length === 0}
              >
                <option value="">Selecione</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {categorias.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Carregando categorias...
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || categorias.length === 0}
            >
              {isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}