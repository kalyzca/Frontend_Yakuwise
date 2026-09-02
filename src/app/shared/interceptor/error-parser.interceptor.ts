import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

function processNestedValue(valor: any): Record<string, string[]> {
  const subObjeto: Record<string, string[]> = {};
  
  for (const [subCampo, subValor] of Object.entries(valor)) {
    if (Array.isArray(subValor)) {
      subObjeto[subCampo] = subValor.map(String);
    } else {
      subObjeto[subCampo] = [String(subValor)];
    }
  }
  
  return subObjeto;
}

function processErrorDetalles(detalles: any): Record<string, any> {
  const mapaErrores: Record<string, any> = {};

  for (const [campo, valor] of Object.entries(detalles)) {
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      mapaErrores[campo] = processNestedValue(valor);
    } else if (Array.isArray(valor)) {
      mapaErrores[campo] = valor.map(String);
    } else {
      mapaErrores[campo] = [String(valor)];
    }
  }
  
  return mapaErrores;
}

function buildErrorResponse(err: HttpErrorResponse, body: any, mapaErrores: any) {
  return throwError(() => ({
    status: err.status,
    mensajeGeneral: body?.error || 'Ocurrió un problema inesperado en el servidor.',
    ...(mapaErrores && Object.keys(mapaErrores).length > 0 && { detalles: mapaErrores })
  }));
}

export const errorParserInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authService.clearSession();
        router.navigate(['/login']);
        return throwError(() => ({ status: 401, mensajeGeneral: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }));
      }
      
      if (err.status === 0) {
        return throwError(() => ({ status: 0, mensajeGeneral: 'No se pudo conectar al servidor. Revisa tu conexión.' }));
      }

      const body = err.error && typeof err.error === 'object' ? (err.error as any) : null;
      let mapaErrores: any = null;

      if (body?.detalles && typeof body.detalles === 'object') {
        mapaErrores = processErrorDetalles(body.detalles);
      }

      return buildErrorResponse(err, body, mapaErrores);
    })
  );
};
