import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

interface Aposta {
  id: number;
  status: string;
  dtCriacao: string;
  comprovante: string | null;
  usuario: {
    nome: string;
    cpf: string;
  };
  campanhaOpcao: {
    descricao: string;
    campanha: {
      nome: string;
    };
  };
  meioPagamento: {
    descricao: string;
  };
}

export default function AprovarApostas() {
  const queryClient = useQueryClient();
  const { data: apostas = [], isLoading } = useQuery<Aposta[]>({
    queryKey: ['apostasPendentes'],
    queryFn: async () => {
      const res = await api.get('/apostas?status=PENDENTE');
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'CONFIRMADA' | 'CANCELADA' }) => {
      await api.patch(`/apostas/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apostasPendentes'] });
      toast.success('Status da aposta atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status da aposta.');
    }
  });

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Carregando apostas...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Aprovação de Apostas Pendentes</h2>
      
      {apostas.length === 0 ? (
        <p className="text-gray-600">Nenhuma aposta pendente de aprovação.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apostador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campanha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprovante</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apostas.map((aposta) => (
                <tr key={aposta.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aposta.usuario.nome}<br/>
                    <span className="text-xs text-gray-500">{aposta.usuario.cpf}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aposta.campanhaOpcao.campanha.nome}<br/>
                    <span className="text-xs font-semibold">{aposta.campanhaOpcao.descricao}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aposta.meioPagamento.descricao}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">
                    {aposta.comprovante ? (
                      aposta.comprovante.startsWith('http') ? (
                        <a href={aposta.comprovante} target="_blank" rel="noreferrer" className="hover:underline">
                          Ver Link
                        </a>
                      ) : (
                        <span>{aposta.comprovante}</span>
                      )
                    ) : (
                      <span className="text-gray-400">Nenhum</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: aposta.id, status: 'CONFIRMADA' })}
                      disabled={updateStatusMutation.isPending}
                      className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded disabled:opacity-50"
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: aposta.id, status: 'CANCELADA' })}
                      disabled={updateStatusMutation.isPending}
                      className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded disabled:opacity-50"
                    >
                      Rejeitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
