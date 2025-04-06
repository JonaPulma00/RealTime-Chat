import { HttpInterceptorFn } from '@angular/common/http';
import { RegistreService } from '../services/registre.service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const registreService = inject(RegistreService);
  const token = registreService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq).pipe(
      catchError((err) => {
        if (err.status === 403) { 
          return registreService.refreshToken().pipe(
            switchMap((res) => {
              sessionStorage.setItem('tokenVerificacio', res.token);
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.token}`
                }
              });
              return next(newReq);
            }),
            catchError((refreshErr) => {
              sessionStorage.removeItem('tokenVerificacio');
              sessionStorage.removeItem('refreshToken');
              return throwError(() => refreshErr);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
  return next(req);
};