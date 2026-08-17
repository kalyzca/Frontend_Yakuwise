import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';
import { CreateRoleRequest, RoleResponse, RolesListResponse, GetRolesParams } from '../interfaces/roles-interface';
import { buildListHttpParams } from '../utils/http-params.util';

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
    return this.http.get<RolesListResponse>(
      this.apiConfig.rolesEndpoint(),
      { params: buildListHttpParams(params) }
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
