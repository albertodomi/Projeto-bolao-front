import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Trophy, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          api.get('/campanhas'),
          api.get('/apostas/minhas')
        ]);
        setCampaigns(cRes.data);
        setBets(bRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar dados do painel');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeCampaignsCount = campaigns.filter(c => c.status === 'ABERTA').length;
  const closedCampaignsCount = campaigns.filter(c => c.status === 'ENCERRADA').length;
  const pendingBetsCount = bets.filter(b => b.status === 'PENDENTE').length;

  const totalApostado = bets
    .filter(b => b.status === 'CONFIRMADA')
    .reduce((sum, b) => sum + Number(b.campanhaOpcao?.campanha?.valorBolao || 0), 0);

  const stats = [
    { title: 'Campanhas Ativas', value: String(activeCampaignsCount), icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Apostado', value: `R$ ${totalApostado.toFixed(2).replace('.', ',')}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Campanhas Encerradas', value: String(closedCampaignsCount), icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
    { title: 'Apostas Pendentes', value: String(pendingBetsCount), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  const recentBets = bets.slice(0, 3).map(b => ({
    id: b.id,
    campanha: b.campanhaOpcao?.campanha?.nome || '',
    opcao: b.campanhaOpcao?.descricao || '',
    valor: Number(b.campanhaOpcao?.campanha?.valorBolao || 0),
    status: b.status === 'CONFIRMADA' ? 'Confirmada' : b.status === 'PENDENTE' ? 'Pendente' : 'Cancelada',
    date: new Date(b.dtCriacao).toLocaleDateString('pt-BR')
  }));

  const featuredCampaigns = campaigns.filter(c => c.status === 'ABERTA').slice(0, 2);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando painel...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.nome || 'Usuário'}!</h1>
        <p className="text-gray-600">Confira o resumo das suas atividades no BolãoBet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Últimas Apostas</CardTitle>
              <Link to="/minhas-apostas" className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver todas</Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">Campanha</th>
                      <th className="pb-3 font-medium">Opção</th>
                      <th className="pb-3 font-medium">Valor</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBets.map((bet) => (
                      <tr key={bet.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 font-medium text-gray-900">{bet.campanha}</td>
                        <td className="py-3 text-gray-600">{bet.opcao}</td>
                        <td className="py-3 text-gray-900 font-medium">R$ {bet.valor.toFixed(2).replace('.', ',')}</td>
                        <td className="py-3">
                          <Badge variant={bet.status === 'Confirmada' ? 'success' : bet.status === 'Pendente' ? 'warning' : 'error'}>
                            {bet.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-gray-500">{bet.date}</td>
                      </tr>
                    ))}
                    {recentBets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">Nenhuma aposta realizada ainda.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas em Destaque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredCampaigns.map((campanha) => (
                <div key={campanha.id} className="flex gap-4 items-center p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{campanha.nome}</p>
                    <p className="text-xs text-gray-500 truncate">Valor: R$ {Number(campanha.valorBolao).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <Link to={`/campanhas/${campanha.id}`} className="text-xs font-medium text-blue-600 px-2 py-1 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                    Participar
                  </Link>
                </div>
              ))}
              {featuredCampaigns.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">Nenhuma campanha em destaque.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
