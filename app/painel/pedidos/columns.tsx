'use client'

import { ColumnDef } from "@tanstack/react-table"
import EditPedido from "./_components/edit-pedido"
import DeletePedido from "./_components/delete-pedido"

export const columns: ColumnDef<any>[] = [
  { accessorKey: "nome", header: "Cliente" },
  { accessorKey: "endereco", header: "Endereço" },
  { accessorKey: "telefone", header: "Telefone" },
  {
    id: "produtos",
    header: "Produtos",
    cell: ({ row }) => row.original.produtos.map((p: any) => p.nome).join(", "),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <EditPedido pedido={row.original} />
        <DeletePedido pedido={row.original} />
      </div>
    ),
  },
]