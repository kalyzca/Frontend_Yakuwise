import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AppHttpError, BackendErrorBody } from '../interfaces/error-interface';

// Aplana los detalles del backend (incluidos los anidados, p.ej. `persona`)
// en un mapa campo -> mensajes.
const aplanarDetalles = (
  valor: unknown,
  campo: string,
  acumulado: Record<string, string[]>
): void => {
  if (Array.isArray(valor)) {
    acumulado[campo] = valor.map(String);
    return;
  }

  if (valor !== null && typeof valor === 'object') {
    for (const [campoAnidado, valorAnidado] of Object.entries(valor)) {
      aplanarDetalles(valorAnidado, campoAnidado, acumulado);
    }
    return;
  }

  acumulado[campo] = [String(valor)];
};

const parseDetalles = (body: BackendErrorBody | null): Record<string, string[]> | undefined => {
  if (!body?.detalles) {
    return undefined;
  }

  const mapaErrores: Record<string, string[]> = {};
  for (const [campo, valor] of Object.entries(body.detalles)) {
    aplanarDetalles(valor, campo, mapaErrores);
  }

  return Object.keys(mapaErrores).length > 0 ? mapaErrores : undefined;
};

const parseBody = (error: unknown): BackendErrorBody | null =>
  error !== null && typeof error === 'object' ? (error as BackendErrorBody) : null;

const construirError = (
  status: number,
  mensajeGeneral: string,
  statusText?: string,
  detalles?: Record<string, string[]>
): AppHttpError => {
  const error: AppHttpError = { status, mensajeGeneral, statusText };
  if (detalles) {
    error.detalles = detalles;
  }
  return error;
};

export const errorParserInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: unknown) => {
      // Los errores que no provienen de la respuesta HTTP (p.ej. fallas dentro
      // del pipeline) se propagan sin transformarlos para no ocultar su causa.
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      const body = parseBody(err.error);
      const detalles = parseDetalles(body);

      // Solo una sesión activa puede expirar: en un 401 sin sesión (p.ej. login
      // con credenciales inválidas) se conserva el mensaje del backend.
      if (err.status === 401 && authService.isLoggedIn()) {
        authService.clearSession();
        void router.navigate(['/login']);
        return throwError(() =>
          construirError(
            401,
            body?.error || 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            err.statusText,
            detalles
          )
        );
      }

      if (err.status === 0) {
        return throwError(() =>
          construirError(
            0,
            'No se pudo conectar al servidor. Revisa tu conexion.',
            err.statusText
          )
        );
      }

      return throwError(() =>
        construirError(
          err.status,
          body?.error || 'Ocurrió un problema inesperado en el servidor.',
          err.statusText,
          detalles
        )
      );
    })
  );
};
