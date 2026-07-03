import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Candidatura, NovaCandidaturaPayload } from '../models/candidatura.model';

@Injectable({
  providedIn: 'root',
})
export class CandidaturaService {
  private readonly http = inject(HttpClient);

  create(payload: NovaCandidaturaPayload): Observable<Candidatura> {
    return this.http.post<Candidatura>(`${environment.apiUrl}/candidaturas/`, payload);
  }
}
