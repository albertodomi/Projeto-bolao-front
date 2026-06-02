import { useEffect, useState, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Campanha {
  id: number;
  nome: string;
  dtInicio: string;
  dtFim: string;
  status: string;
  valorBolao: string;
}

export default function UserDashboard() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const { signOut, user } = useContext(AuthContext);

  useEffect(() => {
    async function fetchCampanhas() {
      try {
        const response = await api.get('/campanhas');
        setCampanhas(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCampanhas();
  }, []);

  const abertas = campanhas.filter(c => c.status === 'ABERTA');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white p-4 shadow flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Bolão</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Olá, {user?.nome}</span>
          <Link to="/minhas-apostas" className="text-sm font-medium text-blue-600 hover:underline">Minhas Apostas</Link>
          <button onClick={signOut} className="text-sm text-red-600 hover:underline">Sair</button>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl p-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Campanhas Abertas</h2>
        {abertas.length === 0 ? (
          <p className="text-gray-600">Nenhuma campanha aberta no momento.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {abertas.map(campanha => (
              <div key={campanha.id} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="mb-2 text-lg font-bold text-blue-600">{campanha.nome}</h3>
                <p className="mb-1 text-sm text-gray-600">
                  <span className="font-medium">Valor Aposta:</span> R$ {Number(campanha.valorBolao).toFixed(2)}
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  <span className="font-medium">Término:</span> {new Date(campanha.dtFim).toLocaleDateString()}
                </p>
                <Link 
                  to={`/campanha/${campanha.id}`} 
                  className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
                >
                  Ver Detalhes e Apostar
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
