import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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
  private readonly SELECTED_ROLE_KEY = 'selected_role';
  private readonly selectedRoleSubject = new BehaviorSubject<number | null>(null);
  selectedRole$ = this.selectedRoleSubject.asObservable();
  private readonly userDataSubject = new BehaviorSubject<LoginResponse['data'] | null>(null);
  userData$ = this.userDataSubject.asObservable();

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
    this.userDataSubject.next(userData);
  }

  getUserData(): LoginResponse['data'] | null {
    const userData = localStorage.getItem(this.USER_KEY);
    const parsedData = userData ? JSON.parse(userData) : null;
    // Only update BehaviorSubject if data actually changed
    if (JSON.stringify(parsedData) !== JSON.stringify(this.userDataSubject.value)) {
      this.userDataSubject.next(parsedData);
    }
    return parsedData;
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
    localStorage.removeItem(this.SELECTED_ROLE_KEY);
    this.userDataSubject.next(null);
    this.selectedRoleSubject.next(null);
  }

  saveSelectedRole(roleId: number): void {
    localStorage.setItem(this.SELECTED_ROLE_KEY, roleId.toString());
    this.selectedRoleSubject.next(roleId);
  }

  getSelectedRole(): number | null {
    const roleId = localStorage.getItem(this.SELECTED_ROLE_KEY);
    return roleId ? Number.parseInt(roleId, 10) : null;
  }

  clearSelectedRole(): void {
    localStorage.removeItem(this.SELECTED_ROLE_KEY);
    this.selectedRoleSubject.next(null);
  }

  getDefaultRole(userData: LoginResponse['data']): number {
    if (userData.roles && userData.roles.length > 0) {
      const adminRole = userData.roles.find(role => role.nombre_rol === 'ADMINISTRADOR');
      if (adminRole) {
        return adminRole.id_rol;
      }
      return userData.roles[0].id_rol;
    }
    return 0;
  }

  refreshUserData(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(
      this.apiConfig.currentUserEndpoint()
    ).pipe(
      tap(response => {
        this.saveUserData(response.data);
      })
    );
  }
}
