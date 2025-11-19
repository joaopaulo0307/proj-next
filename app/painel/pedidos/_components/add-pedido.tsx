'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { criarPedido } from '../actions'
import { toast } from 'sonner'

export default function AddPedido() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [produtos, setProdutos] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    fetch('/api/produtos').then((res) => res.json()).then(setProdutos)
  }, [])

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await criarPedido(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Pedido criado com sucesso!')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo Pedido</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Pedido</DialogTitle>
          <DialogDescription>
            Preencha as informações e selecione os produtos do pedido.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome do Cliente</Label>
              <Input id="nome" name="nome" required disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" name="endereco" required disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" required disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="produtos">Produtos</Label>
              <select
                id="produtos"
                name="produtos"
                multiple
                required
                className="border rounded-md p-2 w-full h-32"
                disabled={isPending}
              >
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Segure <kbd>Ctrl</kbd> (ou <kbd>Cmd</kbd> no Mac) para selecionar múltiplos.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}