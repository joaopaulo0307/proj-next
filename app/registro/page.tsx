'use client'
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;

    setError("") // Limpa erros anteriores

    authClient.signUp.email({
      name: name,
      email: email,
      password: senha
    },
    {
      onSuccess: () => redirect("/login"),
      onRequest: () => setLoading(true),
      onResponse: () => setLoading(false),
      onError: (ctx) => setError(ctx.error.message)
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Preencha os dados abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name"
              name="name" 
              type="text"
              placeholder="Seu nome completo"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email"
              name="email" 
              type="email"
              placeholder="seu@email.com"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input 
              id="senha"
              name="senha" 
              type="password"
              placeholder="Sua senha"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Ao criar uma conta, você concorda com nossos termos de serviço.
          </div>
        </form>
      </CardContent>
    </Card>
  )
}