import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  // URL base del servidor API
  private readonly baseUrl = signal(environment.apiBaseUrl);

  // Endpoint específico para roles
  readonly rolesEndpoint = signal(`${this.baseUrl()}/security/roles/`);

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

  constructor() {}

  // Método para obtener la URL base
  getBaseUrl(): string {
    return this.baseUrl();
  }

  // Método para construir URLs completas
  buildUrl(endpoint: string): string {
    return `${this.baseUrl()}${endpoint}`;
  }

  // Indica si una URL apunta a la API propia (evita enviar credenciales a terceros)
  isApiUrl(url: string): boolean {
    const base = this.baseUrl();
    if (!base) {
      return !/^[a-z][a-z\d+\-.]*:\/\//i.test(url);
    }
    return url === base || url.startsWith(`${base}/`);
  }
}
