import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

export default function CriarCampanha() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'campanha' | 'opcao' | 'tipo' | 'meio'>('campanha');

  // Queries
  const { data: tipos = [] } = useQuery({
    queryKey: ['tiposCampanha'],
    queryFn: async () => (await api.get('/tipo-campanhas')).data
  });
  const { data: campanhas = [] } = useQuery({
    queryKey: ['campanhas'],
    queryFn: async () => (await api.get('/campanhas')).data
  });

  // States
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');
  const [taxa, setTaxa] = useState('');
  const [dtInicio, setDtInicio] = useState('');
  const [dtFim, setDtFim] = useState('');
  const [tipoId, setTipoId] = useState('');

  const [opcaoDescricao, setOpcaoDescricao] = useState('');
  const [opcaoCampanhaId, setOpcaoCampanhaId] = useState('');

  const [tipoDescricao, setTipoDescricao] = useState('');

  const [meioDescricao, setMeioDescricao] = useState('');
  const [exigeComprovante, setExigeComprovante] = useState(false);

  // Mutations
  const createCampanha = useMutation({
    mutationFn: async (data: any) => await api.post('/campanhas', data),
    onSuccess: () => {
      toast.success('Campanha criada!');
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      setNome(''); setCodigo(''); setValor(''); setTaxa(''); setDtInicio(''); setDtFim(''); setTipoId('');
    },
    onError: () => toast.error('Erro ao criar campanha')
  });

  const createOpcao = useMutation({
    mutationFn: async ({ campanhaId, data }: { campanhaId: number, data: any }) => await api.post(`/campanhas/${campanhaId}/opcoes`, data),
    onSuccess: () => {
      toast.success('Opção criada!');
      setOpcaoDescricao('');
    },
    onError: () => toast.error('Erro ao criar opção')
  });

  const createTipo = useMutation({
    mutationFn: async (data: any) => await api.post('/tipo-campanhas', data),
    onSuccess: () => {
      toast.success('Tipo criado!');
      queryClient.invalidateQueries({ queryKey: ['tiposCampanha'] });
      setTipoDescricao('');
    },
    onError: () => toast.error('Erro ao criar tipo')
  });

  const createMeio = useMutation({
    mutationFn: async (data: any) => await api.post('/meios-pagamento', data),
    onSuccess: () => {
      toast.success('Meio de pagamento criado!');
      setMeioDescricao('');
      setExigeComprovante(false);
    },
    onError: () => toast.error('Erro ao criar meio')
  });

  return (
    <div className="bg-white rounded-lg shadow max-w-4xl mx-auto mt-6">
      <div className="flex border-b">
        <button className={`flex-1 py-4 font-medium text-sm ${activeTab === 'campanha' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('campanha')}>Campanha</button>
        <button className={`flex-1 py-4 font-medium text-sm ${activeTab === 'opcao' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('opcao')}>Opções</button>
        <button className={`flex-1 py-4 font-medium text-sm ${activeTab === 'tipo' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('tipo')}>Tipos</button>
        <button className={`flex-1 py-4 font-medium text-sm ${activeTab === 'meio' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('meio')}>Pagamentos</button>
      </div>

      <div className="p-6">
        {activeTab === 'campanha' && (
          <form onSubmit={e => { e.preventDefault(); createCampanha.mutate({ nome, codigo_campanha: codigo, valor_bolao: Number(valor), taxa_operacional: Number(taxa), dt_inicio: new Date(dtInicio), dt_fim: new Date(dtFim), tipo_campanha_id: Number(tipoId) }); }} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Nova Campanha</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm">Nome</label><input required className="w-full border p-2 rounded mt-1" value={nome} onChange={e => setNome(e.target.value)} /></div>
              <div><label className="block text-sm">Código</label><input required className="w-full border p-2 rounded mt-1" value={codigo} onChange={e => setCodigo(e.target.value)} /></div>
              <div><label className="block text-sm">Valor Aposta (R$)</label><input type="number" step="0.01" required className="w-full border p-2 rounded mt-1" value={valor} onChange={e => setValor(e.target.value)} /></div>
              <div><label className="block text-sm">Taxa Operacional (%)</label><input type="number" step="0.01" required className="w-full border p-2 rounded mt-1" value={taxa} onChange={e => setTaxa(e.target.value)} /></div>
              <div><label className="block text-sm">Início</label><input type="datetime-local" required className="w-full border p-2 rounded mt-1" value={dtInicio} onChange={e => setDtInicio(e.target.value)} /></div>
              <div><label className="block text-sm">Fim</label><input type="datetime-local" required className="w-full border p-2 rounded mt-1" value={dtFim} onChange={e => setDtFim(e.target.value)} /></div>
              <div className="col-span-2">
                <label className="block text-sm">Tipo de Campanha</label>
                <select required className="w-full border p-2 rounded mt-1" value={tipoId} onChange={e => setTipoId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {tipos.map((t: any) => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={createCampanha.isPending} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Criar Campanha</button>
          </form>
        )}

        {activeTab === 'opcao' && (
          <form onSubmit={e => { e.preventDefault(); createOpcao.mutate({ campanhaId: Number(opcaoCampanhaId), data: { descricao: opcaoDescricao } }); }} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Adicionar Opção à Campanha</h2>
            <div>
              <label className="block text-sm">Campanha</label>
              <select required className="w-full border p-2 rounded mt-1" value={opcaoCampanhaId} onChange={e => setOpcaoCampanhaId(e.target.value)}>
                <option value="">Selecione...</option>
                {campanhas.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div><label className="block text-sm">Descrição do Palpite (ex: Time A, Placar 2x1)</label><input required className="w-full border p-2 rounded mt-1" value={opcaoDescricao} onChange={e => setOpcaoDescricao(e.target.value)} /></div>
            <button type="submit" disabled={createOpcao.isPending} className="bg-blue-600 text-white px-4 py-2 rounded">Adicionar Opção</button>
          </form>
        )}

        {activeTab === 'tipo' && (
          <form onSubmit={e => { e.preventDefault(); createTipo.mutate({ descricao: tipoDescricao }); }} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Novo Tipo de Campanha</h2>
            <div><label className="block text-sm">Descrição (ex: Campeonato, Reality Show)</label><input required className="w-full border p-2 rounded mt-1" value={tipoDescricao} onChange={e => setTipoDescricao(e.target.value)} /></div>
            <button type="submit" disabled={createTipo.isPending} className="bg-blue-600 text-white px-4 py-2 rounded">Criar Tipo</button>
          </form>
        )}

        {activeTab === 'meio' && (
          <form onSubmit={e => { e.preventDefault(); createMeio.mutate({ descricao: meioDescricao, exige_comprovante: exigeComprovante }); }} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Novo Meio de Pagamento</h2>
            <div><label className="block text-sm">Descrição (ex: PIX, Cartão)</label><input required className="w-full border p-2 rounded mt-1" value={meioDescricao} onChange={e => setMeioDescricao(e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm mt-4">
              <input type="checkbox" checked={exigeComprovante} onChange={e => setExigeComprovante(e.target.checked)} />
              Exige Comprovante (Link/Hash)
            </label>
            <button type="submit" disabled={createMeio.isPending} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Criar Meio de Pagamento</button>
          </form>
        )}
      </div>
    </div>
  );
}
