import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../../services/api';
import type { Bet } from '../../../types';
import { toast } from 'react-toastify';

export default function AdminBets() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');

  const fetchBets = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      // By default, api.get('/apostas') returns all bets for admins
      const response = await api.get('/apostas');
      setBets(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar apostas');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: 'CONFIRMADA' | 'CANCELADA') => {
    try {
      await api.patch(`/apostas/${id}/status`, { status: newStatus });
      toast.success(`Aposta ${newStatus.toLowerCase()} com sucesso!`);
      // Update local state to reflect changes instantly
      setBets(bets.map(bet => bet.id === id ? { ...bet, status: newStatus } : bet));
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar status da aposta');
    }
  };

  const filteredBets = bets
    .filter(bet => {
      if (statusFilter !== 'TODAS' && bet.status !== statusFilter) return false;
      
      const searchLower = searchTerm.toLowerCase();
      // Search by user name or CPF
      const userName = (bet as any).usuario?.nome?.toLowerCase() || '';
      const userCpf = (bet as any).usuario?.cpf?.toLowerCase() || '';
      // Search by campaign name
      const campaignName = (bet as any).campanhaOpcao?.campanha?.nome?.toLowerCase() || '';
      
      return userName.includes(searchLower) || userCpf.includes(searchLower) || campaignName.includes(searchLower);
    })
    .sort((a, b) => {
      // Always show PENDENTE first
      if (a.status === 'PENDENTE' && b.status !== 'PENDENTE') return -1;
      if (a.status !== 'PENDENTE' && b.status === 'PENDENTE') return 1;
      return new Date(b.dt_criacao).getTime() - new Date(a.dt_criacao).getTime();
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Apostas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Valide e confirme os pagamentos das apostas realizadas.
          </p>
        </div>
        <button
          onClick={() => fetchBets(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          Atualizar Lista
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por usuário, CPF ou campanha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[200px]"
        >
          <option value="TODAS">Todos os Status</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="CONFIRMADA">Confirmadas</option>
          <option value="CANCELADA">Canceladas</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Campanha e Opção</th>
                <th className="px-6 py-4">Meio de Pagamento</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw size={24} className="animate-spin text-blue-500" />
                      <p>Carregando apostas...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle size={32} className="text-slate-300" />
                      <p>Nenhuma aposta encontrada.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-900">{(bet as any).usuario?.nome}</p>
                      <p className="text-xs text-slate-500">{(bet as any).usuario?.cpf}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{(bet as any).campanhaOpcao?.campanha?.nome || 'Campanha Excluída'}</p>
                      <p className="text-xs text-slate-500">Opção: {(bet as any).campanhaOpcao?.descricao || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{(bet as any).meioPagamento?.descricao || 'Desconhecido'}</span>
                        {bet.comprovante && (
                          <a
                            href={bet.comprovante}
                            target="_blank"
                            rel="noreferrer"
                            title="Ver Comprovante"
                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1 rounded transition-colors flex items-center gap-1"
                          >
                            <FileText size={16} />
                            <span className="text-xs hidden lg:inline">Ver</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(bet.dt_criacao).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        bet.status === 'CONFIRMADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        bet.status === 'PENDENTE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          bet.status === 'CONFIRMADA' ? 'bg-emerald-500' :
                          bet.status === 'PENDENTE' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`} />
                        {bet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {bet.status === 'PENDENTE' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              if(window.confirm('Tem certeza que deseja APROVAR este pagamento?')) {
                                handleUpdateStatus(bet.id, 'CONFIRMADA');
                              }
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Aprovar Pagamento"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => {
                              if(window.confirm('Tem certeza que deseja REJEITAR este pagamento?')) {
                                handleUpdateStatus(bet.id, 'CANCELADA');
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Rejeitar Pagamento"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
