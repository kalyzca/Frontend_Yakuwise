import { Injectable, WritableSignal, computed, inject, Signal } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { AppHttpError } from '../interfaces/error-interface';
import { AlertService } from './alert.service';

export interface UnifiedError {
  kind: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})

export class FormErrorService {
  private readonly alertService = inject(AlertService);

  /**
   * Muestra el mensaje general de un error del backend y publica sus errores por campo.
   */
  handleBackendError(
    err: AppHttpError,
    backendErrorsSignal: WritableSignal<Record<string, string[]>>,
    isLoadingSignal?: WritableSignal<boolean>
  ): void {
    isLoadingSignal?.set(false);
    this.alertService.error(err.mensajeGeneral);

    if (err.detalles) backendErrorsSignal.set(err.detalles);
  }
  
  createFieldTracker(formFieldSignal: any, backendErrorsSignal: Signal<Record<string, string[]>>, campoNombre: string) {
    const errores = computed<UnifiedError[]>(() => {
      const frontendErrors = formFieldSignal().errors() || [];
      const listaBackend = backendErrorsSignal()[campoNombre] || [];

      const backendMapeados = listaBackend.map((msg, index) => ({
        kind: `backend-${campoNombre}-${index}`,
        message: msg
      }));

      return [...frontendErrors, ...backendMapeados];
    });

    const mostrarErrores = computed(() => {
      const tieneErrorFrontend = formFieldSignal().invalid() && formFieldSignal().touched();
      const tieneErrorBackend = (backendErrorsSignal()[campoNombre] || []).length > 0;
      return tieneErrorFrontend || tieneErrorBackend;
    });

    const matcher: ErrorStateMatcher = {
      isErrorState: () => {
        const tieneErrorFrontend = formFieldSignal().invalid() && formFieldSignal().touched();
        const tieneErrorBackend = (backendErrorsSignal()[campoNombre] || []).length > 0;
        return tieneErrorFrontend || tieneErrorBackend;
      }
    };

    return {
      errores,
      mostrarErrores,
      matcher
    };
  }

  limpiarCampoBackend(backendErrorsSignal: any, campoNombre: string) {
    if (backendErrorsSignal()[campoNombre]) {
      backendErrorsSignal.update((erroresActuales: any) => {
        const copia = { ...erroresActuales };
        delete copia[campoNombre];
        return copia;
      });
    }
  }
}
