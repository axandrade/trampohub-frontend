export interface Vaga {
  id: string;
  titulo: string;
  descricao: string;
  empresa: string;
  localizacao?: string;
  salario?: string;
  tipo_contrato?: string;
  modalidade?: string;
  empregador_id: number;
  data_inicio?: string;
  data_fim?: string;
  status?: 'Aberta' | 'Expirada';
  criado_em?: string;
}

export interface NovaVagaPayload {
  titulo: string;
  descricao: string;
  empresa: string;
  localizacao?: string;
  salario?: string;
  tipo_contrato?: string;
  modalidade?: string;
  data_inicio?: string;
  data_fim: string;
}
