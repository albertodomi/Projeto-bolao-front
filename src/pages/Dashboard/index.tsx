import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Trophy, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { title: 'Campanhas Ativas', value: '12', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Apostado', value: 'R$ 450,00', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Campanhas Encerradas', value: '4', icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
    { title: 'Apostas Pendentes', value: '2', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  const recentBets = [
    { id: 1, campanha: 'Brasileirão 2026', opcao: 'Flamengo Campeão', valor: 50, status: 'Confirmada', date: '28/05/2026' },
    { id: 2, campanha: 'Copa do Mundo 2026', opcao: 'Brasil Hexa', valor: 100, status: 'Pendente', date: '27/05/2026' },
    { id: 3, campanha: 'Libertadores 2026', opcao: 'Palmeiras', valor: 30, status: 'Confirmada', date: '25/05/2026' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Olá, João!</h1>
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
                          <Badge variant={bet.status === 'Confirmada' ? 'success' : 'warning'}>
                            {bet.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-gray-500">{bet.date}</td>
                      </tr>
                    ))}
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
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 items-center p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Campeonato {i}</p>
                    <p className="text-xs text-gray-500 truncate">Prêmio estimado: R$ 1.500</p>
                  </div>
                  <Link to="/campanhas/1" className="text-xs font-medium text-blue-600 px-2 py-1 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                    Participar
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
