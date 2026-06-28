import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';

// Interfaces para los datos de roles
export interface CreateRoleRequest {
  nombre_rol: string;
  estado: boolean;
}

export interface RoleResponse {
  id?: number;
  id_rol?: number;
  nombre_rol: string;
  estado: boolean;
}

export interface RolesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RoleResponse[];
}

export interface GetRolesParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  // Crear un nuevo rol
  createRole(roleData: CreateRoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(
      this.apiConfig.rolesEndpoint(),
      roleData
    );
  }

  // Obtener roles con parámetros de búsqueda, paginación y ordenamiento
  getRoles(params: GetRolesParams = {}): Observable<RolesListResponse> {
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

    return this.http.get<RolesListResponse>(
      this.apiConfig.rolesEndpoint(),
      { params: httpParams }
    );
  }

  // Obtener un rol por ID
  getRoleById(id: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiConfig.rolesEndpoint()}${id}/`);
  }

  // Actualizar un rol
  updateRole(id: number, roleData: Partial<CreateRoleRequest>): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.apiConfig.rolesEndpoint()}${id}/`, roleData);
  }

  // Eliminar un rol
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.rolesEndpoint()}${id}/`);
  }
}
