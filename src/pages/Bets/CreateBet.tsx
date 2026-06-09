import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { InputText } from '../../components/ui/InputText';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

export default function CreateBet() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const opcaoId = searchParams.get('opcao');
  const navigate = useNavigate();

  const [campanha, setCampanha] = useState<any>(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [comprovante, setComprovante] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const campRes = await api.get(`/campanhas/${id}`);
        setCampanha(campRes.data);

        const opcoesRes = await api.get(`/campanhas/${id}/opcoes`);
        const found = opcoesRes.data.find((o: any) => o.id === Number(opcaoId));
        setOpcaoSelecionada(found);

        const methodsRes = await api.get('/meios-pagamento');
        setPaymentMethods(methodsRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar dados da aposta');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, opcaoId]);

  const handleConfirm = async () => {
    if (!paymentMethod) {
      toast.error('Selecione um meio de pagamento.');
      return;
    }

    const selectedMethod = paymentMethods.find(m => String(m.id) === paymentMethod);
    if (selectedMethod?.exigeComprovante && !comprovante.trim()) {
      toast.error('Este meio de pagamento exige o envio de comprovante.');
      return;
    }

    if (comprovante.trim()) {
      try {
        new URL(comprovante.trim());
      } catch (_) {
        toast.error('O link do comprovante deve ser uma URL válida (ex: https://exemplo.com/comprovante.jpg).');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.post('/apostas', {
        campanha_opcao_id: Number(opcaoId),
        meio_pagamento_id: Number(paymentMethod),
        comprovante: comprovante.trim() || undefined
      });
      toast.success('Aposta realizada com sucesso!');
      navigate('/minhas-apostas');
    } catch (error: any) {
      console.error(error);
      let msg = 'Erro ao realizar aposta. Tente novamente.';
      if (error.response?.data) {
        if (error.response.data.error) {
          msg = error.response.data.error;
          if (error.response.data.details && Array.isArray(error.response.data.details)) {
            msg += `: ${error.response.data.details.map((d: any) => d.message).join(', ')}`;
          }
        } else if (error.response.data.message) {
          msg = error.response.data.message;
        }
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando dados da aposta...</div>;
  }

  if (!campanha || !opcaoSelecionada) {
    return <div className="text-center py-12 text-gray-500 font-medium">Dados da campanha ou opção não encontrados.</div>;
  }

  const selectedMethod = paymentMethods.find(m => String(m.id) === paymentMethod);
  const requiresReceipt = selectedMethod?.exigeComprovante;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/campanhas/${id}`} className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Realizar Aposta</h1>
          <p className="text-gray-600">Finalize sua aposta inserindo o link do comprovante</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <CardTitle>Resumo da Aposta</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Campanha</p>
              <p className="font-bold text-blue-900">{campanha.nome}</p>
            </div>
            <div className="hidden md:block w-px h-10 bg-blue-200"></div>
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Opção Selecionada</p>
              <p className="font-bold text-blue-900">{opcaoSelecionada.descricao}</p>
            </div>
            <div className="hidden md:block w-px h-10 bg-blue-200"></div>
            <div className="md:text-right">
              <p className="text-sm text-blue-600 font-medium mb-1">Valor a Pagar</p>
              <p className="text-xl font-black text-blue-900">R$ {(Number(campanha.valorBolao) || 0).toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Pagamento e Comprovante</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Select 
              label="Meio de Pagamento"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={paymentMethods.map(m => ({ label: m.descricao, value: String(m.id) }))}
            />
          </div>

          <div>
            <InputText 
              label={`Link do Comprovante de Pagamento${requiresReceipt ? ' * (Obrigatório)' : ' (Opcional)'}`}
              placeholder="https://exemplo.com/seu-comprovante.jpg"
              value={comprovante}
              onChange={(e) => setComprovante(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Insira um link direto (URL) para a imagem ou PDF do seu comprovante de pagamento (ex: Google Drive, Dropbox, link de imagem, etc.).
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Link to={`/campanhas/${id}`}>
          <Button variant="outline">Cancelar</Button>
        </Link>
        <Button onClick={handleConfirm} isLoading={isSubmitting}>
          Confirmar Aposta
        </Button>
      </div>
    </div>
  );
}
