'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useTransition } from 'react'
import { criarProduto } from '../actions'
import { toast } from 'sonner'

interface Categoria {
  id: string
  nome: string
}

interface AddProdutoProps {
  categorias: Categoria[]
  onSuccess?: () => void
}

export default function AddProduto({ categorias, onSuccess }: AddProdutoProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await criarProduto(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Produto criado com sucesso!')
        setOpen(false)
        onSuccess?.()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Produto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>Cadastre um novo produto vinculado a uma categoria.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input 
                id="nome" 
                name="nome" 
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
                disabled={isPending} 
              />
            </div>
            <div>
              <Label htmlFor="categoriaId">Categoria</Label>
              <select 
                id="categoriaId" 
                name="categoriaId" 
                className="border rounded-md p-2 w-full" 
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
                  Nenhuma categoria disponível
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
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}