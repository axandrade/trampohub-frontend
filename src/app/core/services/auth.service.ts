import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'trampohub_token';
const USERNAME_KEY = 'trampohub_username';
const TIPO_KEY = 'trampohub_tipo';
const NOME_EMPRESA_KEY = 'trampohub_nome_empresa';

export type TipoUsuario = 'empregador' | 'candidato';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface PerfilResponse {
  tipo: TipoUsuario;
  nome_empresa?: string;
}

export interface CadastroPayload {
  username: string;
  password: string;
  tipo: TipoUsuario;
  nome_empresa?: string;
  foto?: File | null;
  email?: string;
}

export interface CadastroResponse {
  detail: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/token/`, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUsername(credentials.username);
      }),
      switchMap((response) =>
        this.http.get<PerfilResponse>(`${environment.apiUrl}/perfil/me/`).pipe(
          tap((perfil) => {
            this.setTipo(perfil.tipo);
            this.setNomeEmpresa(perfil.nome_empresa ?? null);
          }),
          map(() => response),
        ),
      ),
    );
  }

  register(payload: CadastroPayload): Observable<CadastroResponse> {
    const formData = new FormData();
    formData.append('username', payload.username);
    formData.append('password', payload.password);
    formData.append('tipo', payload.tipo);
    if (payload.nome_empresa) {
      formData.append('nome_empresa', payload.nome_empresa);
    }
    if (payload.foto) {
      formData.append('foto', payload.foto);
    }
    if (payload.email) {
      formData.append('email', payload.email);
    }
    return this.http.post<CadastroResponse>(`${environment.apiUrl}/cadastro/`, formData);
  }

  logout(): void {
    this.clearToken();
    this.clearUsername();
    this.clearTipo();
    this.clearNomeEmpresa();
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(USERNAME_KEY);
  }

  getTipo(): TipoUsuario | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(TIPO_KEY) as TipoUsuario | null;
  }

  isEmpresa(): boolean {
    return this.getTipo() === 'empregador';
  }

  getNomeEmpresa(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(NOME_EMPRESA_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private clearToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private setUsername(username: string): void {
    if (this.isBrowser) {
      localStorage.setItem(USERNAME_KEY, username);
    }
  }

  private clearUsername(): void {
    if (this.isBrowser) {
      localStorage.removeItem(USERNAME_KEY);
    }
  }

  private setTipo(tipo: TipoUsuario): void {
    if (this.isBrowser) {
      localStorage.setItem(TIPO_KEY, tipo);
    }
  }

  private clearTipo(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TIPO_KEY);
    }
  }

  private setNomeEmpresa(nomeEmpresa: string | null): void {
    if (!this.isBrowser) {
      return;
    }
    if (nomeEmpresa) {
      localStorage.setItem(NOME_EMPRESA_KEY, nomeEmpresa);
    } else {
      localStorage.removeItem(NOME_EMPRESA_KEY);
    }
  }

  private clearNomeEmpresa(): void {
    if (this.isBrowser) {
      localStorage.removeItem(NOME_EMPRESA_KEY);
    }
  }
}
