// lib/api-auth.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  
  return session;
}