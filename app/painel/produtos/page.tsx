import prisma from '@/lib/prisma-client'
import AddProduto from './_components/add-produto'
import EditProduto from './_components/edit-produto'
import DeleteProduto from './_components/delete-produto'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Image } from 'lucide-react'

export default async function ProdutosPage() {
  const [produtos, categorias] = await Promise.all([
    prisma.produtos.findMany({
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    }),
    prisma.categorias.findMany({
      orderBy: { nome: 'asc' },
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os produtos do seu catálogo
          </p>
        </div>
        <AddProduto categorias={categorias} />
      </div>

      <Separator />

      {produtos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Image className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Nenhum produto cadastrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Comece adicionando produtos ao seu catálogo para que apareçam aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtos.map((produto) => (
            <Card key={produto.id} className="overflow-hidden transition-all hover:shadow-lg">
              {/* Imagem do Produto */}
              <div className="aspect-square overflow-hidden bg-muted">
                {produto.imagemUrl ? (
                  <img
                    src={produto.imagemUrl}
                    alt={produto.nome}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Image className="mx-auto h-12 w-12 mb-2" />
                      <p className="text-xs">Sem imagem</p>
                    </div>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between space-x-2">
                  <CardTitle className="text-lg leading-6 line-clamp-2 flex-1">
                    {produto.nome}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {produto.categoria.nome}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Preço</span>
                    <span className="text-lg font-bold text-primary">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                  </div>
                  
                  {produto.descricao && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Descrição</span>
                      <p className="text-sm text-foreground mt-1 line-clamp-2">
                        {produto.descricao}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <Separator />
              
              <CardFooter className="flex justify-end gap-2 pt-4">
                <EditProduto produto={produto}/>
                <DeleteProduto produto={produto} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}