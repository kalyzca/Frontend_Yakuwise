import { MenuResponse } from './menus-interface';

export interface ModuloData {
  id?: number;
  name: string;
  state: string;
  menus?: MenuData[];
}

export interface MenuData {
  id?: number;
  nivel: number;
  orden?: number;
  ruta: string;
  id_modulo: number;
  nombre_modulo: string;
  nombre_menu: string;
  state: string;
}

export interface CreateModuloRequest {
  nombre_modulo: string;
  estado: boolean;
}

export interface ModuloResponse {
  id?: number;
  id_modulo?: number;
  nombre_modulo: string;
  estado: boolean;
  menus_asociados?: MenuResponse[];
}

export interface ModulosListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ModuloResponse[];
}

export interface GetModulosParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
