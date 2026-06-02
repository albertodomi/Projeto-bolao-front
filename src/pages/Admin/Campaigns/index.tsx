import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Plus, Edit, List, Ban, PlayCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([
    { id: 1, nome: 'Brasileirão 2026', codigo: 'BRA26', status: 'ATIVA', dt_inicio: '2026-05-01', dt_fim: '2026-12-01' },
    { id: 2, nome: 'Copa Libertadores', codigo: 'LIB26', status: 'ATIVA', dt_inicio: '2026-02-01', dt_fim: '2026-11-01' },
    { id: 3, nome: 'Paulistão 2026', codigo: 'PAU26', status: 'ENCERRADA', dt_inicio: '2026-01-15', dt_fim: '2026-04-10' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVA': return <Badge variant="success">Ativa</Badge>;
      case 'ENCERRADA': return <Badge variant="default">Encerrada</Badge>;
      case 'EM APURAÇÃO': return <Badge variant="warning">Em apuração</Badge>;
      case 'INATIVA': return <Badge variant="error">Inativa</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const toggleStatus = (id: number) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        if (c.status === 'ATIVA') return { ...c, status: 'INATIVA' };
        if (c.status === 'INATIVA') return { ...c, status: 'ATIVA' };
      }
      return c;
    }));
  };

  const endCampaign = (id: number) => {
    if (window.confirm('Tem certeza que deseja encerrar esta campanha? Ela entrará em apuração.')) {
      setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'EM APURAÇÃO' } : c));
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
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{c.codigo}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(c.dt_inicio).toLocaleDateString('pt-BR')} - {new Date(c.dt_fim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link to={`/admin/campanhas/${c.id}`} title="Editar">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                            <Edit size={16} />
                          </button>
                        </Link>
                        
                        {(c.status === 'ATIVA' || c.status === 'INATIVA') && (
                          <button 
                            onClick={() => toggleStatus(c.id)}
                            title={c.status === 'ATIVA' ? 'Inativar' : 'Ativar'}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                          >
                            {c.status === 'ATIVA' ? <Ban size={16} /> : <PlayCircle size={16} />}
                          </button>
                        )}

                        {c.status === 'ATIVA' && (
                          <button 
                            onClick={() => endCampaign(c.id)}
                            title="Encerrar / Apurar"
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <List size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
