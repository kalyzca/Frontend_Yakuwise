export interface LoginData {
  usuario: string;
  password: string;
}

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
  };
}
