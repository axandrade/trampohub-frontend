import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Token ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      // token so pode ter expirado/sido invalidado se a requisicao saiu com um
      // token anexado; sem isso um 401 antes do login geraria logout em loop
      if (token && error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
