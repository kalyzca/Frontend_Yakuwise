import { ListQueryParams, PaginatedResponse } from './list-query-interface';

export interface RoleData {
  id?: number;
  nombre_rol:string;
  state: string;
}

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

export type RolesListResponse = PaginatedResponse<RoleResponse>;

export type GetRolesParams = ListQueryParams;
