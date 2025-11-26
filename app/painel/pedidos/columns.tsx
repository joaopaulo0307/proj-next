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
    cell: ({ row }) =>
      row.original.produtos
        .map((p: any) => `${p.produto.nome} (R$ ${p.produto.preco.toFixed(2)})`)
        .join(", "),
  },
  {
    id: "acoes",
    header: "Ações",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <EditPedido pedido={row.original} />
        <DeletePedido pedido={row.original} />
      </div>
    ),
  }
]