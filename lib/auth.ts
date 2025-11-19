import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma-client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  siteUrl: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // ← IMPORTANTE
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
  },
  trustHost: true, // ← IMPORTANTE para desenvolvimento
  plugins: [nextCookies()]
});