import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';
import { CreateRoleRequest, RoleResponse, RolesListResponse, GetRolesParams } from '../interfaces/roles-interface';

@Injectable({
  providedIn: 'root'
})

export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  
  createRole(roleData: CreateRoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(
      this.apiConfig.rolesEndpoint(),
      roleData
    );
  }

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

    if (params.estado !== undefined && params.estado !== null) {
      httpParams = httpParams.set('estado', params.estado.toString());
    }

    return this.http.get<RolesListResponse>(
      this.apiConfig.rolesEndpoint(),
      { params: httpParams }
    );
  }

  getRoleById(id: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiConfig.rolesEndpoint()}${id}/`);
  }

  updateRole(id: number, roleData: Partial<CreateRoleRequest>): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.apiConfig.rolesEndpoint()}${id}/`, roleData);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.rolesEndpoint()}${id}/`);
  }

}
