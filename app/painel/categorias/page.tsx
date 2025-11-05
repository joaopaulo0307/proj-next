import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma-client'
import AddCategorias from './_components/add-categorias'
import EditCategoria from './_components/edit-categoria'
import DeleteCategoria from './_components/delete-categoria'

export default async function CategoriasPage() {
  const categorias = await prisma.categorias.findMany({
    orderBy: {
      nome: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Categorias</h1>
        <AddCategorias />
      </div>

      {categorias.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-muted-foreground'>
          <p>Nenhuma categoria cadastrada</p>
          <p className="text-sm">Clique em "Adicionar Categoria" para criar sua primeira categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categorias.map(categoria => (
            <Card key={categoria.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-1 text-lg">{categoria.nome}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xs text-muted-foreground">ID: {categoria.id}</p>
              </CardContent>
              <CardFooter className='flex items-center justify-end gap-2'>
                <EditCategoria categoria={categoria} />
                <DeleteCategoria categoria={categoria} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}