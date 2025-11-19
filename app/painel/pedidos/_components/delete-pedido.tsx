'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { excluirPedido } from '../actions'
import { toast } from 'sonner'
import { useTransition } from 'react'

export default function DeletePedido({ pedido }: { pedido: any }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await excluirPedido(pedido.id)
      if (result.error) toast.error(result.error)
      else toast.success('Pedido excluído com sucesso!')
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Excluir</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Pedido</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o pedido de <strong>{pedido.nome}</strong>?
            Esta ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}