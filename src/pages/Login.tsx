import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { InputText } from '../components/ui/InputText';
import { InputPassword } from '../components/ui/InputPassword';
import { Button } from '../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { user, token } = response.data;
      login(user, token);
      
      if (user.role === 'ADMIN') {
        navigate('/admin/campanhas');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciais inválidas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Bem-vindo de volta</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Entre na sua conta do Projeto Bolão
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200 text-red-700 text-sm text-center font-medium shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputText
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
        />

        <InputPassword
          label="Senha"
          required
          value={senha}
          onChange={e => setSenha(e.target.value)}
          placeholder="Sua senha"
        />

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Não tem uma conta?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors">
          Registre-se
        </Link>
      </p>
    </div>
  );
}
