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
  id_rol: number;
  id_roles?: number[];
  persona: PersonaData;
  name?: string;
  roles_names?: string[];
}