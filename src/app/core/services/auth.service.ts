import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'trampohub_token';
const USERNAME_KEY = 'trampohub_username';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
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
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/token/`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          this.setUsername(credentials.username);
        }),
      );
  }

  logout(): void {
    this.clearToken();
    this.clearUsername();
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
}
