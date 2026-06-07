import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Trophy, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campanha, setCampanha] = useState<any>(null);
  const [opcoes, setOpcoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const campRes = await api.get(`/campanhas/${id}`);
        setCampanha(campRes.data);

        const opcoesRes = await api.get(`/campanhas/${id}/opcoes`);
        setOpcoes(opcoesRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar detalhes da campanha');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando detalhes...</div>;
  }

  if (!campanha) {
    return <div className="text-center py-12 text-gray-500">Campanha não encontrada.</div>;
  }

  const isClosed = campanha.status === 'ENCERRADA' || campanha.status === 'INATIVA';
  const isApuracao = campanha.status === 'EM APURAÇÃO' || campanha.status === 'APURADA';
  const hasResult = opcoes.some(o => o.ehResultadoFinal);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTA': return <Badge variant="success">Ativa</Badge>;
      case 'ENCERRADA': return <Badge variant="default">Encerrada</Badge>;
      case 'APURADA': return <Badge variant="warning">Apurada</Badge>;
      case 'INATIVA': return <Badge variant="error">Inativa</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleBetClick = (opcaoId: number) => {
    navigate(`/campanhas/${campanha.id}/apostar?opcao=${opcaoId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/campanhas" className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da Campanha</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Trophy size={32} />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1">{campanha.nome}</CardTitle>
                    <p className="text-sm font-medium text-gray-500 font-sans">
                      Cód: {campanha.codigoCampanha} • Tipo: {campanha.tipoCampanha?.descricao}
                    </p>
                  </div>
                </div>
                {getStatusBadge(campanha.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor da Aposta</p>
                  <p className="text-lg font-bold text-gray-900">R$ {(Number(campanha.valorBolao) || 0).toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Taxa Op.</p>
                  <p className="text-lg font-medium text-gray-700">{Number(campanha.taxaOperacional)}%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Período da Campanha</p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <Calendar size={18} className="text-gray-400" />
                    <span>{new Date(campanha.dtInicio).toLocaleDateString('pt-BR')} até {new Date(campanha.dtFim).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Opções Disponíveis para Aposta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opcoes.map((opcao) => {
                const isOpcaoInativa = opcao.status === 'INATIVA';
                const canBet = !isClosed && !isApuracao && !isOpcaoInativa && !hasResult;
                
                return (
                  <Card key={opcao.id} className={cn("transition-all", isOpcaoInativa ? "opacity-60 bg-gray-50" : "", opcao.ehResultadoFinal ? "border-green-500 bg-green-50/50 shadow-sm" : "")}>
                    <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-semibold text-gray-900 leading-snug">{opcao.descricao}</h4>
                        {opcao.ehResultadoFinal && (
                          <Badge variant="success" className="flex items-center gap-1 shrink-0">
                            <Trophy size={12} />
                            Vencedora
                          </Badge>
                        )}
                        {isOpcaoInativa && <Badge variant="default">Inativa</Badge>}
                      </div>
                      <Button 
                        onClick={() => handleBetClick(opcao.id)}
                        disabled={!canBet} 
                        variant={opcao.ehResultadoFinal ? 'outline' : 'primary'}
                        className="w-full font-sans cursor-pointer"
                      >
                        {isOpcaoInativa ? 'Indisponível' : (isClosed || isApuracao) ? 'Campanha Encerrada' : 'Apostar nesta opção'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {opcoes.length === 0 && (
                <div className="col-span-full text-center py-6 text-gray-500">Nenhuma opção cadastrada para esta campanha.</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Regras de Negócio:</h3>
              <ul className="text-sm space-y-3 text-blue-100">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0 mt-0.5 text-blue-300" />
                  Botão "Apostar" é desabilitado em campanhas encerradas ou apuradas.
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0 mt-0.5 text-blue-300" />
                  Opções inativas não permitem apostas.
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0 mt-0.5 text-blue-300" />
                  A opção vencedora recebe destaque em verde.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
