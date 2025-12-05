import { getDadosPlanilha } from "@/lib/google-sheets";
import FornecedoresClient from "@/components/FornecedoresClient";

export default async function FornecedoresPage() {
  // Busca os dados brutos da planilha
  const dados = await getDadosPlanilha();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Fornecedores</h1>
        <p className="text-slate-500">
          Ranking de gastos e volume de compras por parceiro.
        </p>
      </div>

      {/* Carrega o componente interativo */}
      <FornecedoresClient dadosIniciais={dados} />
    </div>
  );
}