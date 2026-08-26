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

export interface UserData {
  id?: number;
  username?: string;
  email: string;
  state: string;
  id_roles?: number[];
  persona: PersonaData;
  name?: string;
  roles_names?: string[];
  bloqueado_hasta?: string | null;
}

export interface UserFormData {
  username: string;
  email: string;
  state: string;
  id_roles: number[];
  name: string;
  roles_names: string[];
  persona: PersonaData;
}

export interface CreateUserRequest {
  username?: string;
  email_institucional: string;
  estado: boolean;
  persona: PersonaData;
  id_roles: number[];
}

export interface UserResponse {
  id_usuario: number;
  nombre_usuario: string;
  email_institucional: string;
  estado: boolean;
  persona: PersonaData;
  roles: Array<{ id_rol: number; nombre_rol: string }>;
  bloqueado_hasta: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;
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