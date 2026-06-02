import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

interface Campanha {
  id: number;
  nome: string;
  valor_bolao: number;
}

interface Opcao {
  id: number;
  descricao: string;
  status: string;
}

interface MeioPagamento {
  id: number;
  descricao: string;
  exigeComprovante: boolean;
}

export default function CampanhaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [opcaoId, setOpcaoId] = useState('');
  const [meioId, setMeioId] = useState('');
  const [comprovante, setComprovante] = useState('');

  const { data: campanha, isLoading: loadingCampanha } = useQuery<Campanha>({
    queryKey: ['campanha', id],
    queryFn: async () => {
      const res = await api.get(`/campanhas/${id}`);
      return res.data;
    }
  });

  const { data: opcoes = [], isLoading: loadingOpcoes } = useQuery<Opcao[]>({
    queryKey: ['opcoes', id],
    queryFn: async () => {
      const res = await api.get(`/campanhas/${id}/opcoes`);
      return res.data.filter((o: Opcao) => o.status === 'ATIVA');
    }
  });

  const { data: meiosPagamento = [], isLoading: loadingMeios } = useQuery<MeioPagamento[]>({
    queryKey: ['meiosPagamento'],
    queryFn: async () => {
      const res = await api.get('/meios-pagamento');
      return res.data;
    }
  });

  const apostaMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/apostas', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Aposta realizada com sucesso!');
      setOpcaoId('');
      setMeioId('');
      setComprovante('');
      navigate('/dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao realizar aposta');
    }
  });

  const handleApostar = (e: React.FormEvent) => {
    e.preventDefault();
    apostaMutation.mutate({
      campanha_opcao_id: Number(opcaoId),
      meio_pagamento_id: Number(meioId),
      comprovante: comprovante || undefined,
    });
  };

  const selectedMeio = meiosPagamento.find(m => m.id === Number(meioId));

  if (loadingCampanha || loadingOpcoes || loadingMeios) {
    return <div className="p-6 text-center">Carregando dados da campanha...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        &larr; Voltar
      </button>

      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-sm border border-gray-200">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Fazer Aposta: {campanha?.nome}</h2>
        <p className="mb-6 text-gray-600">
          Valor do Bolão: <strong className="text-gray-900">R$ {Number(campanha?.valor_bolao).toFixed(2)}</strong>
        </p>

        <form onSubmit={handleApostar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Selecione a Opção</label>
            <select 
              required
              value={opcaoId}
              onChange={e => setOpcaoId(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {opcoes.map(op => (
                <option key={op.id} value={op.id}>{op.descricao}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Meio de Pagamento</label>
            <select 
              required
              value={meioId}
              onChange={e => setMeioId(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {meiosPagamento.map(mp => (
                <option key={mp.id} value={mp.id}>{mp.descricao}</option>
              ))}
            </select>
          </div>

          {selectedMeio?.exigeComprovante && (
            <div>
              <label className="block text-sm font-medium text-gray-700">URL ou Código do Comprovante</label>
              <input 
                type="text"
                required
                value={comprovante}
                onChange={e => setComprovante(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Insira o link ou código da transação"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={apostaMutation.isPending}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {apostaMutation.isPending ? 'Confirmando...' : 'Confirmar Aposta'}
          </button>
        </form>
      </div>
    </div>
  );
}
