import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { InputText } from '../../../components/ui/InputText';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { ArrowLeft, Plus, Trophy, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { cn } from '../../../utils/cn';
import { api } from '../../../services/api';

const campaignSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo_campanha: z.string().min(1, 'Código é obrigatório'),
  tipo_campanha_id: z.string().min(1, 'Tipo é obrigatório'),
  taxa_operacional: z.number().min(0, 'A taxa deve ser maior ou igual a zero'),
  valor_bolao: z.number().min(1, 'O valor deve ser maior que zero'),
  dt_inicio: z.string().min(1, 'Data de início é obrigatória'),
  dt_fim: z.string().min(1, 'Data de fim é obrigatória'),
}).refine(data => new Date(data.dt_fim) >= new Date(data.dt_inicio), {
  message: "Data fim deve ser maior ou igual a data de início",
  path: ["dt_fim"]
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

const TEAMS_SUGGESTIONS = [
  'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Santos',
  'Fluminense', 'Vasco', 'Botafogo', 'Grêmio', 'Internacional',
  'Cruzeiro', 'Atlético-MG', 'Bahia', 'Fortaleza', 'Athletico-PR',
  'Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Bayern de Munique',
  'Paris Saint-Germain', 'Arsenal', 'Chelsea', 'Juventus', 'Milan', 'Boca Juniors', 'River Plate'
];

const MOVIES_SUGGESTIONS = [
  'Oppenheimer', 'Barbie', 'Duna: Parte Dois', 'Pobres Criaturas',
  'Anatomia de uma Queda', 'Vidas Passadas', 'Zona de Interesse',
  'Ficção Americana', 'Os Rejeitados', 'Homem-Aranha: Através do Aranhaverso',
  'Coringa: Delírio a Dois', 'Wicked', 'Gladiador 2', 'Nosferatu',
  'Divertida Mente 2', 'Deadpool & Wolverine'
];

export default function ManageCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [status, setStatus] = useState('ABERTA');
  const [tipos, setTipos] = useState<{ id: number; descricao: string }[]>([]);
  const [opcoes, setOpcoes] = useState<any[]>([]);
  const [newOption, setNewOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignTypeId, setCampaignTypeId] = useState<number | null>(null);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      taxa_operacional: 0,
      valor_bolao: 0,
      nome: '',
      codigo_campanha: '',
      tipo_campanha_id: '',
      dt_inicio: '',
      dt_fim: '',
    }
  });

  // Fetch campaign types
  useEffect(() => {
    api.get('/tipo-campanhas')
      .then(res => setTipos(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Erro ao carregar tipos de campanha');
      });
  }, []);

  // Fetch campaign details and options if editing
  useEffect(() => {
    if (isEditing) {
      api.get(`/campanhas/${id}`)
        .then(res => {
          const camp = res.data;
          setStatus(camp.status);
          setCampaignTypeId(camp.tipoCampanhaId);
          
          const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            // Get just the YYYY-MM-DD part for input type="date"
            return dateStr.split('T')[0];
          };

          reset({
            nome: camp.nome,
            codigo_campanha: camp.codigoCampanha,
            tipo_campanha_id: String(camp.tipoCampanhaId),
            taxa_operacional: Number(camp.taxaOperacional),
            valor_bolao: Number(camp.valorBolao),
            dt_inicio: formatDate(camp.dtInicio),
            dt_fim: formatDate(camp.dtFim),
          });
        })
        .catch(err => {
          console.error(err);
          toast.error('Erro ao carregar dados da campanha');
        });

      api.get(`/campanhas/${id}/opcoes`)
        .then(res => setOpcoes(res.data))
        .catch(err => {
          console.error(err);
          toast.error('Erro ao carregar opções');
        });
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.patch(`/campanhas/${id}/status`, { status });
        toast.success('Status da campanha atualizado!');
      } else {
        const payload = {
          nome: data.nome,
          codigo_campanha: data.codigo_campanha,
          tipo_campanha_id: Number(data.tipo_campanha_id),
          valor_bolao: data.valor_bolao,
          taxa_operacional: data.taxa_operacional,
          dt_inicio: new Date(data.dt_inicio).toISOString(),
          dt_fim: new Date(data.dt_fim).toISOString(),
          status: 'ABERTA'
        };
        const res = await api.post('/campanhas', payload);
        toast.success('Campanha criada com sucesso! Adicione opções abaixo.');
        navigate(`/admin/campanhas/${res.data.id}`);
        return;
      }
      navigate('/admin/campanhas');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Erro ao salvar campanha';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOption.trim()) return;
    try {
      const res = await api.post(`/campanhas/${id}/opcoes`, { descricao: newOption });
      setOpcoes([...opcoes, res.data]);
      setNewOption('');
      toast.success('Opção adicionada com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao adicionar opção');
    }
  };

  const handleGenerateFootballOptions = async () => {
    if (!homeTeam.trim() || !awayTeam.trim()) {
      toast.error('Por favor, selecione ou digite o Time de Casa e o Time de Fora.');
      return;
    }
    if (homeTeam.trim().toLowerCase() === awayTeam.trim().toLowerCase()) {
      toast.error('O Time de Casa e o Time de Fora devem ser diferentes.');
      return;
    }

    setIsGenerating(true);
    try {
      const option1 = `Vitória do ${homeTeam}`;
      const option2 = `Vitória do ${awayTeam}`;
      const option3 = `Empate entre ${homeTeam} e ${awayTeam}`;

      const res1 = await api.post(`/campanhas/${id}/opcoes`, { descricao: option1 });
      const res2 = await api.post(`/campanhas/${id}/opcoes`, { descricao: option2 });
      const res3 = await api.post(`/campanhas/${id}/opcoes`, { descricao: option3 });

      setOpcoes([...opcoes, res1.data, res2.data, res3.data]);
      setHomeTeam('');
      setAwayTeam('');
      toast.success('Opções da partida geradas com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao gerar opções da partida. Verifique se as opções já existem.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPredefinedOption = async (optionDesc: string) => {
    try {
      const res = await api.post(`/campanhas/${id}/opcoes`, { descricao: optionDesc });
      setOpcoes([...opcoes, res.data]);
      toast.success(`Opção "${optionDesc}" adicionada com sucesso!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || `Erro ao adicionar "${optionDesc}"`);
    }
  };

  const setWinner = async (optId: number) => {
    try {
      await api.post(`/campanha-opcoes/${optId}/definir-resultado-final`);
      setOpcoes(opcoes.map(o => ({ ...o, ehResultadoFinal: o.id === optId })));
      setStatus('APURADA');
      toast.success('Resultado final definido com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao definir vencedor');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/campanhas" className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Campanha' : 'Nova Campanha'}</h1>
            {isEditing && (
              <Badge variant={status === 'ABERTA' ? 'success' : status === 'ENCERRADA' ? 'default' : status === 'APURADA' ? 'warning' : 'error'}>
                {status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form id="campaignForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText label="Nome da Campanha" {...register('nome')} error={errors.nome?.message} disabled={isEditing} />
                  <InputText label="Código da Campanha" {...register('codigo_campanha')} error={errors.codigo_campanha?.message} disabled={isEditing} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select 
                    label="Tipo de Campanha" 
                    {...register('tipo_campanha_id')} 
                    error={errors.tipo_campanha_id?.message}
                    disabled={isEditing}
                    options={tipos.map(t => ({ label: t.descricao, value: String(t.id) }))}
                  />
                  <InputText type="number" step="0.01" label="Valor do Bolão (R$)" {...register('valor_bolao', { valueAsNumber: true })} error={errors.valor_bolao?.message} disabled={isEditing} />
                  <InputText type="number" step="0.1" label="Taxa Operacional (%)" {...register('taxa_operacional', { valueAsNumber: true })} error={errors.taxa_operacional?.message} disabled={isEditing} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText type="date" label="Data Início" {...register('dt_inicio')} error={errors.dt_inicio?.message} disabled={isEditing} />
                  <InputText type="date" label="Data Fim" {...register('dt_fim')} error={errors.dt_fim?.message} disabled={isEditing} />
                </div>
              </form>
            </CardContent>
          </Card>

          {isEditing && (
            <Card>
              <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between">
                <CardTitle>Gestão de Opções</CardTitle>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Apenas uma opção pode ser vencedora
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {status === 'ABERTA' && (
                  <div className="space-y-4 border-b border-gray-100 pb-4 mb-4">
                    {/* Predefined Options Helper */}
                    {campaignTypeId === 1 && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Assistente de Partida (Futebol)
                        </h4>
                        <p className="text-xs text-blue-700">
                          Selecione ou digite os times para gerar automaticamente as opções: Vitória Casa, Vitória Fora e Empate.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <input
                              list="teams-list"
                              value={homeTeam}
                              onChange={(e) => setHomeTeam(e.target.value)}
                              placeholder="Time de Casa (Ex: Flamengo)"
                              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <input
                              list="teams-list"
                              value={awayTeam}
                              onChange={(e) => setAwayTeam(e.target.value)}
                              placeholder="Time de Fora (Ex: Palmeiras)"
                              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={handleGenerateFootballOptions}
                          disabled={isGenerating || !homeTeam.trim() || !awayTeam.trim()}
                          className="w-full"
                          variant="primary"
                          size="sm"
                        >
                          {isGenerating ? 'Gerando Opções...' : 'Gerar 3 Opções de Partida'}
                        </Button>
                        <datalist id="teams-list">
                          {TEAMS_SUGGESTIONS.map((t) => (
                            <option key={t} value={t} />
                          ))}
                        </datalist>
                      </div>
                    )}

                    {campaignTypeId === 2 && (
                      <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                          Sugestões de Filmes (Entretenimento)
                        </h4>
                        <p className="text-xs text-purple-700">
                          Clique em um filme para adicioná-lo instantaneamente como opção de aposta.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {MOVIES_SUGGESTIONS.map((movie) => {
                            const exists = opcoes.some(o => o.descricao.toLowerCase() === movie.toLowerCase());
                            return (
                              <button
                                key={movie}
                                type="button"
                                disabled={exists}
                                onClick={() => handleAddPredefinedOption(movie)}
                                className={cn(
                                  "px-2.5 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer",
                                  exists 
                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                                )}
                              >
                                {movie}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <InputText 
                        placeholder="Ou adicione uma opção personalizada manualmente (Ex: Time X, Resultado Y)" 
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddOption} variant="secondary">
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {opcoes.map(opt => (
                    <div key={opt.id} className={cn("flex items-center justify-between p-3 border rounded-lg", opt.ehResultadoFinal ? "border-green-500 bg-green-50" : "border-gray-200 bg-white")}>
                      <div className="flex items-center gap-3">
                        {opt.ehResultadoFinal && <Trophy size={18} className="text-green-600" />}
                        <span className={cn("font-medium", opt.status === 'INATIVA' && 'text-gray-400 line-through')}>{opt.descricao}</span>
                        {opt.status === 'INATIVA' && <Badge variant="error">Inativa</Badge>}
                        {opt.ehResultadoFinal && <Badge variant="success">Vencedora</Badge>}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(status === 'ENCERRADA' || status === 'APURADA') && !opt.ehResultadoFinal && opt.status === 'ATIVA' && (
                          <Button size="sm" variant="outline" onClick={() => setWinner(opt.id)}>
                            Marcar Vencedora
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {opcoes.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhuma opção cadastrada.</p>}
                </div>

              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Link to="/admin/campanhas">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" form="campaignForm" isLoading={isSubmitting}>
              Salvar Campanha
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Regras de Negócio
              </h3>
              <ul className="text-sm space-y-3 text-blue-800">
                <li>• <strong>Datas:</strong> A Data Fim não pode ser menor que a Data Início.</li>
                <li>• <strong>Código Único:</strong> O código da campanha deve ser único no sistema.</li>
                <li>• <strong>Resultado Final:</strong> Só é possível marcar uma opção como resultado se a campanha estiver encerrada ou em apuração.</li>
              </ul>
              
              {isEditing && status === 'ABERTA' && (
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <Button 
                    variant="danger" 
                    className="w-full" 
                    onClick={() => {
                      if(window.confirm('Encerrar campanha e iniciar apuração?')) setStatus('ENCERRADA');
                    }}
                  >
                    Encerrar Campanha Agora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
