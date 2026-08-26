import { Injectable, computed, Signal } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';

export interface UnifiedError {
  kind: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})

export class FormErrorService {
  createFieldTracker(
    formFieldFn: () => any, 
    backendErrorsSignal: Signal<Record<string, string[]>>, 
    campoNombre: string
  ) {
    const errores = computed<UnifiedError[]>(() => {
      const fieldState = formFieldFn();
      const frontendErrors: UnifiedError[] = fieldState?.errors() || [];
      const listaBackend = backendErrorsSignal()[campoNombre] || [];
      const backendMapeados = listaBackend.map((msg, index) => ({
        kind: `backend-${campoNombre}-${index}`,
        message: msg
      }));
      return [...frontendErrors, ...backendMapeados];
    });

    const mostrarErrores = computed(() => {
      const fieldState = formFieldFn();
      const tieneErrorFrontend = fieldState?.invalid() && fieldState?.touched();
      const tieneErrorBackend = (backendErrorsSignal()[campoNombre] || []).length > 0;
      return tieneErrorFrontend || tieneErrorBackend;
    });
    
    const matcher: ErrorStateMatcher = {
      isErrorState: () => {
        return mostrarErrores();
      }
    };

    return {
      errores,
      mostrarErrores,
      matcher
    };
  }

  limpiarCampoBackend(backendErrorsSignal: any, campoNombre: string) {
    if (backendErrorsSignal?.()[campoNombre]) {
      backendErrorsSignal.update((erroresActuales: any) => {
        const copia = { ...erroresActuales };
        delete copia[campoNombre];
        return copia;
      });
    }
  }
}
