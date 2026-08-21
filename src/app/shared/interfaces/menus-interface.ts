export interface CreateMenuRequest {
  nivel: number;
  orden?: number;
  ruta: string;
  id_modulo: number;
  nombre_menu: string;
  estado: boolean;
  id_depende?: number;
}

export interface Role {
  id_rol: number;
  nombre_rol: string;
}

export interface MenuResponse {
  id?: number;
  id_menu?: number;
  nivel: number;
  orden: number;
  ruta: string;
  id_modulo: number;
  nombre_modulo: string;
  nombre_menu: string;
  estado: boolean;
  roles?: Role[];
  id_depende?: number;
}

export interface MenusListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MenuResponse[];
}

export interface GetMenusParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  id_modulo?: number;
}
