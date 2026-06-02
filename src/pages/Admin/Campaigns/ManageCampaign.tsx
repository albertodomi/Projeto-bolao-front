import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { InputText } from '../../../components/ui/InputText';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { ArrowLeft, Plus, Trash2, Trophy, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { cn } from '../../../utils/cn';

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

export default function ManageCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [status, setStatus] = useState(isEditing ? 'ATIVA' : 'NOVA'); // Em apuração, encerrada etc.
  const [opcoes, setOpcoes] = useState([
    { id: 1, descricao: 'Opção 1', status: 'ATIVO', eh_resultado_final: false },
    { id: 2, descricao: 'Opção 2', status: 'ATIVO', eh_resultado_final: false },
  ]);
  const [newOption, setNewOption] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: isEditing ? {
      nome: 'Brasileirão 2026',
      codigo_campanha: 'BRA26',
      tipo_campanha_id: '1',
      taxa_operacional: 10,
      valor_bolao: 50,
      dt_inicio: '2026-05-01',
      dt_fim: '2026-12-01',
    } : {
      taxa_operacional: 0,
      valor_bolao: 0,
    }
  });

  const onSubmit = (data: CampaignFormValues) => {
    console.log(data);
    toast.success(`Campanha ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
    navigate('/admin/campanhas');
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    setOpcoes([...opcoes, { id: Date.now(), descricao: newOption, status: 'ATIVO', eh_resultado_final: false }]);
    setNewOption('');
  };

  const toggleOptionStatus = (optId: number) => {
    setOpcoes(opcoes.map(o => o.id === optId ? { ...o, status: o.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' } : o));
  };

  const setWinner = (optId: number) => {
    if (status !== 'EM APURAÇÃO' && status !== 'ENCERRADA') {
      toast.error('Só é possível definir o resultado final em campanhas encerradas/em apuração.');
      return;
    }
    setOpcoes(opcoes.map(o => ({ ...o, eh_resultado_final: o.id === optId })));
    toast.success('Resultado final definido com sucesso!');
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
              <Badge variant={status === 'ATIVA' ? 'success' : status === 'EM APURAÇÃO' ? 'warning' : 'default'}>
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
                  <InputText label="Nome da Campanha" {...register('nome')} error={errors.nome?.message} />
                  <InputText label="Código da Campanha" {...register('codigo_campanha')} error={errors.codigo_campanha?.message} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select 
                    label="Tipo de Campanha" 
                    {...register('tipo_campanha_id')} 
                    error={errors.tipo_campanha_id?.message}
                    options={[
                      { label: 'Futebol', value: '1' },
                      { label: 'Entretenimento', value: '2' },
                    ]}
                  />
                  <InputText type="number" step="0.01" label="Valor do Bolão (R$)" {...register('valor_bolao', { valueAsNumber: true })} error={errors.valor_bolao?.message} />
                  <InputText type="number" step="0.1" label="Taxa Operacional (%)" {...register('taxa_operacional', { valueAsNumber: true })} error={errors.taxa_operacional?.message} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText type="date" label="Data Início" {...register('dt_inicio')} error={errors.dt_inicio?.message} />
                  <InputText type="date" label="Data Fim" {...register('dt_fim')} error={errors.dt_fim?.message} />
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
                
                <div className="flex gap-2">
                  <InputText 
                    placeholder="Adicionar nova opção (Ex: Time X, Resultado Y)" 
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddOption} variant="secondary">
                    <Plus size={18} />
                  </Button>
                </div>

                <div className="space-y-3">
                  {opcoes.map(opt => (
                    <div key={opt.id} className={cn("flex items-center justify-between p-3 border rounded-lg", opt.eh_resultado_final ? "border-green-500 bg-green-50" : "border-gray-200 bg-white")}>
                      <div className="flex items-center gap-3">
                        {opt.eh_resultado_final && <Trophy size={18} className="text-green-600" />}
                        <span className={cn("font-medium", opt.status === 'INATIVO' && 'text-gray-400 line-through')}>{opt.descricao}</span>
                        {opt.status === 'INATIVO' && <Badge variant="error">Inativa</Badge>}
                        {opt.eh_resultado_final && <Badge variant="success">Vencedora</Badge>}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(status === 'EM APURAÇÃO' || status === 'ENCERRADA') && !opt.eh_resultado_final && opt.status === 'ATIVO' && (
                          <Button size="sm" variant="outline" onClick={() => setWinner(opt.id)}>
                            Marcar Vencedora
                          </Button>
                        )}
                        <button onClick={() => toggleOptionStatus(opt.id)} className="text-xs text-gray-500 hover:text-gray-900 underline ml-2">
                          {opt.status === 'ATIVO' ? 'Inativar' : 'Ativar'}
                        </button>
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
            <Button type="submit" form="campaignForm">
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
              
              {isEditing && status === 'ATIVA' && (
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <Button 
                    variant="danger" 
                    className="w-full" 
                    onClick={() => {
                      if(window.confirm('Encerrar campanha e iniciar apuração?')) setStatus('EM APURAÇÃO');
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
