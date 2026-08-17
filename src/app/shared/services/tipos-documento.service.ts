import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';
import { ListQueryParams } from '../interfaces/list-query-interface';
import { buildListHttpParams } from '../utils/http-params.util';

// Interfaces para los datos de tipos de documento
export interface TipoDocumentoResponse {
  id_tipo_documento: number;
  nombre_tipo_documento: string;
  estado: boolean;
}

export interface TiposDocumentoListResponse {
  message: string;
  data: TipoDocumentoResponse[];
}

export type GetTiposDocumentoParams = ListQueryParams;

@Injectable({
  providedIn: 'root'
})
export class TiposDocumentoService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  // Obtener tipos de documento con parámetros de búsqueda, paginación y ordenamiento
  getTiposDocumento(params: GetTiposDocumentoParams = {}): Observable<TiposDocumentoListResponse> {
    return this.http.get<TiposDocumentoListResponse>(
      this.apiConfig.tiposDocumentoEndpoint(),
      { params: buildListHttpParams(params) }
    );
  }

  // Obtener un tipo de documento por ID
  getTipoDocumentoById(id: number): Observable<TipoDocumentoResponse> {
    return this.http.get<TipoDocumentoResponse>(`${this.apiConfig.tiposDocumentoEndpoint()}${id}/`);
  }
}
