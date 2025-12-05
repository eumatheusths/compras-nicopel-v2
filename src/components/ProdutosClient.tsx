"use client";

import { useState, useMemo } from "react";

interface Compra {
  id: number;
  empresa: string;
  fornecedor: string;
  nfe: string;
  descricao: string;
  data: string;
  valor: number;
}

export default function ProdutosClient({ dadosIniciais }: { dadosIniciais: Compra[] }) {
  // AGORA TEMOS APENAS UMA BUSCA GLOBAL (MASTER)
  const [buscaMaster, setBuscaMaster] = useState("");
  const [fornecedoresAbertos, setFornecedoresAbertos] = useState<Record<string, boolean>>({});

  const toggleFornecedor = (chave: string) => {
    setFornecedoresAbertos((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  // --- LÓGICA DE AGRUPAMENTO COM BUSCA GLOBAL ---
  const dadosEstruturados = useMemo(() => {
    const empresasUnicas = Array.from(new Set(dadosIniciais.map((d) => d.empresa))).sort();

    // Filtra primeiro tudo que não bate com a busca master
    const termo = buscaMaster.toLowerCase().trim();
    
    return empresasUnicas.map((empresa) => {
      // Pega itens da empresa
      const dadosEmpresa = dadosIniciais.filter((d) => d.empresa === empresa);

      // Filtra os itens baseado na Busca Master (Nome, NFe, Fornecedor ou Produto)
      const dadosFiltrados = dadosEmpresa.filter((item) =>
        !termo ||
        item.descricao.toLowerCase().includes(termo) ||
        item.fornecedor.toLowerCase().includes(termo) ||
        item.nfe.toLowerCase().includes(termo)
      );

      // Se a busca filtrou tudo desta empresa, retornamos null para não mostrar o card vazio
      if (termo && dadosFiltrados.length === 0) return null;

      // Agrupa o que sobrou por Fornecedor
      const fornecedoresMap = dadosFiltrados.reduce((acc, item) => {
        if (!acc[item.fornecedor]) acc[item.fornecedor] = [];
        acc[item.fornecedor].push(item);
        return acc;
      }, {} as Record<string, Compra[]>);

      return {
        nomeEmpresa: empresa,
        total: dadosFiltrados.reduce((acc, item) => acc + item.valor, 0),
        fornecedores: Object.entries(fornecedoresMap).map(([nomeFornecedor, itens]) => ({
          nome: nomeFornecedor,
          itens: itens,
          total: itens.reduce((acc, i) => acc + i.valor, 0),
        })).sort((a, b) => b.total - a.total),
      };
    }).filter(Boolean); // Remove os nulos (empresas vazias na busca)
  }, [dadosIniciais, buscaMaster]);

  const toBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-8 pb-20">
      
      {/* --- BUSCA MASTER (Topo) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
          Busca Master (Pesquise em todas as empresas)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Digite o nome do produto, fornecedor ou NFe..."
            value={buscaMaster}
            onChange={(e) => setBuscaMaster(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
          />
          <span className="absolute left-4 top-5 text-slate-400 text-xl">🔍</span>
        </div>
      </div>

      {/* LISTAGEM HIERÁRQUICA */}
      {dadosEstruturados.map((grupoEmpresa: any) => (
        <div key={grupoEmpresa.nomeEmpresa} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">🏢 {grupoEmpresa.nomeEmpresa}</h2>
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase">Total Filtrado</span>
              <span className="text-green-400 font-bold text-2xl">{toBRL(grupoEmpresa.total)}</span>
            </div>
          </div>

          <div className="p-6 bg-slate-50 min-h-[100px]">
            <div className="space-y-4">
              {grupoEmpresa.fornecedores.map((fornecedor: any, idx: number) => {
                const chaveAccordion = `${grupoEmpresa.nomeEmpresa}-${fornecedor.nome}`;
                const estaAberto = fornecedoresAbertos[chaveAccordion] || buscaMaster.length > 0; // Abre automático se tiver buscando

                return (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleFornecedor(chaveAccordion)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transform transition-transform duration-200 text-slate-400 ${estaAberto ? 'rotate-90' : ''}`}>▶</span>
                        <div>
                          <h3 className="font-bold text-slate-700">{fornecedor.nome}</h3>
                          <span className="text-xs text-slate-400">{fornecedor.itens.length} itens encontrados</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">{toBRL(fornecedor.total)}</span>
                    </button>

                    {estaAberto && (
                      <div className="border-t border-slate-100 p-0">
                        <table className="w-full text-sm text-left text-slate-600">
                          <tbody className="divide-y divide-slate-100">
                            {fornecedor.itens.map((item: Compra) => (
                              <tr key={item.id} className="hover:bg-blue-50/50">
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-3 font-medium text-slate-700 w-full">{item.descricao}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-800 whitespace-nowrap">{toBRL(item.valor)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {dadosEstruturados.length === 0 && (
         <div className="text-center py-20 text-slate-400">Nenhum resultado encontrado para "{buscaMaster}"</div>
      )}
    </div>
  );
}