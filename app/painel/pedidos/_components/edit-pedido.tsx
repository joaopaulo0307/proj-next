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
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox"

export default function EditPedido({ pedido }: { pedido: any }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [produtos, setProdutos] = useState<{ id: string; nome: string }[]>([])
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>(
    pedido.produtos.map((p: any) => p.id)
  )

  useEffect(() => {
    fetch('/api/produtos')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((p: any) => ({
          id: p.id,
          nome: `${p.nome} — R$ ${Number(p.preco || 0).toFixed(2)}`
        }))
        setProdutos(formatted)
      })
  }, [])

  async function handleSubmit(formData: FormData) {
    formData.append("produtos", selectedProdutos.join(","))

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
          <DialogDescription>
            Atualize as informações do pedido.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome do Cliente</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={pedido.nome}
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                name="endereco"
                defaultValue={pedido.endereco}
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                defaultValue={pedido.telefone}
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label>Produtos</Label>

              <MultiSelectCombobox
                items={produtos}
                value={selectedProdutos}
                onChange={setSelectedProdutos}
                placeholder="Selecione os produtos"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
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