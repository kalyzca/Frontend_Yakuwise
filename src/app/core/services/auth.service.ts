import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { LoginRequest, LoginResponse, UpdatePasswordRequest } from '../../shared/interfaces/login-interface';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.apiConfig.loginEndpoint(),
      credentials
    );
  }

  updatePassword(request: UpdatePasswordRequest): Observable<any> {
    return this.http.post(
      this.apiConfig.updatePasswordEndpoint(),
      request
    );
  }

  resetPasswordCorreo(correo: string, nombreUsuario: string): Observable<any> {
    return this.http.post(
      this.apiConfig.resetPasswordCorreoEndpoint(),
      {
        correo: correo,
        nombre_usuario: nombreUsuario
      }
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  saveUserData(userData: LoginResponse['data']): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  getUserData(): LoginResponse['data'] | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): Observable<any> {
    return this.http.post(
      this.apiConfig.logoutEndpoint(),
      {}
    );
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
