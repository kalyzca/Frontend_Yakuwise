import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

export const errorParserInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => ({ status: 401, mensajeGeneral: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }));
      }
      if (err.status === 0) {
        return throwError(() => ({ status: 0, mensajeGeneral: 'No se pudo conectar al servidor. Revisa tu conexion.' }));
      }
      const body = err.error && typeof err.error === 'object' ? (err.error as any) : null;
      const mapaErrores: Record<string, string[]> = {};

      if (body?.detalles) {
        for (const [campo, valor] of Object.entries(body.detalles) as [string, any][]) {
          mapaErrores[campo] = Array.isArray(valor)
            ? valor.map(String)
            : [String(valor)];
        }
      }

      return throwError(() => ({
        status: err.status,
        mensajeGeneral: body?.error || 'Ocurrió un problema inesperado en el servidor.',
        ...(Object.keys(mapaErrores).length > 0 && { detalles: mapaErrores })
      }));
    })
  );

};
