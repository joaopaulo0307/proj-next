'use client'
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); // Limpa erros anteriores
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validação básica
    if (!name || !email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    authClient.signUp.email(
      {
        name: name,
        email: email,
        password: password
      },
      {
        onSuccess: () => {
          console.log("Registro bem-sucedido!");
          redirect("/login");
        },
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          // 🔥 CORREÇÃO: Tratamento de erro mais robusto e type-safe
          console.error("Erro completo no registro:", ctx);
          
          // Função auxiliar para extrair mensagem de forma segura
          const getErrorMessage = (): string => {
            // Tentativa 1: ctx.error como objeto com message
            if (ctx.error && typeof ctx.error === 'object' && 'message' in ctx.error) {
              return (ctx.error as any).message;
            }
            
            // Tentativa 2: ctx.error como string
            if (typeof ctx.error === 'string') {
              return ctx.error;
            }
            
            // Tentativa 3: ctx.response.data.message
            if (ctx.response && typeof ctx.response === 'object' && 'data' in ctx.response) {
              const responseData = (ctx.response as any).data;
              if (responseData && typeof responseData === 'object' && 'message' in responseData) {
                return responseData.message;
              }
            }
            
            // Tentativa 4: Mensagem genérica baseada no status
            if (ctx.response && typeof ctx.response === 'object' && 'status' in ctx.response) {
              const status = (ctx.response as any).status;
              if (status === 409) return "Usuário já existe";
              if (status === 400) return "Dados inválidos";
              if (status >= 500) return "Erro interno do servidor";
            }
            
            // Fallback
            return "Erro desconhecido no registro";
          };
          
          const errorMessage = getErrorMessage();
          setError(errorMessage);
        }
      }
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <Input 
          name="name" 
          placeholder="Nome completo" 
          required 
        />
      </div>
      
      <div>
        <Input 
          name="email" 
          type="email" 
          placeholder="E-mail" 
          required 
        />
      </div>
      
      <div>
        <Input 
          name="password" 
          type="password" 
          placeholder="Senha" 
          required 
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full"
      >
        {loading ? "Carregando..." : "Cadastrar-se"}
      </Button>
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </form>
  );
}