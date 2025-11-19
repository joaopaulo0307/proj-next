'use client'
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
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

    console.log("📤 Tentando registrar:", { name, email, password: '***' });

    // 🔥 PRIMEIRO: Teste manual da API
    try {
      const testResponse = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });
      
      console.log("🔍 Resposta direta da API:");
      console.log("Status:", testResponse.status);
      console.log("Headers:", Object.fromEntries(testResponse.headers.entries()));
      
      const responseText = await testResponse.text();
      console.log("Response body:", responseText);
      
      if (!testResponse.ok) {
        setError(`Erro ${testResponse.status}: ${responseText || 'Erro na API'}`);
        return;
      }
      
      // Se chegou aqui, o registro foi bem-sucedido
      console.log("✅ Registro bem-sucedido via API direta!");
      redirect("/login");
      
    } catch (apiError) {
      console.error("❌ Erro na chamada direta da API:", apiError);
      setError("Falha na conexão com o servidor");
    }

    // 🔥 SEGUNDO: Se a API direta funcionar, tente com authClient
    // (Comente o código acima e descomente este se quiser testar o authClient)
    /*
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
          console.log("🔍 Contexto completo do erro:", JSON.stringify(ctx, null, 2));
          console.log("Tipo do ctx:", typeof ctx);
          console.log("Keys do ctx:", Object.keys(ctx));
          
          setError("Falha no registro. Verifique o console.");
        }
      }
    );
    */
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