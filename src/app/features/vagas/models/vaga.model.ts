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
  criado_em?: string;
}
