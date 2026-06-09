import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { Search, Filter, Shield, User, Ban, CheckCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    try {
      await api.patch(`/usuarios/${id}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      toast.success('Status do usuário atualizado!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao atualizar status do usuário');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.cpf.includes(searchTerm)) &&
    (statusFilter === '' || u.status === statusFilter)
  );

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
        <p className="text-gray-600">Visualize e controle o acesso dos usuários no sistema</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF..."
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
                { label: 'Todos', value: '' },
                { label: 'Ativos', value: 'ATIVO' },
                { label: 'Inativos', value: 'INATIVO' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="px-6 py-4 font-medium">Usuário</th>
                  <th className="px-6 py-4 font-medium">CPF</th>
                  <th className="px-6 py-4 font-medium">Perfil</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={cn("transition-colors", u.status === 'INATIVO' ? "bg-gray-50/50" : "hover:bg-gray-50/50")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          {u.role === 'ADMIN' ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <div>
                          <p className={cn("font-medium", u.status === 'INATIVO' ? "text-gray-500" : "text-gray-900")}>{u.nome}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{u.cpf}</td>
                    <td className="px-6 py-4">
                      <Badge variant={u.role === 'ADMIN' ? 'info' : 'default'}>{u.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.status === 'ATIVO' ? 'success' : 'error'}>{u.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => toggleStatus(u.id, u.status)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ml-auto transition-colors cursor-pointer",
                            u.status === 'ATIVO' 
                              ? "text-red-600 bg-red-50 hover:bg-red-100" 
                              : "text-green-600 bg-green-50 hover:bg-green-100"
                          )}
                        >
                          {u.status === 'ATIVO' ? (
                            <><Ban size={14} /> Inativar</>
                          ) : (
                            <><CheckCircle size={14} /> Ativar</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 font-medium">
                      Nenhum usuário encontrado.
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
