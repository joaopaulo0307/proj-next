'use client'
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;

    setError("") // Limpa erros anteriores

    authClient.signIn.email({
      email: email,
      password: senha
    },
    {
      onSuccess: () => redirect("/painel"),
      onRequest: () => setLoading(true),
      onResponse: () => setLoading(false),
      onError: (ctx) => setError(ctx.error.message)
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
        <CardDescription className="text-center">
          Digite suas credenciais para acessar sua conta
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
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
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <a href="/registro" className="text-primary hover:underline">
              Não tem uma conta? Cadastre-se
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}