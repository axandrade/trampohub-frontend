export interface Candidatura {
  id: string;
  vaga: string;
  candidato_id: number;
  status: string;
  mensagem?: string;
  data_candidatura: string;
}

export interface NovaCandidaturaPayload {
  vaga: string;
  mensagem?: string;
}
