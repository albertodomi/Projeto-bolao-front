import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, UploadCloud, FileText, Image as ImageIcon, X } from 'lucide-react';
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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Formato inválido. Aceitamos apenas JPG, PNG ou PDF.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
      toast.error('O arquivo deve ter no máximo 5MB.');
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleConfirm = async () => {
    if (!paymentMethod) {
      toast.error('Selecione um meio de pagamento.');
      return;
    }

    const selectedMethod = paymentMethods.find(m => String(m.id) === paymentMethod);
    if (selectedMethod?.exigeComprovante && !file) {
      toast.error('Este meio de pagamento exige o envio de comprovante.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/apostas', {
        campanha_opcao_id: Number(opcaoId),
        meio_pagamento_id: Number(paymentMethod),
        comprovante: file ? file.name : undefined
      });
      toast.success('Aposta realizada com sucesso!');
      navigate('/minhas-apostas');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao realizar aposta. Tente novamente.';
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
          <p className="text-gray-600">Finalize sua aposta anexando o comprovante</p>
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
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Comprovante de Pagamento {requiresReceipt && <span className="text-red-500">* (Obrigatório)</span>}
            </label>
            {!file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-sm font-medium text-blue-600">Clique para anexar ou arraste o arquivo</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG ou PDF (Máx. 5MB)</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 flex gap-4 items-start bg-gray-50">
                <div className="shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    file.type === 'application/pdf' ? <FileText size={32} className="text-gray-400" /> : <ImageIcon size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={removeFile} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>
            )}
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
