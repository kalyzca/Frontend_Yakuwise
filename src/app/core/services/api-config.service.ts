import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  // URL base del servidor API
  private readonly baseUrl = signal('http://127.0.0.1:8000');

  // Endpoint específico para roles
  readonly rolesEndpoint = signal(`${this.baseUrl()}/security/roles/`);

  // Endpoint específico para módulos
  readonly modulosEndpoint = signal(`${this.baseUrl()}/security/modulos/`);

  // Endpoint específico para menús
  readonly menusEndpoint = signal(`${this.baseUrl()}/security/menus/`);

  // Endpoint específico para usuarios
  readonly usersEndpoint = signal(`${this.baseUrl()}/security/usuarios/`);

  // Endpoint específico para tipos de documento
  readonly tiposDocumentoEndpoint = signal(`${this.baseUrl()}/security/tipos-documento/`);

  // Endpoint específico para restablecer contraseña
  readonly resetPasswordEndpoint = signal(`${this.baseUrl()}/security/reset-password/`);

  // Endpoint específico para login
  readonly loginEndpoint = signal(`${this.baseUrl()}/security/login/`);

  // Endpoint específico para actualizar contraseña
  readonly updatePasswordEndpoint = signal(`${this.baseUrl()}/security/update-password/`);

  // Endpoint específico para restablecer contraseña por correo
  readonly resetPasswordCorreoEndpoint = signal(`${this.baseUrl()}/security/reset-password-correo/`);

  // Endpoint específico para logout
  readonly logoutEndpoint = signal(`${this.baseUrl()}/security/logout/`);

  // Endpoint específico para obtener datos del usuario actual
  readonly currentUserEndpoint = signal(`${this.baseUrl()}/security/me/`);

  // Endpoint específico para rol-menus
  readonly rolMenusEndpoint = signal(`${this.baseUrl()}/security/rol-menus/`);

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
