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

interface Produto {
  id: string
  nome: string
  preco: number
}

export default function EditPedido({ pedido }: { pedido: any }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)

  useEffect(() => {
    if (open) {
      setCarregandoProdutos(true)
      console.log('🔄 Buscando produtos para edição...')
      
      fetch('/api/produtos')
        .then((res) => {
          if (!res.ok) throw new Error(`Erro HTTP! status: ${res.status}`)
          return res.json()
        })
        .then((data) => {
          console.log('📦 Produtos recebidos para edição:', data)
          setProdutos(data)
          setCarregandoProdutos(false)
        })
        .catch((error) => {
          console.error('❌ Erro ao carregar produtos:', error)
          toast.error('Erro ao carregar produtos')
          setCarregandoProdutos(false)
          setProdutos([])
        })
    }
  }, [open])

  async function handleSubmit(formData: FormData) {
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
      <DialogContent className="max-w-md">
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
              <Label htmlFor="produtos">Produtos</Label>
              <select
                id="produtos"
                name="produtos"
                multiple
                required
                className="border rounded-md p-2 w-full h-32 bg-white"
                disabled={isPending || carregandoProdutos}
                defaultValue={pedido.produtos.map((p: any) => p.id)}
              >
                {carregandoProdutos ? (
                  <option value="" disabled>
                    🌀 Carregando produtos...
                  </option>
                ) : produtos.length === 0 ? (
                  <option value="" disabled>
                    📭 Nenhum produto cadastrado
                  </option>
                ) : (
                  produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} - R$ {produto.preco.toFixed(2)}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Segure <kbd>Ctrl</kbd> (ou <kbd>Cmd</kbd> no Mac) para selecionar múltiplos.
              </p>
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
              disabled={isPending || carregandoProdutos || produtos.length === 0}
            >
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}