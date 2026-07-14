import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface LoginRequest {
  nombre_usuario: string;
  password: string;
}

export interface UpdatePasswordRequest {
  password_actual: string;
  password_nueva: string;
  password_confirmacion: string;
}

export interface LoginResponse {
  message: string;
  data: {
    id_usuario: number;
    nombre_usuario: string;
    email_institucional: string;
    nombre_completo: string;
    last_login: string;
    pass_actualizado: boolean;
    token: string;
  };
}

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

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
