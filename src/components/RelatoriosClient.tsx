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

export default function RelatoriosClient({ dadosIniciais }: { dadosIniciais: Compra[] }) {
  const hoje = new Date().toISOString().split("T")[0];
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(trintaDiasAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [filtroTexto, setFiltroTexto] = useState("");

  // Lógica de Filtro
  const dadosFiltrados = useMemo(() => {
    const inicio = dataInicio ? new Date(dataInicio).getTime() : 0;
    const fim = dataFim ? new Date(dataFim).setHours(23, 59, 59) : Infinity;
    const texto = filtroTexto.toLowerCase().trim();

    return dadosIniciais.filter((item) => {
      const dataItem = new Date(item.data).getTime();
      const matchData = dataItem >= inicio && dataItem <= fim;
      const matchTexto = 
        !texto || 
        item.empresa.toLowerCase().includes(texto) ||
        item.fornecedor.toLowerCase().includes(texto) ||
        item.nfe.toLowerCase().includes(texto) ||
        item.descricao.toLowerCase().includes(texto);

      return matchData && matchTexto;
    });
  }, [dadosIniciais, dataInicio, dataFim, filtroTexto]);

  const totalPeriodo = dadosFiltrados.reduce((acc, item) => acc + item.valor, 0);
  const toBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* --- ESTILOS DE IMPRESSÃO (CSS) --- */}
      <style jsx global>{`
        @media print {
          /* Esconde barra lateral, inputs, botões e cabeçalhos do site */
          aside, .no-print { display: none !important; }
          
          /* Remove margens e fundos para economizar tinta */
          body, main { background: white !important; margin: 0 !important; padding: 0 !important; }
          
          /* Garante que a tabela use largura total */
          .print-container { border: none !important; box-shadow: none !important; width: 100% !important; }
          
          /* Ajusta tamanho da fonte para caber mais dados */
          table { font-size: 10pt !important; }
          td, th { padding: 4px !important; }
        }
      `}</style>

      {/* BARRA DE FERRAMENTAS (Escondida na impressão com 'no-print') */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col xl:flex-row gap-6 justify-between items-end no-print">
        
        {/* Filtros */}
        <div className="flex gap-4 w-full xl:w-auto">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">De</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="px-4 py-2 border rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Até</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="px-4 py-2 border rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
        </div>

        {/* Busca e Botão de Imprimir */}
        <div className="flex gap-4 w-full xl:w-1/2 justify-end items-end">
           <div className="w-full">
             <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Buscar</label>
             <div className="relative">
               <input 
                type="text" 
                placeholder="Filtrar tabela..." 
                value={filtroTexto}
                onChange={e => setFiltroTexto(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
               />
               <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
             </div>
           </div>
           
           {/* BOTÃO DE IMPRIMIR */}
           <button 
             onClick={() => window.print()}
             className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors h-[42px]"
           >
             🖨️ <span className="hidden sm:inline">Imprimir</span>
           </button>
        </div>
      </div>

      {/* CABEÇALHO DE RESUMO */}
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center text-blue-900 print-header">
        <div>
          <h2 className="text-lg font-bold">Relatório de Compras</h2>
          <p className="text-xs text-blue-600 hidden print:block">Gerado em: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase text-blue-400 block">Total Filtrado</span>
          <span className="text-2xl font-bold">{toBRL(totalPeriodo)}</span>
        </div>
      </div>

      {/* TABELA DE DADOS */}
      <div className="overflow-x-auto print-container">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Empresa</th>
              <th className="px-6 py-3">Fornecedor</th>
              <th className="px-6 py-3">NFe</th>
              <th className="px-6 py-3">Produto</th>
              <th className="px-6 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dadosFiltrados.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-500">
                  {new Date(item.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-3 font-semibold text-slate-800">{item.empresa}</td>
                <td className="px-6 py-3 text-slate-700">{item.fornecedor}</td>
                <td className="px-6 py-3 font-mono text-xs text-slate-500">
                  {item.nfe}
                </td>
                <td className="px-6 py-3 truncate max-w-[200px]">{item.descricao}</td>
                <td className="px-6 py-3 text-right font-bold text-slate-900">{toBRL(item.valor)}</td>
              </tr>
            ))}
            {dadosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}