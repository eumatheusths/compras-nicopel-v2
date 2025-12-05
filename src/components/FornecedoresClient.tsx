"use client";

import { useState, useMemo } from "react";

interface Compra {
  id: number;
  empresa: string;
  fornecedor: string;
  data: string;
  valor: number;
}

export default function FornecedoresClient({ dadosIniciais }: { dadosIniciais: Compra[] }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [buscaMaster, setBuscaMaster] = useState(""); // NOVA BUSCA

  // FILTRAGEM DUPLA (DATA + TEXTO)
  const dadosFiltrados = useMemo(() => {
    const inicio = dataInicio ? new Date(dataInicio).getTime() : 0;
    const fim = dataFim ? new Date(dataFim).setHours(23, 59, 59) : Infinity;
    const termo = buscaMaster.toLowerCase().trim();

    return dadosIniciais.filter((item) => {
      const dataItem = new Date(item.data).getTime();
      const matchData = dataItem >= inicio && dataItem <= fim;
      
      const matchTexto = !termo || item.fornecedor.toLowerCase().includes(termo);

      return matchData && matchTexto;
    });
  }, [dadosIniciais, dataInicio, dataFim, buscaMaster]);

  // AGRUPAMENTO
  const rankingFornecedores = useMemo(() => {
    const agrupado = dadosFiltrados.reduce((acc, item) => {
      const nome = item.fornecedor || "Desconhecido";
      acc[nome] = (acc[nome] || 0) + item.valor;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agrupado)
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [dadosFiltrados]);

  const totalGeralPeriodo = rankingFornecedores.reduce((acc, item) => acc + item.total, 0);
  const toBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- BARRA DE CONTROLE MASTER --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        
        {/* Busca por Nome */}
        <div className="w-full">
           <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Buscar Fornecedor</label>
           <div className="relative">
             <input 
               type="text" 
               placeholder="Digite o nome do fornecedor..." 
               value={buscaMaster}
               onChange={e => setBuscaMaster(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
             />
             <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-t border-slate-100 pt-4">
          {/* Datas */}
          <div className="flex gap-4 w-full md:w-auto">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Data Inicial</label>
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="px-4 py-2 border rounded-lg text-slate-700" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Data Final</label>
              <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="px-4 py-2 border rounded-lg text-slate-700" />
            </div>
          </div>

          {/* Totalizador */}
          <div className="text-right">
            <span className="text-sm text-slate-400 block uppercase">Total no filtro</span>
            <span className="text-2xl font-bold text-slate-800">{toBRL(totalGeralPeriodo)}</span>
          </div>
        </div>
      </div>

      {/* --- CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rankingFornecedores.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 transition-all relative overflow-hidden">
            <div className="absolute bottom-0 left-0 h-1.5 bg-blue-500 opacity-80" style={{ width: `${(item.total / (totalGeralPeriodo || 1)) * 100}%` }} />
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">#{index + 1}</div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{((item.total / (totalGeralPeriodo || 1)) * 100).toFixed(1)}%</span>
            </div>
            <h3 className="font-bold text-slate-700 text-lg leading-tight mb-2 truncate" title={item.nome}>{item.nome}</h3>
            <p className="text-2xl font-bold text-slate-900">{toBRL(item.total)}</p>
          </div>
        ))}
        {rankingFornecedores.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400">Nenhum fornecedor encontrado.</div>
        )}
      </div>
    </div>
  );
}