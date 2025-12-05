import { getDadosPlanilha } from "@/lib/google-sheets";
import RelatoriosClient from "@/components/RelatoriosClient";

export default async function RelatoriosPage() {
  const dados = await getDadosPlanilha();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Relatório Detalhado</h1>
        <p className="text-slate-500">Extrato completo de movimentações por período.</p>
      </div>
      <RelatoriosClient dadosIniciais={dados} />
    </div>
  );
}