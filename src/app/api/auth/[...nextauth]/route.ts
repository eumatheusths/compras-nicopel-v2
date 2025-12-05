import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUsuarios } from "@/lib/google-sheets";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const usuarios = await getUsuarios();
          const user = usuarios.find(u => 
            u.email.toLowerCase() === credentials.email.toLowerCase() && 
            u.senha === credentials.password
          );
          if (user) return { id: user.email, name: user.nome, email: user.email };
          return null;
        } catch (error) { return null; }
      }
    })
  ],
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };