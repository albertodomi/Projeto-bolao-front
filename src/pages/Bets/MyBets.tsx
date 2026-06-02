import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Calendar, Trophy, XCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function MyBets() {
  const [filter, setFilter] = useState('');

  const mockBets = [
    { id: 1, campanha: 'Brasileirão 2026', opcao: 'Flamengo Campeão', meio_pagamento: 'PIX', status: 'VENCEDORA', valor: 50, date: '2026-05-10', status_campanha: 'ENCERRADA' },
    { id: 2, campanha: 'Copa do Mundo 2026', opcao: 'Brasil Hexa', meio_pagamento: 'Cartão de Crédito', status: 'EM ABERTO', valor: 100, date: '2026-05-27', status_campanha: 'ATIVA' },
    { id: 3, campanha: 'Libertadores 2026', opcao: 'Palmeiras', meio_pagamento: 'PIX', status: 'PERDEDORA', valor: 30, date: '2026-05-25', status_campanha: 'ENCERRADA' },
  ];

  const filteredBets = mockBets.filter(bet => {
    if (filter === '') return true;
    return bet.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VENCEDORA': return <Trophy size={20} className="text-green-600" />;
      case 'PERDEDORA': return <XCircle size={20} className="text-red-600" />;
      case 'EM ABERTO': return <Clock size={20} className="text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VENCEDORA': return 'bg-green-50 border-green-200';
      case 'PERDEDORA': return 'bg-red-50 border-red-200';
      case 'EM ABERTO': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Apostas</h1>
          <p className="text-gray-600">Acompanhe o histórico e os resultados das suas apostas</p>
        </div>
        <div className="w-full sm:w-64">
          <Select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { label: 'Todas as Apostas', value: '' },
              { label: 'Em Aberto', value: 'EM ABERTO' },
              { label: 'Vencedoras', value: 'VENCEDORA' },
              { label: 'Perdedoras', value: 'PERDEDORA' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBets.map(bet => (
          <Card key={bet.id} className={cn("overflow-hidden border-l-4 transition-all hover:shadow-md", 
            bet.status === 'VENCEDORA' ? 'border-l-green-500' : 
            bet.status === 'PERDEDORA' ? 'border-l-red-500' : 
            'border-l-blue-500'
          )}>
            <CardContent className="p-0 flex flex-col md:flex-row">
              <div className={cn("p-6 flex flex-col justify-center items-center shrink-0 w-full md:w-32", getStatusColor(bet.status))}>
                {getStatusIcon(bet.status)}
                <span className="text-xs font-bold mt-2 uppercase text-center w-full">{bet.status}</span>
              </div>
              <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Campanha</p>
                  <p className="font-semibold text-gray-900">{bet.campanha}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Sua Opção</p>
                  <p className="font-semibold text-gray-900">{bet.opcao}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Pagamento</p>
                  <p className="text-sm text-gray-700">{bet.meio_pagamento}</p>
                  <p className="font-bold text-gray-900 mt-1">R$ {bet.valor.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="space-y-1 md:text-right flex flex-col md:items-end justify-center">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Calendar size={14} />
                    <span>{new Date(bet.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <Badge variant={bet.status_campanha === 'ATIVA' ? 'success' : 'default'}>
                    Campanha {bet.status_campanha}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredBets.length === 0 && (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            Nenhuma aposta encontrada com este filtro.
          </div>
        )}
      </div>
    </div>
  );
}
