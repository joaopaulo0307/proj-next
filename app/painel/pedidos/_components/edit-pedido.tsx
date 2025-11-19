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
import { editarPedido } from '../actions'
import { toast } from 'sonner'

export default function EditPedido({ pedido }: { pedido: any }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [produtos, setProdutos] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    fetch('/api/produtos').then((res) => res.json()).then(setProdutos)
  }, [])

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await editarPedido(pedido.id, formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Pedido atualizado!')
        setOpen(false)
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
          <DialogTitle>Editar Pedido</DialogTitle>
          <DialogDescription>Atualize as informações do pedido.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome do Cliente</Label>
              <Input id="nome" name="nome" defaultValue={pedido.nome} required disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" name="endereco" defaultValue={pedido.endereco} required disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" defaultValue={pedido.telefone} required disabled={isPending} />
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
                defaultValue={pedido.produtos.map((p: any) => p.id)}
              >
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}