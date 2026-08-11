export interface CreateRolMenuRequest {
  id_rol: number;
  id_menu: number;
}

export interface RolMenuResponse {
  id_rol_menus?: number;
  id_rol: number;
  id_menu: number;
  nombre_rol?: string;
  nombre_menu?: string;
}

export interface RolMenusListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RolMenuResponse[];
}

export interface GetRolMenusParams {
  id_rol?: number;
  id_menu?: number;
  page?: number;
  page_size?: number;
}
