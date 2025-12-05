import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400 mb-8">Nicopel <span className="text-xs text-slate-400 block font-normal">Sistema de Compras</span></h1>
        
        <nav className="space-y-2">
          <Link href="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 hover:text-white">
            📊 Dashboard
          </Link>
          <Link href="/relatorios" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 hover:text-white">
            📑 Relatórios
          </Link>
          <Link href="/fornecedores" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 hover:text-white">
            🚚 Fornecedores
          </Link>
          <Link href="/produtos" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 hover:text-white">
            📦 Produtos
          </Link>
           <Link href="/configuracoes" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 hover:text-white">
            ⚙️ Configurações
          </Link>
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-6 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            M
          </div>
          <div>
            <p className="text-sm font-semibold">Matheus</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}