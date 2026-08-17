import { HttpParams } from '@angular/common/http';
import { ListQueryParams } from '../interfaces/list-query-interface';

/** Construye los query params de un listado omitiendo los valores nulos o no definidos. */
export function buildListHttpParams(params: ListQueryParams = {}): HttpParams {
  let httpParams = new HttpParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      httpParams = httpParams.set(key, String(value));
    }
  }

  return httpParams;
}
