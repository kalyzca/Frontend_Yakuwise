import { Sort } from '@angular/material/sort';

export const ESTADO_ACTIVO = 'Activo';
export const ESTADO_INACTIVO = 'Inactivo';

const TERMINOS_ACTIVO = ['act', 'activ', 'activo', 'activa'];
const TERMINOS_INACTIVO = ['ina', 'inac', 'inactiv', 'inactivo', 'inactiva'];

/** Traduce el término buscado a un estado ('Activo' / 'Inactivo') o null si no es una búsqueda de estado. */
export function resolveEstadoSearch(searchTerm: string): string | null {
  const term = searchTerm.toLowerCase().trim();

  if (TERMINOS_INACTIVO.includes(term)) return ESTADO_INACTIVO;
  if (TERMINOS_ACTIVO.includes(term)) return ESTADO_ACTIVO;

  return null;
}

/**
 * Término de búsqueda a enviar al backend: las búsquedas por estado se filtran
 * localmente, por lo que no se envían.
 */
export function resolveApiSearch(searchTerm: string): string | undefined {
  if (resolveEstadoSearch(searchTerm)) return undefined;

  return searchTerm || undefined;
}

/** Construye el parámetro `ordering` del backend a partir del orden activo de la tabla. */
export function buildOrdering(
  sort: Sort | undefined,
  sortFieldMap: Record<string, string>,
  defaultOrdering: string
): string {
  if (!sort?.active || !sort?.direction) return defaultOrdering;

  const field = sortFieldMap[sort.active] || sort.active;
  const direction = sort.direction === 'asc' ? '' : '-';

  return `${direction}${field}`;
}
