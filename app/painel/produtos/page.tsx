import prisma from '@/lib/prisma-client'
import AddProduto from './_components/add-produto'
import EditProduto from './_components/edit-produto'
import DeleteProduto from './_components/delete-produto'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

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
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <AddProduto categorias={categorias} />
      </div>

      {produtos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-muted-foreground">
          <p>Nenhum produto cadastrado</p>
          <p className="text-sm">Clique em "Adicionar Produto" para cadastrar um novo item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtos.map((produto) => (
            <Card key={produto.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">{produto.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Preço:</strong> R$ {produto.preco.toFixed(2)}</p>
                <p><strong>Categoria:</strong> {produto.categoria.nome}</p>
                {produto.descricao && (
                  <p className="text-muted-foreground line-clamp-2">{produto.descricao}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <EditProduto produto={produto} categorias={categorias} />
                <DeleteProduto produto={produto} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}