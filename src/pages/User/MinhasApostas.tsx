import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface Aposta {
  id: number;
  status: string;
  dtCriacao: string;
  campanhaOpcao: {
    descricao: string;
    campanha: {
      nome: string;
      status: string;
    };
  };
  meioPagamento: {
    descricao: string;
  };
}

export default function MinhasApostas() {
  const { data: apostas = [], isLoading } = useQuery<Aposta[]>({
    queryKey: ['minhasApostas'],
    queryFn: async () => {
      const res = await api.get('/apostas/minhas');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Carregando histórico...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Minhas Apostas</h2>
      
      {apostas.length === 0 ? (
        <p className="text-gray-600">Você ainda não fez nenhuma aposta.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campanha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Palpite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status da Aposta</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apostas.map((aposta) => (
                <tr key={aposta.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(aposta.dtCriacao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aposta.campanhaOpcao.campanha.nome}
                    <span className="ml-2 text-xs text-gray-500">
                      ({aposta.campanhaOpcao.campanha.status})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aposta.campanhaOpcao.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aposta.meioPagamento.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${aposta.status === 'CONFIRMADA' ? 'bg-green-100 text-green-800' : 
                        aposta.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {aposta.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
