import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // Importe o Sidebar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema Nicopel",
  description: "Gerenciamento de Compras e Relatórios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-slate-100 text-slate-800`}>
        <div className="flex min-h-screen">
          {/* Menu Lateral Fixo */}
          <Sidebar />

          {/* Área de Conteúdo Principal (empurrada para direita) */}
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}