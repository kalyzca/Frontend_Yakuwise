import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';
import {
  CreateUserRequest,
  GetUsersParams,
  UserResponse,
  UsersListResponse
} from '../interfaces/usuario-interface';
import { buildListHttpParams } from '../utils/http-params.util';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  // Crear un nuevo usuario
  createUser(userData: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      this.apiConfig.usersEndpoint(),
      userData
    );
  }

  // Obtener usuarios con parámetros de búsqueda, paginación y ordenamiento
  getUsers(params: GetUsersParams = {}): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(
      this.apiConfig.usersEndpoint(),
      { params: buildListHttpParams(params) }
    );
  }

  // Obtener un usuario por ID
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiConfig.usersEndpoint()}${id}/`);
  }

  // Actualizar un usuario
  updateUser(id: number, userData: Partial<CreateUserRequest>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiConfig.usersEndpoint()}${id}/`, userData);
  }

  // Eliminar un usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.usersEndpoint()}${id}/`);
  }

  // Restablecer contraseña de un usuario
  resetPassword(idUsuario: number): Observable<void> {
    return this.http.post<void>(
      this.apiConfig.resetPasswordEndpoint(),
      { id_usuario: idUsuario }
    );
  }
}
