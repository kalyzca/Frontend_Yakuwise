import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';

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

export interface GetTiposDocumentoParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TiposDocumentoService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  // Obtener tipos de documento con parámetros de búsqueda, paginación y ordenamiento
  getTiposDocumento(params: GetTiposDocumentoParams = {}): Observable<TiposDocumentoListResponse> {
    let httpParams = new HttpParams();

    if (params.search !== undefined && params.search !== null) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.ordering !== undefined && params.ordering !== null) {
      httpParams = httpParams.set('ordering', params.ordering);
    }

    if (params.page !== undefined && params.page !== null) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params.page_size !== undefined && params.page_size !== null) {
      httpParams = httpParams.set('page_size', params.page_size.toString());
    }

    return this.http.get<TiposDocumentoListResponse>(
      this.apiConfig.tiposDocumentoEndpoint(),
      { params: httpParams }
    );
  }

  // Obtener un tipo de documento por ID
  getTipoDocumentoById(id: number): Observable<TipoDocumentoResponse> {
    return this.http.get<TipoDocumentoResponse>(`${this.apiConfig.tiposDocumentoEndpoint()}${id}/`);
  }
}
