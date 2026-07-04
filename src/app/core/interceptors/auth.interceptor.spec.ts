import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('anexa o header Authorization quando ha token', (done) => {
    authServiceSpy.getToken.and.returnValue('abc123');
    const req = new HttpRequest('GET', '/api/perfil/me/');
    const next: HttpHandlerFn = (r) => {
      expect(r.headers.get('Authorization')).toBe('Token abc123');
      return of() as any;
    };

    interceptor(req, next).subscribe({ complete: done });
  });

  it('desloga o usuario quando a API responde 401 com token presente', (done) => {
    authServiceSpy.getToken.and.returnValue('abc123');
    const req = new HttpRequest('GET', '/api/perfil/me/');
    const erro401 = new HttpErrorResponse({ status: 401 });
    const next: HttpHandlerFn = () => throwError(() => erro401);

    interceptor(req, next).subscribe({
      error: () => {
        expect(authServiceSpy.logout).toHaveBeenCalled();
        done();
      },
    });
  });

  it('nao desloga em 401 quando nao havia token (evita loop antes do login)', (done) => {
    authServiceSpy.getToken.and.returnValue(null);
    const req = new HttpRequest('GET', '/api/vagas/');
    const erro401 = new HttpErrorResponse({ status: 401 });
    const next: HttpHandlerFn = () => throwError(() => erro401);

    interceptor(req, next).subscribe({
      error: () => {
        expect(authServiceSpy.logout).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
