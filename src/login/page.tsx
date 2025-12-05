'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle, Package } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Acesso negado.');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Erro de conexão.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="bg-nicopel-blue w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Sistema Nicopel</h1>
        </div>
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Email" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Senha" />
          <button type="submit" disabled={loading} className="w-full bg-nicopel-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}