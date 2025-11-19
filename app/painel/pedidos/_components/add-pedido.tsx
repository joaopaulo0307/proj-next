'use client'

import { useState, useEffect, useTransition } from 'react'
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
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox"

export default function AddPedido() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [produtos, setProdutos] = useState<{ id: string; nome: string }[]>([])
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/produtos')
      .then((res) => res.json())
      .then((data) => {
        // Ajuste correto para o formato esperado pelo combobox
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
      const result = await criarPedido(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Pedido criado com sucesso!")
        setOpen(false)
        setSelectedProdutos([])
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
              <Label>Produtos</Label>

              <MultiSelectCombobox
                options={produtos.map((p) => ({
                  label: p.nome,
                  value: p.id,
                }))}
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
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isPending}>
              Criar Pedido
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}