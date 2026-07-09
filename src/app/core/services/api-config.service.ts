import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  // URL base del servidor API
  private readonly baseUrl = signal('http://127.0.0.1:8000');

  // Endpoint específico para roles
  readonly rolesEndpoint = signal(`${this.baseUrl()}/security/roles/`);

  // Endpoint específico para usuarios
  readonly usersEndpoint = signal(`${this.baseUrl()}/security/usuarios/`);

  // Endpoint específico para tipos de documento
  readonly tiposDocumentoEndpoint = signal(`${this.baseUrl()}/security/tipos-documento/`);

  constructor() {}

  // Método para obtener la URL base
  getBaseUrl(): string {
    return this.baseUrl();
  }

  // Método para construir URLs completas
  buildUrl(endpoint: string): string {
    return `${this.baseUrl()}${endpoint}`;
  }
}
