import { CreateUserRequest, UserData, UserResponse } from '../interfaces/usuario-interface';
import { ESTADO_ACTIVO, ESTADO_INACTIVO } from '../utils/list-query.util';
import { toTitleCase } from '../utils/text.util';

export function mapUserToApiRequest(userData: UserData): CreateUserRequest {
  return {
    username: userData.username || '',
    email_institucional: userData.email,
    estado: userData.state === ESTADO_ACTIVO,
    persona: { ...userData.persona },
    id_roles: userData.id_roles || []
  };
}

export function mapUserFromApiResponse(apiResponse: UserResponse): UserData | null {
  const persona = apiResponse.persona;
  if (!persona) return null;

  return {
    id: apiResponse.id_usuario,
    username: apiResponse.nombre_usuario,
    email: apiResponse.email_institucional,
    state: apiResponse.estado ? ESTADO_ACTIVO : ESTADO_INACTIVO,
    name: `${persona.apellido_paterno} ${persona.apellido_materno}, ${toTitleCase(persona.nombres)}`,
    id_roles: apiResponse.roles?.map(role => role.id_rol) || [],
    roles_names: apiResponse.roles?.map(role => toTitleCase(role.nombre_rol)) || [],
    persona: persona,
    bloqueado_hasta: apiResponse.bloqueado_hasta
  };
}
