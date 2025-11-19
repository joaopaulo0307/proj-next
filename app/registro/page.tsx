'use client'
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ✅ CORREÇÃO: Nome da função corrigido
  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string; // ✅ Mude para "password"

    authClient.signUp.email({
      name: name,
      email: email,
      password: password
    },
    {
      onSuccess: () => redirect("/login"),
      onRequest: () => setLoading(true),
      onResponse: () => setLoading(false),
      onError: (ctx) => setError(ctx.error.message)
    })
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4 max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold">Criar Conta</h1>
      
      <div>
        <Input name="name" placeholder="Seu nome" required />
      </div>
      
      <div>
        <Input name="email" type="email" placeholder="Seu email" required />
      </div>
      
      <div>
        <Input name="password" type="password" placeholder="Sua senha" required />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Criando conta..." : "Criar Conta"}
      </Button>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  )
}