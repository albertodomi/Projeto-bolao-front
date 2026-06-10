import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Search, Filter, Calendar, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/campanhas')
      .then(res => setCampaigns(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Erro ao carregar campanhas');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTA': return <Badge variant="success">Ativa</Badge>;
      case 'ENCERRADA': return <Badge variant="default">Encerrada</Badge>;
      case 'APURADA': return <Badge variant="warning">Apurada</Badge>;
      case 'INATIVA': return <Badge variant="error">Inativa</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredCampaigns = campaigns
    .filter(c => c.status !== 'INATIVA') // Do not show inactive campaigns to normal users
    .filter(c => 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === '' || c.status === statusFilter)
    )
    .sort((a, b) => {
      // Sort ABERTA (active) campaigns to the top
      if (a.status === 'ABERTA' && b.status !== 'ABERTA') return -1;
      if (a.status !== 'ABERTA' && b.status === 'ABERTA') return 1;
      // Then sort by start date descending (newest first)
      return new Date(b.dtInicio).getTime() - new Date(a.dtInicio).getTime();
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-600">Participe dos bolões disponíveis</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="w-full sm:w-48 flex items-center gap-2">
            <Filter className="text-gray-400" size={18} />
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'Todos os Status', value: '' },
                { label: 'Ativas', value: 'ABERTA' },
                { label: 'Apuradas', value: 'APURADA' },
                { label: 'Encerradas', value: 'ENCERRADA' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.map(campanha => {
          const isClosed = campanha.status === 'ENCERRADA' || campanha.status === 'INATIVA';
          const valor = Number(campanha.valorBolao) || 0;
          const taxa = Number(campanha.taxaOperacional) || 0;
          
          return (
            <Card key={campanha.id} className={cn("transition-all duration-200", isClosed ? "opacity-75 bg-gray-50/50" : "hover:shadow-md hover:border-blue-200")}>
              <CardContent className="p-0">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className={cn("p-2 rounded-lg shrink-0", isClosed ? "bg-gray-200 text-gray-500" : "bg-blue-100 text-blue-600")}>
                        <Trophy size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{campanha.nome}</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">Cód: {campanha.codigoCampanha}</p>
                      </div>
                    </div>
                    {getStatusBadge(campanha.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor do Bolão</p>
                      <p className="font-semibold text-gray-900">R$ {valor.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Taxa Operacional</p>
                      <p className="font-medium text-gray-700">{taxa}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>{new Date(campanha.dtInicio).toLocaleDateString('pt-BR')} até {new Date(campanha.dtFim).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <Link to={`/campanhas/${campanha.id}`}>
                    <Button variant={isClosed ? 'outline' : 'primary'} size="sm">
                      {isClosed ? 'Ver Detalhes' : 'Participar'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredCampaigns.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Nenhuma campanha encontrada com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}
