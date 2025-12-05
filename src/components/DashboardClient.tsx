"use client";

import { useState, useMemo } from "react";

interface Compra {
  id: number;
  empresa: string;       // A
  fornecedor: string;    // B
  descricaoItem: string; // I
  planoContas: string;   // P
  categoria: string;     // Q
  unidade: string;       // R
  quantidade: string;    // S
  valorUnitario: number; // U
  valorTotal: number;    // X
  data: string;          // C
  nfe: string;           // D
}

// Interface para o Item Agrupado (Resumido)
interface ItemAgrupado {
  descricao: string;
  unidade: string;
  quantidadeTotal: number;
  valorTotal: number;
  contagem: number; // Quantas vezes comprou esse item
}

export default function DashboardClient({ dadosIniciais }: { dadosIniciais: Compra[] }) {
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/16zZ21VRDCdk6F72jOFugjtnRMfEl-ewhYboHKs9pHZA/edit";

  const toggle = (id: string) => setAbertos(prev => ({ ...prev, [id]: !prev[id] }));
  const toBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  // --- 1. FILTRAGEM GLOBAL (Data + Texto) ---
  const dadosFiltrados = useMemo(() => {
    const inicio = dataInicio ? new Date(dataInicio).getTime() : 0;
    const fim = dataFim ? new Date(dataFim).setHours(23, 59, 59) : Infinity;
    const termo = busca.toLowerCase().trim();

    return dadosIniciais.filter((item) => {
      // Filtro de Data
      const dataItem = new Date(item.data).getTime();
      const matchData = dataItem >= inicio && dataItem <= fim;

      // Filtro de Texto
      const matchTexto = 
        !termo ||
        item.empresa.toLowerCase().includes(termo) ||
        item.fornecedor.toLowerCase().includes(termo) ||
        item.planoContas.toLowerCase().includes(termo) ||
        item.descricaoItem.toLowerCase().includes(termo);

      return matchData && matchTexto;
    });
  }, [dadosIniciais, busca, dataInicio, dataFim]);

  // --- 2. CARDS DE GASTOS POR EMPRESA ---
  const rankingEmpresas = useMemo(() => {
    const agrupado = dadosFiltrados.reduce((acc, item) => {
      acc[item.empresa] = (acc[item.empresa] || 0) + item.valorTotal;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agrupado)
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [dadosFiltrados]);

  const totalGeral = rankingEmpresas.reduce((acc, item) => acc + item.total, 0);

  // --- 3. FLUXO REVERSO COM AGRUPAMENTO DE MATERIAIS ---
  // Estrutura: Plano (P) > Categoria (Q) > Fornecedor (B) > Itens Agrupados
  const estruturaReversa = useMemo(() => {
    const arvore: any = {};

    dadosFiltrados.forEach(item => {
      const p = item.planoContas || "Outros";
      const q = item.categoria || "Geral";
      const b = item.fornecedor || "Desconhecido";

      // Cria a estrutura se não existir
      if (!arvore[p]) arvore[p] = { total: 0, categorias: {} };
      if (!arvore[p].categorias[q]) arvore[p].categorias[q] = { total: 0, fornecedores: {} };
      if (!arvore[p].categorias[q].fornecedores[b]) {
        arvore[p].categorias[q].fornecedores[b] = { total: 0, materiais: {} };
      }

      // Soma cascata (Totais Monetários)
      arvore[p].total += item.valorTotal;
      arvore[p].categorias[q].total += item.valorTotal;
      arvore[p].categorias[q].fornecedores[b].total += item.valorTotal;
      
      // --- LÓGICA DE AGRUPAMENTO DE ITEM (Soma Unidade e Valor) ---
      // Chave única: Nome do Item + Unidade (para não somar KG com UN)
      const chaveMaterial = `${item.descricaoItem}__${item.unidade}`;
      const grupoMateriais = arvore[p].categorias[q].fornecedores[b].materiais;

      if (!grupoMateriais[chaveMaterial]) {
        grupoMateriais[chaveMaterial] = {
          descricao: item.descricaoItem,
          unidade: item.unidade,
          quantidadeTotal: 0,
          valorTotal: 0,
          contagem: 0
        };
      }

      // Converte quantidade (string "1.000,00" -> number 1000.00)
      const qtdNumerica = parseFloat(String(item.quantidade).replace(/[^\d,-]/g, "").replace(",", ".")) || 0;

      grupoMateriais[chaveMaterial].quantidadeTotal += qtdNumerica;
      grupoMateriais[chaveMaterial].valorTotal += item.valorTotal;
      grupoMateriais[chaveMaterial].contagem += 1;
    });

    // Ordena os planos pelo valor total
    return Object.entries(arvore).sort((a: any, b: any) => b[1].total - a[1].total);
  }, [dadosFiltrados]);


  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Dashboard Financeiro</h1>
           <p className="text-slate-500">Fluxo de custos agrupado e consolidado.</p>
        </div>
        <a 
          href={LINK_PLANILHA} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-transform hover:scale-105"
        >
          📂 Lançar na Planilha
        </a>
      </div>

      {/* FILTROS GERAIS (Aplica em TUDO abaixo) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-6 justify-between items-end">
        <div className="w-full xl:w-1/3">
          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Busca Inteligente</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar material, empresa, plano..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
          </div>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
           <div>
             <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Início</label>
             <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
           </div>
           <div>
             <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Fim</label>
             <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
           </div>
        </div>
      </div>

      {/* CARDS DE EMPRESAS */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          🏢 Gastos por Empresa <span className="text-sm font-normal text-slate-400">({toBRL(totalGeral)})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rankingEmpresas.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500" style={{ width: `${(item.total / (totalGeral || 1)) * 100}%` }} />
              <h3 className="font-bold text-slate-600 text-sm uppercase">{item.nome}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{toBRL(item.total)}</p>
              <p className="text-xs text-slate-400 mt-1">
                {((item.total / (totalGeral || 1)) * 100).toFixed(1)}% do total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FLUXO REVERSO AGRUPADO */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-700 mt-8 mb-4">
          🔄 Fluxo Detalhado (Plano &gt; Categoria &gt; Fornecedor &gt; Materiais Agrupados)
        </h2>
        
        {estruturaReversa.map(([nomePlano, dadosPlano]: [string, any]) => (
          <div key={nomePlano} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* NÍVEL 1 (P): PLANO DE CONTAS */}
            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">📂 {nomePlano}</h3>
              <span className="font-mono font-bold text-green-400 text-lg">{toBRL(dadosPlano.total)}</span>
            </div>

            <div className="p-3 space-y-2 bg-slate-50">
              {Object.entries(dadosPlano.categorias).map(([nomeCat, dadosCat]: [string, any]) => {
                const idCat = `${nomePlano}-${nomeCat}`;
                const isOpenCat = abertos[idCat] || busca.length > 0;

                return (
                  <div key={nomeCat} className="border border-slate-200 rounded-lg bg-white shadow-sm">
                    
                    {/* NÍVEL 2 (Q): CATEGORIA */}
                    <button 
                      onClick={() => toggle(idCat)}
                      className="w-full flex justify-between items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 transform transition-transform">{isOpenCat ? "▼" : "►"}</span>
                        <span className="font-bold text-slate-700">{nomeCat}</span>
                      </div>
                      <div className="text-right">
                         <span className="block text-sm font-bold text-slate-800">{toBRL(dadosCat.total)}</span>
                      </div>
                    </button>

                    {isOpenCat && (
                      <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3 animate-in slide-in-from-top-1">
                        {Object.entries(dadosCat.fornecedores).map(([nomeFornecedor, dadosForn]: [string, any]) => {
                          const idForn = `${idCat}-${nomeFornecedor}`;
                          const isOpenForn = abertos[idForn] || busca.length > 0;

                          return (
                            <div key={nomeFornecedor} className="bg-slate-50/50 border border-slate-200 rounded-lg overflow-hidden">
                              
                              {/* NÍVEL 3 (B): FORNECEDOR */}
                              <button 
                                onClick={() => toggle(idForn)}
                                className="w-full flex justify-between items-center px-3 py-2 hover:bg-blue-50 transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-blue-400">{isOpenForn ? "▼" : "►"}</span>
                                  <span className="text-sm font-semibold text-blue-700">{nomeFornecedor}</span>
                                </div>
                                <span className="text-xs font-bold text-blue-800">{toBRL(dadosForn.total)}</span>
                              </button>

                              {/* TABELA DE MATERIAIS AGRUPADOS (Soma Qtd e Valor) */}
                              {isOpenForn && (
                                <div className="overflow-x-auto bg-white">
                                  <table className="w-full text-xs text-left text-slate-600">
                                    <thead className="bg-slate-100 text-slate-500 font-medium border-b border-slate-200">
                                      <tr>
                                        <th className="p-2 pl-4">Material Agrupado</th>
                                        <th className="p-2 text-center">Pedidos</th>
                                        <th className="p-2 text-right">Qtd. Total</th>
                                        <th className="p-2">Un.</th>
                                        <th className="p-2 text-right">Médio Unit.</th>
                                        <th className="p-2 text-right pr-4">Total Gasto</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {Object.values(dadosForn.materiais).map((mat: any, idx: number) => {
                                        // Calcula preço médio só para exibição
                                        const precoMedio = mat.valorTotal / (mat.quantidadeTotal || 1);
                                        
                                        return (
                                          <tr key={idx} className="hover:bg-slate-50">
                                            <td className="p-2 pl-4 font-medium text-slate-700 truncate max-w-[250px]" title={mat.descricao}>
                                              {mat.descricao}
                                            </td>
                                            <td className="p-2 text-center text-slate-400">
                                              {mat.contagem}x
                                            </td>
                                            <td className="p-2 text-right font-mono">
                                              {mat.quantidadeTotal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-2 uppercase text-[10px] text-slate-400">
                                              {mat.unidade}
                                            </td>
                                            <td className="p-2 text-right text-slate-500">
                                              {toBRL(precoMedio)}
                                            </td>
                                            <td className="p-2 text-right pr-4 font-bold text-slate-900">
                                              {toBRL(mat.valorTotal)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}