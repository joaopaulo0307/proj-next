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

  // ✅ CORRIGIDO: Formato correto para o MultiSelectCombobox
  const [produtos, setProdutos] = useState<{ label: string; value: string }[]>([])
  
  // ✅ CORRIGIDO: Acessar o ID do produto corretamente (pode ser produtoId ou id)
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>(
    pedido.produtos.map((p: any) => p.produtoId || p.id)
  )

  // ✅ CORRIGIDO: Carregar produtos apenas quando abrir o dialog
  useEffect(() => {
    if (open) {
      fetch('/api/produtos')
        .then((res) => {
          if (!res.ok) throw new Error('Erro ao carregar produtos')
          return res.json()
        })
        .then((data) => {
          // ✅ CORRETO: Formatar para o formato esperado pelo combobox
          const formatted = data.map((p: any) => ({
            label: `${p.nome} — R$ ${Number(p.preco || 0).toFixed(2)}`,
            value: p.id
          }))
          setProdutos(formatted)
        })
        .catch(error => {
          console.error('Erro ao carregar produtos:', error)
          toast.error('Erro ao carregar produtos')
        })
    }
  }, [open])

  async function handleSubmit(formData: FormData) {
    formData.append("produtos", selectedProdutos.join(","))

    startTransition(async () => {
      const result = await editarPedido(pedido.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Pedido atualizado com sucesso!')
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
              {/* ✅ CORRETO: Usar 'options' em vez de 'items' (ou ajuste conforme seu componente) */}
              <MultiSelectCombobox
                options={produtos}
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