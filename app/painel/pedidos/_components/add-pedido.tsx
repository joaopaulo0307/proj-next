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

interface Produto {
  id: string
  nome: string
  preco: number
}

export default function AddPedido() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregandoProdutos, setCarregandoProdutos] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState('')

  // ✅ CORREÇÃO: Carrega produtos quando abre o dialog
  useEffect(() => {
    if (open) {
      setCarregandoProdutos(true)
      setErroCarregamento('')
      
      console.log('🔄 Buscando produtos...')
      
      fetch('/api/produtos')
        .then((res) => {
          console.log('📡 Status da API:', res.status)
          if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`)
          return res.json()
        })
        .then((data) => {
          console.log('📦 Produtos recebidos:', data)
          setProdutos(data)
          setCarregandoProdutos(false)
        })
        .catch((error) => {
          console.error('❌ Erro ao carregar produtos:', error)
          setErroCarregamento('Erro ao carregar produtos')
          setCarregandoProdutos(false)
          toast.error('Erro ao carregar produtos')
        })
    }
  }, [open]) // ✅ Recarrega sempre que abre

   async function handleSubmit(formData: FormData) {
    // ✅ DEBUG: Verifique o que está sendo enviado
    const produtosSelecionados = formData.getAll('produtos')
    const nome = formData.get('nome')
    const endereco = formData.get('endereco')
    const telefone = formData.get('telefone')
    
    console.log('🎯 Dados do formulário:')
    console.log('Nome:', nome)
    console.log('Endereço:', endereco)
    console.log('Telefone:', telefone)
    console.log('Produtos selecionados:', produtosSelecionados)
    console.log('Quantidade de produtos:', produtosSelecionados.length)

    startTransition(async () => {
      const result = await criarPedido(formData)
      console.log('📋 Resultado da criação:', result)
      
      if (result.error) {
        toast.error(result.error)
      } else {
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
              <Input 
                id="nome" 
                name="nome" 
                required 
                disabled={isPending}
                placeholder="Digite o nome do cliente"
              />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input 
                id="endereco" 
                name="endereco" 
                required 
                disabled={isPending}
                placeholder="Digite o endereço completo"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input 
                id="telefone" 
                name="telefone" 
                required 
                disabled={isPending}
                placeholder="(11) 99999-9999"
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
              >
                {carregandoProdutos ? (
                  <option value="" disabled>
                    🌀 Carregando produtos...
                  </option>
                ) : erroCarregamento ? (
                  <option value="" disabled>
                    ❌ {erroCarregamento}
                  </option>
                ) : produtos.length === 0 ? (
                  <option value="" disabled>
                    📭 Nenhum produto cadastrado
                  </option>
                ) : (
                  produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} - R$ {produto.preco?.toFixed(2) || '0.00'}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Segure <kbd>Ctrl</kbd> (ou <kbd>Cmd</kbd> no Mac) para selecionar múltiplos produtos.
              </p>
              
              {/* ✅ Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1">
                  Produtos carregados: {produtos.length} | 
                  Carregando: {carregandoProdutos.toString()} | 
                  Erro: {erroCarregamento || 'Nenhum'}
                </div>
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
              disabled={isPending || carregandoProdutos || produtos.length === 0}
            >
              {isPending ? 'Criando...' : 'Criar Pedido'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}