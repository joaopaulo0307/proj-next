'use client'

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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useTransition } from 'react'
import { criarProduto } from '../actions'
import { toast } from 'sonner'
import { Image, Upload, X } from 'lucide-react'

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
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  async function handleSubmit(formData: FormData) {
    // Adiciona o arquivo de imagem ao FormData se existir
    if (imageFile) {
      formData.append('imagem', imageFile)
    }

    startTransition(async () => {
      const result = await criarProduto(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Produto criado com sucesso!')
        setOpen(false)
        resetForm()
        onSuccess?.()
      }
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Verifica se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem válido.')
        return
      }

      // Verifica o tamanho do arquivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB.')
        return
      }

      setImageFile(file)
      
      // Cria preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview('')
    setImageFile(null)
    // Limpa o input file
    const fileInput = document.getElementById('imagem') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const resetForm = () => {
    setImagePreview('')
    setImageFile(null)
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Adicionar Produto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>
            Cadastre um novo produto vinculado a uma categoria.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Campo de Imagem */}
            <div className="space-y-3">
              <Label htmlFor="imagem">Imagem do Produto</Label>
              
              {/* Preview da Imagem */}
              {imagePreview && (
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-lg border overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Input de Upload */}
              <div className="flex items-center gap-2">
                <Input
                  id="imagem"
                  name="imagem"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isPending}
                  className="flex-1"
                />
                {!imagePreview && (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Formatos: JPG, PNG, GIF. Tamanho máximo: 5MB
              </p>
            </div>

            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Digite o nome do produto"
                required
                disabled={isPending}
              />
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={isPending}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Digite uma descrição para o produto (opcional)"
                disabled={isPending}
                rows={3}
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoriaId">Categoria</Label>
              <Select name="categoriaId" required disabled={isPending || categorias.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {categorias.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria disponível. Crie uma categoria primeiro.
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
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Produto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}