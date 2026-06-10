import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { InputText } from '../components/ui/InputText';
import { InputPassword } from '../components/ui/InputPassword';
import { Button } from '../components/ui/Button';

export default function Register() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length < 11) {
      setError('O CPF deve ter pelo menos 11 dígitos.');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/usuarios/register', { nome, cpf: cleanCpf, email, senha, telefone });
      
      // Auto-login
      const loginRes = await api.post('/auth/login', { email, senha });
      login(loginRes.data.user, loginRes.data.token);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const msgs = err.response.data.details.map((issue: any) => {
          const field = issue.path.join('.');
          if (field === 'senha') return 'A senha deve ter pelo menos 6 caracteres.';
          if (field === 'cpf') return 'O CPF deve ter pelo menos 11 dígitos.';
          if (field === 'email') return 'Formato de e-mail inválido.';
          return issue.message;
        });
        setError(msgs.join(' '));
      } else {
        setError(err.response?.data?.error || 'Erro ao registrar usuário');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Criar Conta</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Junte-se ao Projeto Bolão e comece a apostar!
      </p>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200 text-red-700 text-sm text-center font-medium shadow-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputText 
          label="Nome Completo"
          required 
          value={nome} 
          onChange={e => setNome(e.target.value)} 
          placeholder="Digite seu nome"
        />

        <InputText 
          label="CPF"
          required 
          value={cpf} 
          onChange={e => setCpf(e.target.value)} 
          placeholder="Apenas números"
        />

        <InputText 
          label="E-mail"
          type="email" 
          required 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="seu@email.com"
        />

        <InputText 
          label="Telefone"
          required={false}
          value={telefone} 
          onChange={e => setTelefone(e.target.value)} 
          placeholder="(11) 99999-9999"
        />

        <InputPassword 
          label="Senha"
          required 
          value={senha} 
          onChange={e => setSenha(e.target.value)} 
          placeholder="Sua senha (mín. 6 caracteres)"
        />
        
        <Button 
          type="submit" 
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Registrar e Entrar
        </Button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors">
          Faça login
        </Link>
      </p>
    </div>
  );
}
