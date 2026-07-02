import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Vaga } from '../models/vaga.model';

@Injectable({
  providedIn: 'root',
})
export class VagaService {
  private readonly http = inject(HttpClient);

  list(): Observable<Vaga[]> {
    return this.http.get<Vaga[]>(`${environment.apiUrl}/vagas/`);
  }
}
