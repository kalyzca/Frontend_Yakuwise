export interface LoginRequest {
  nombre_usuario: string;
  password: string;
}

export interface UpdatePasswordRequest {
  password_actual: string;
  password_nueva: string;
  password_confirmacion: string;
}

export interface LoginResponse {
  message: string;
  data: {
    id_usuario: number;
    nombre_usuario: string;
    email_institucional: string;
    nombre_completo: string;
    nombre: string;
    apellido: string;
    genero: string;
    last_login: string;
    pass_actualizado: boolean;
    token: string;
    roles: Array<{
      id_rol: number;
      nombre_rol: string;
    }>;
    modulos: Array<{
      id_modulo: number;
      nombre_modulo: string;
      estado: boolean;
      menus: Array<{
        id_menu: number;
        nivel: number;
        orden: number;
        ruta: string;
        nombre_menu: string;
        id_modulo: number;
        id_depende: number | null;
        estado: boolean;
        roles: Array<{
          id_rol: number;
          nombre_rol: string;
        }>;
      }>;
    }>;
  };
}
