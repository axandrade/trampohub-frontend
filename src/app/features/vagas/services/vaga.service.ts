import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NovaVagaPayload, Vaga } from '../models/vaga.model';

@Injectable({
  providedIn: 'root',
})
export class VagaService {
  private readonly http = inject(HttpClient);

  list(): Observable<Vaga[]> {
    return this.http.get<Vaga[]>(`${environment.apiUrl}/vagas/`);
  }

  create(payload: NovaVagaPayload): Observable<Vaga> {
    return this.http.post<Vaga>(`${environment.apiUrl}/vagas/`, payload);
  }

  update(id: string, payload: NovaVagaPayload): Observable<Vaga> {
    return this.http.patch<Vaga>(`${environment.apiUrl}/vagas/${id}/`, payload);
  }
}
