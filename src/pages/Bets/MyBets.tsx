import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Calendar, Trophy, XCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../services/api';

export default function MyBets() {
  const [filter, setFilter] = useState('');
  const [bets, setBets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBets = async () => {
    try {
      const res = await api.get('/apostas/minhas');
      setBets(res.data);
    } catch (err) {
      console.error(err);
      // Removed toast.error to avoid spamming the user on every poll failure
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
    const intervalId = setInterval(fetchBets, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const getStatusText = (bet: any) => {
    const campaignStatus = bet.campanhaOpcao?.campanha?.status;
    if (campaignStatus === 'APURADA') {
      return bet.campanhaOpcao?.ehResultadoFinal ? 'VENCEDORA' : 'PERDEDORA';
    }
    return bet.status; // PENDENTE, CONFIRMADA, CANCELADA
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VENCEDORA': return <Trophy size={20} className="text-green-600" />;
      case 'PERDEDORA': return <XCircle size={20} className="text-red-600" />;
      case 'PENDENTE': return <Clock size={20} className="text-yellow-600" />;
      case 'CONFIRMADA': return <Clock size={20} className="text-blue-600" />;
      case 'CANCELADA': return <XCircle size={20} className="text-gray-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VENCEDORA': return 'bg-green-50 border-green-200 text-green-700';
      case 'PERDEDORA': return 'bg-red-50 border-red-200 text-red-700';
      case 'PENDENTE': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'CONFIRMADA': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'CANCELADA': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredBets = bets.filter(bet => {
    const displayStatus = getStatusText(bet);
    if (filter === '') return true;
    return displayStatus === filter;
  });

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
              { label: 'Pendentes', value: 'PENDENTE' },
              { label: 'Confirmadas', value: 'CONFIRMADA' },
              { label: 'Vencedoras', value: 'VENCEDORA' },
              { label: 'Perdedoras', value: 'PERDEDORA' },
              { label: 'Canceladas', value: 'CANCELADA' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBets.map(bet => {
          const displayStatus = getStatusText(bet);
          const valor = Number(bet.campanhaOpcao?.campanha?.valorBolao) || 0;
          const statusCampanha = bet.campanhaOpcao?.campanha?.status;

          return (
            <Card key={bet.id} className={cn("overflow-hidden border-l-4 transition-all hover:shadow-md", 
              displayStatus === 'VENCEDORA' ? 'border-l-green-500' : 
              displayStatus === 'PERDEDORA' ? 'border-l-red-500' : 
              displayStatus === 'PENDENTE' ? 'border-l-yellow-500' :
              displayStatus === 'CANCELADA' ? 'border-l-gray-500' :
              'border-l-blue-500'
            )}>
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className={cn("p-6 flex flex-col justify-center items-center shrink-0 w-full md:w-32", getStatusColor(displayStatus))}>
                  {getStatusIcon(displayStatus)}
                  <span className="text-xs font-bold mt-2 uppercase text-center w-full">{displayStatus}</span>
                </div>
                <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Campanha</p>
                    <p className="font-semibold text-gray-900">{bet.campanhaOpcao?.campanha?.nome}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Sua Opção</p>
                    <p className="font-semibold text-gray-900">{bet.campanhaOpcao?.descricao}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Pagamento</p>
                    <p className="text-sm text-gray-700">{bet.meioPagamento?.descricao}</p>
                    <p className="font-bold text-gray-900 mt-1">R$ {valor.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="space-y-1 md:text-right flex flex-col md:items-end justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                      <Calendar size={14} />
                      <span>{new Date(bet.dtCriacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <Badge variant={statusCampanha === 'ABERTA' ? 'success' : 'default'}>
                      Campanha {statusCampanha}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredBets.length === 0 && !isLoading && (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            Nenhuma aposta encontrada com este filtro.
          </div>
        )}
      </div>
    </div>
  );
}
