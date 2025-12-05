import { getCompras } from '@/lib/google-sheets';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Lancamentos() {
  const compras = await getCompras();
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">Lançamentos</h1>
            <Link href="/" className="text-nicopel-blue font-bold">Voltar</Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase">
                    <tr>
                        <th className="p-4">Data</th>
                        <th className="p-4">Fornecedor</th>
                        <th className="p-4">Descrição</th>
                        <th className="p-4 text-right">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {compras.map(c => (
                        <tr key={c.id}>
                            <td className="p-4">{c.data}</td>
                            <td className="p-4">{c.fornecedor}</td>
                            <td className="p-4">{c.descricao}</td>
                            <td className="p-4 text-right font-bold">
                                {c.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}