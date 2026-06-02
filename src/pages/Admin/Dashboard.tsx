import { useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Campanha {
  id: number;
  nome: string;
  status: string;
}

export default function AdminDashboard() {
  const { signOut, user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data: campanhas = [], isLoading } = useQuery<Campanha[]>({
    queryKey: ['campanhas'],
    queryFn: async () => {
      const response = await api.get('/campanhas');
      return response.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await api.patch(`/campanhas/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      toast.success('Status alterado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao mudar status');
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-800 p-4 shadow flex flex-col sm:flex-row justify-between items-center text-white gap-4">
        <h1 className="text-xl font-bold">Painel Admin</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/admin/aprovar-apostas" className="text-sm font-medium hover:text-gray-300">Aprovar Apostas</Link>
          <Link to="/admin/criar-campanha" className="text-sm font-medium hover:text-gray-300">Nova Campanha</Link>
          <Link to="/admin/apurar-resultado" className="text-sm font-medium hover:text-gray-300">Apurar Resultado</Link>
          <span className="text-sm border-l pl-4 border-gray-600">Olá, {user?.nome}</span>
          <button onClick={signOut} className="text-sm text-red-400 hover:underline">Sair</button>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl p-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Gerenciar Campanhas</h2>
        
        {isLoading ? (
          <p>Carregando campanhas...</p>
        ) : (
          <div className="space-y-4">
            {campanhas.map(camp => (
              <div key={camp.id} className="rounded-lg bg-white p-4 shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">{camp.nome}</h3>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full 
                    ${camp.status === 'ABERTA' ? 'bg-green-100 text-green-800' : 
                      camp.status === 'ENCERRADA' ? 'bg-yellow-100 text-yellow-800' : 
                      camp.status === 'APURADA' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {camp.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatusMutation.mutate({ id: camp.id, status: camp.status === 'ABERTA' ? 'ENCERRADA' : 'ABERTA' })}
                    disabled={updateStatusMutation.isPending}
                    className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-800 hover:bg-blue-200 disabled:opacity-50"
                  >
                    Alternar Status
                  </button>
                </div>
              </div>
            ))}
            {campanhas.length === 0 && <p>Nenhuma campanha encontrada.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
