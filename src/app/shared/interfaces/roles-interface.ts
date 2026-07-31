export interface RoleData {
  id?: number;
  name:string;
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
