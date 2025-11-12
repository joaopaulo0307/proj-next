'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useTransition, useEffect } from 'react'
import { criarProduto } from '../actions'
import { toast } from 'sonner'

export default function AddProduto() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    fetch('/api/categorias').then(res => res.json()).then(setCategorias)
  }, [])

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await criarProduto(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Produto criado com sucesso!')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Adicionar Produto</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>Cadastre um novo produto vinculado a uma categoria.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" required disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="preco">Preço</Label>
              <Input id="preco" name="preco" type="number" step="0.01" required disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" name="descricao" placeholder="Opcional" disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="categoriaId">Categoria</Label>
              <select id="categoriaId" name="categoriaId" className="border rounded-md p-2 w-full" required disabled={isPending}>
                <option value="">Selecione</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
