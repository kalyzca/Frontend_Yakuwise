export interface  BackendErrorBody {
  error: string;
  detalles?: Record<string, string[]>; 
}

export interface AppHttpError {
  mensajeGeneral: string;
  detalles?: Record<string, string[]>;
  status: number;
  statusText?: string;
}