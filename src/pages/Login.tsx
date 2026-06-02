import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, senha });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black p-4 font-sans text-gray-100">
      <div className="w-full max-w-lg rounded-3xl bg-white/10 p-10 shadow-[0_0_40px_rgba(79,_70,_229,_0.3)] backdrop-blur-xl border border-white/20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Bem-vindo de volta</h2>
          <p className="mt-2 text-sm text-black-300">Entre na sua conta do Projeto Bolão</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/20 p-4 border border-red-500/50 text-red-200 text-sm text-center font-medium shadow-lg backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-black-200 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-black-600 bg-gray-800/50 p-3.5 text-white placeholder-gray-400 focus:border-indigo-500 focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all duration-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-black-200 ml-1">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-black-600 bg-gray-800/50 p-3.5 text-white placeholder-gray-400 focus:border-indigo-500 focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform transition-all active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-black-400">
          Não tem uma conta?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
