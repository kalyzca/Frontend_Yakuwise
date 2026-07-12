import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';

// Interfaces para los datos de personas
export interface PersonaData {
  id_tipo_documento: number;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  genero: string;
  telefono: string;
  correo_personal: string;
  estado: boolean;
}

// Interfaces para los datos de usuarios
export interface CreateUserRequest {
  email_institucional: string;
  estado: boolean;
  persona: PersonaData;
  id_rol: number;
  id_roles?: number[];
}

export interface UserResponse {
  id?: number;
  id_usuario?: number;
  nombre_usuario?: string;
  email_institucional: string;
  estado: boolean;
  persona: PersonaData;
  id_rol: number;
  id_roles?: number[];
  roles_names?: string[];
  roles?: Array<{ id_rol: number; nombre_rol: string }>;
}

export interface UsersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserResponse[];
}

export interface GetUsersParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

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
    let httpParams = new HttpParams();

    if (params.search !== undefined && params.search !== null) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.ordering !== undefined && params.ordering !== null) {
      httpParams = httpParams.set('ordering', params.ordering);
    }

    if (params.page !== undefined && params.page !== null) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params.page_size !== undefined && params.page_size !== null) {
      httpParams = httpParams.set('page_size', params.page_size.toString());
    }

    return this.http.get<UsersListResponse>(
      this.apiConfig.usersEndpoint(),
      { params: httpParams }
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
