import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

export default function Register() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/usuarios/register', { nome, cpf, email, senha });
      
      // Auto-login
      const loginRes = await api.post('/auth/login', { email, senha });
      login(loginRes.data.user, loginRes.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar usuário');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-gray-900 to-black p-4 font-sans text-gray-100">
      <div className="w-full max-w-lg rounded-3xl bg-white/10 p-10 shadow-[0_0_40px_rgba(8,_112,_184,_0.3)] backdrop-blur-xl border border-white/20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Criar Conta</h2>
          <p className="mt-2 text-sm text-gray-300">Junte-se ao Projeto Bolão e comece a apostar!</p>
        </div>
        
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/20 p-4 border border-red-500/50 text-red-200 text-sm text-center font-medium shadow-lg backdrop-blur-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-200 ml-1">Nome Completo</label>
            <input 
              type="text" 
              required 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              placeholder="Digite seu nome"
              className="w-full rounded-xl border border-gray-600 bg-gray-800/50 p-3.5 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-200 ml-1">CPF</label>
            <input 
              type="text" 
              required 
              value={cpf} 
              onChange={e => setCpf(e.target.value)} 
              placeholder="Apenas números"
              className="w-full rounded-xl border border-gray-600 bg-gray-800/50 p-3.5 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-200 ml-1">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-gray-600 bg-gray-800/50 p-3.5 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-200 ml-1">Senha</label>
            <input 
              type="password" 
              required 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-600 bg-gray-800/50 p-3.5 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200" 
            />
          </div>
          
          <button 
            type="submit" 
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform transition-all active:scale-[0.98]"
          >
            Registrar e Entrar
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
