'use client'

import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<any>[] = [
  { accessorKey: "nome", header: "Cliente" },
  { accessorKey: "endereco", header: "Endereço" },
  { accessorKey: "telefone", header: "Telefone" },
  {
    id: "produtos",
    header: "Produtos",
    cell: ({ row }) => row.original.produtos.map((p: any) => p.nome).join(", "),
  },
]
