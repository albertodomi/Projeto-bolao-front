import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Plus, Edit, Ban, PlayCircle, Trophy, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campanhas');
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTA': return <Badge variant="success">Aberta</Badge>;
      case 'ENCERRADA': return <Badge variant="default">Encerrada</Badge>;
      case 'APURADA': return <Badge variant="warning">Apurada</Badge>;
      case 'INATIVA': return <Badge variant="error">Inativa</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ABERTA' ? 'INATIVA' : 'ABERTA';
    try {
      await api.patch(`/campanhas/${id}/status`, { status: newStatus });
      setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success('Status da campanha atualizado!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao atualizar status');
    }
  };

  const endCampaign = async (id: number) => {
    if (window.confirm('Tem certeza que deseja encerrar esta campanha? Ela não aceitará novas apostas.')) {
      try {
        await api.patch(`/campanhas/${id}/status`, { status: 'ENCERRADA' });
        setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'ENCERRADA' } : c));
        toast.success('Campanha encerrada com sucesso!');
      } catch (err: any) {
        console.error(err);
        toast.error('Erro ao encerrar campanha');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Campanhas</h1>
          <p className="text-gray-600">Gerencie todas as campanhas do sistema</p>
        </div>
        <Link to="/admin/campanhas/nova">
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Nova Campanha
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="px-6 py-4 font-medium">Campanha</th>
                  <th className="px-6 py-4 font-medium">Código</th>
                  <th className="px-6 py-4 font-medium">Período</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-gray-400" />
                        {c.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{c.codigoCampanha}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(c.dtInicio).toLocaleDateString('pt-BR')} - {new Date(c.dtFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link to={`/admin/campanhas/${c.id}`} title="Editar">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer">
                            <Edit size={16} />
                          </button>
                        </Link>
                        
                        {(c.status === 'ABERTA' || c.status === 'INATIVA') && (
                          <button 
                            onClick={() => toggleStatus(c.id, c.status)}
                            title={c.status === 'ABERTA' ? 'Inativar' : 'Ativar'}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors cursor-pointer"
                          >
                            {c.status === 'ABERTA' ? <Ban size={16} /> : <PlayCircle size={16} />}
                          </button>
                        )}

                        {c.status === 'ABERTA' && (
                          <button 
                            onClick={() => endCampaign(c.id)}
                            title="Encerrar / Apurar"
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                          >
                            <List size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 font-medium">
                      Nenhuma campanha cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
