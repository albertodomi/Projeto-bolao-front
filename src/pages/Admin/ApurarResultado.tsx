import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

interface Campanha {
  id: number;
  nome: string;
  status: string;
}

interface Opcao {
  id: number;
  descricao: string;
  status: string;
  ehResultadoFinal: boolean;
}

export default function ApurarResultado() {
  const queryClient = useQueryClient();
  const [selectedCampanhaId, setSelectedCampanhaId] = useState<number | null>(null);

  const { data: campanhas = [], isLoading: loadingCampanhas } = useQuery<Campanha[]>({
    queryKey: ['campanhasEncerradas'],
    queryFn: async () => {
      const res = await api.get('/campanhas');
      return res.data.filter((c: Campanha) => c.status === 'ENCERRADA' || c.status === 'APURADA');
    }
  });

  const { data: opcoes = [], isLoading: loadingOpcoes } = useQuery<Opcao[]>({
    queryKey: ['opcoes', selectedCampanhaId],
    queryFn: async () => {
      if (!selectedCampanhaId) return [];
      const res = await api.get(`/campanhas/${selectedCampanhaId}/opcoes`);
      return res.data;
    },
    enabled: !!selectedCampanhaId
  });

  const definirResultadoMutation = useMutation({
    mutationFn: async (opcaoId: number) => {
      await api.post(`/campanha-opcoes/${opcaoId}/definir-resultado-final`);
    },
    onSuccess: () => {
      toast.success('Resultado apurado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['campanhasEncerradas'] });
      queryClient.invalidateQueries({ queryKey: ['opcoes', selectedCampanhaId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao definir resultado.');
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Apurar Resultado da Campanha</h2>
      
      {loadingCampanhas ? (
        <p>Carregando campanhas...</p>
      ) : campanhas.length === 0 ? (
        <p className="text-gray-600">Não há campanhas encerradas prontas para apuração no momento.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione uma Campanha Encerrada</label>
            <select 
              className="w-full rounded border border-gray-300 p-2"
              value={selectedCampanhaId || ''}
              onChange={(e) => setSelectedCampanhaId(Number(e.target.value))}
            >
              <option value="">Selecione...</option>
              {campanhas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {selectedCampanhaId && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Opções da Campanha</h3>
              {loadingOpcoes ? (
                <p>Carregando opções...</p>
              ) : opcoes.length === 0 ? (
                <p>Nenhuma opção encontrada para esta campanha.</p>
              ) : (
                <div className="space-y-3">
                  {opcoes.map(opcao => (
                    <div key={opcao.id} className={`p-4 rounded border flex justify-between items-center ${opcao.ehResultadoFinal ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <span className="font-semibold">{opcao.descricao}</span>
                        {opcao.ehResultadoFinal && (
                          <span className="ml-2 text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded-full">VENCEDOR</span>
                        )}
                      </div>
                      {!opcao.ehResultadoFinal && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja definir "${opcao.descricao}" como o resultado final? Esta ação não pode ser desfeita.`)) {
                              definirResultadoMutation.mutate(opcao.id);
                            }
                          }}
                          disabled={definirResultadoMutation.isPending}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          Definir Vencedor
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
