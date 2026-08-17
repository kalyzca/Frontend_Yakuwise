type ErrorDetails = Record<string, unknown>;

function flattenFieldErrors(
  source: ErrorDetails,
  fieldErrors: Record<string, string>,
  skipKeys: string[] = []
): void {
  for (const [key, value] of Object.entries(source)) {
    if (skipKeys.includes(key)) continue;

    if (Array.isArray(value) && value.length > 0) {
      fieldErrors[key] = String(value[0]);
    } else if (typeof value === 'string') {
      fieldErrors[key] = value;
    }
  }
}

/**
 * Extrae los errores por campo de una respuesta de error del backend, aplanando
 * los errores anidados de `persona` al primer nivel.
 */
export function extractFieldErrors(errorResponse: unknown): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!errorResponse || typeof errorResponse !== 'object') return fieldErrors;

  const detalles = (errorResponse as { detalles?: unknown }).detalles ?? errorResponse;

  if (!detalles || typeof detalles !== 'object') return fieldErrors;

  const details = detalles as ErrorDetails;
  flattenFieldErrors(details, fieldErrors, ['persona']);

  const persona = details['persona'];
  if (persona && typeof persona === 'object') {
    flattenFieldErrors(persona as ErrorDetails, fieldErrors);
  }

  return fieldErrors;
}
