/** Capitaliza la primera letra de cada palabra y pasa el resto a minúsculas. */
export function toTitleCase(value: string): string {
  if (!value) return '';

  return value
    .toLowerCase()
    .split(' ')
    .map(word => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}
