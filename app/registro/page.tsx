'use client'
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {

  const [loading, setloading] = useState(false)
  const [error, setError] = useState("")

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name =  formData.get("name") as string;
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;

    authClient.signUp.email({
	    name: name,
      email: email,
      password: senha
    },
    {
      onSuccess: () => redirect("/login"),
      onRequest: () => setloading(true),
      onResponse:() => setloading(false),
      onError: (ctx) => setError(ctx.error.message)
    }
  
  )
  }

  return (
  <form onSubmit={handleLogin}>
	  <Input name="name" />
    <Input name="email" />
    <Input name="senha" />
    <Button disabled={loading}>
      {loading ? "Carregando..." : "Cadastrar-se"}
    </Button>
    {error && error}
  </form>
  )

}