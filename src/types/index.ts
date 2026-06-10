export type User = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  status: string;
  role?: 'ADMIN' | 'USER';
};

export type Campaign = {
  id: number;
  nome: string;
  codigo_campanha: string;
  taxa_operacional: number;
  valor_bolao: number;
  dt_inicio: string;
  dt_fim: string;
  status: string;
  tipo_campanha_id: number;
  opcoes?: CampaignOption[];
};

export type CampaignOption = {
  id: number;
  descricao: string;
  status: string;
  eh_resultado_final: boolean;
  campanha_id: number;
};

export type Bet = {
  id: number;
  usuario_id: number;
  campanha_opcao_id: number;
  meio_pagamento_id: number;
  comprovante?: string;
  status: string;
  dt_criacao: string;
  campanha?: Campaign;
  opcao?: CampaignOption;
};
