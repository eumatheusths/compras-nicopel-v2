import { getDadosPlanilha } from "@/lib/google-sheets";
import DashboardClient from "@/components/DashboardClient";

// Esta página roda no servidor (Server Component)
// Ela busca os dados antes de entregar o HTML
export default async function Home() {
  // 1. Busca os dados reais da planilha
  const dados = await getDadosPlanilha();

  // 2. Passa os dados para o componente visual interativo
  return (
    <main>
      <DashboardClient dadosIniciais={dados} />
    </main>
  );
}