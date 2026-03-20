import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: string;
      nombre: string;
      guiaMayorId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    guiaMayorId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: string;
    nombre: string;
    guiaMayorId?: string | null;
  }
}
