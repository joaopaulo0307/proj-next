import prisma from '@/lib/prisma-client'
import { columns } from './columns'
import { DataTable } from '@/components/ui/data-table'
import AddPedido from './_components/add-pedido'

export default async function PedidosPage() {
  const pedidos = await prisma.pedidos.findMany({
    include: { produtos: true },
    orderBy: { nome: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <AddPedido />
      </div>
      <DataTable columns={columns} data={pedidos} />
    </div>
  )
}
