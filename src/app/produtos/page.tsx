import { getDadosPlanilha } from "@/lib/google-sheets";
import ProdutosClient from "@/components/ProdutosClient";

export default async function ProdutosPage() {
  const dados = await getDadosPlanilha();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gerenciamento de Produtos</h1>
        <p className="text-slate-500">
          Visualização hierárquica: Empresa {'>'} Fornecedor {'>'} Itens
        </p>
      </div>

      <ProdutosClient dadosIniciais={dados} />
    </div>
  );
}