import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputText } from '../../components/ui/InputText';
import { InputPassword } from '../../components/ui/InputPassword';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido').min(1, 'E-mail é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { 
        email: data.email, 
        senha: data.password 
      });
      
      const { user, token } = response.data;
      login(user, token);
      
      if (user.role === 'ADMIN') {
        navigate('/admin/campanhas');
      } else {
        navigate('/dashboard');
      }
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Credenciais inválidas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Acesse sua conta</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputText
          label="E-mail"
          placeholder="seu@email.com"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <InputPassword
          label="Senha"
          placeholder="Sua senha"
          {...register('password')}
          error={errors.password?.message}
        />
        
        <div className="flex justify-between items-center">
          <Link to="/register" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Não tem uma conta? Registre-se
          </Link>
          <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Esqueceu a senha?
          </button>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Entrar
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Use <strong className="font-medium text-gray-900">admin@bolao.com</strong> para admin</p>
        <p>Qualquer outro para usuário comum.</p>
      </div>
    </div>
  );
}
