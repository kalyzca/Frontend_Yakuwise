import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';
import { CreateModuloRequest, ModuloResponse, ModulosListResponse, GetModulosParams } from '../interfaces/modulos-interface';

@Injectable({
  providedIn: 'root'
})

export class ModulosService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  
  createModulo(moduloData: CreateModuloRequest): Observable<ModuloResponse> {
    return this.http.post<ModuloResponse>(
      this.apiConfig.modulosEndpoint(),
      moduloData
    );
  }

  getModulos(params: GetModulosParams = {}): Observable<ModulosListResponse> {
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

    return this.http.get<ModulosListResponse>(
      this.apiConfig.modulosEndpoint(),
      { params: httpParams }
    );
  }

  getModuloById(id: number): Observable<ModuloResponse> {
    return this.http.get<ModuloResponse>(`${this.apiConfig.modulosEndpoint()}${id}/`);
  }

  updateModulo(id: number, moduloData: Partial<CreateModuloRequest>): Observable<ModuloResponse> {
    return this.http.put<ModuloResponse>(`${this.apiConfig.modulosEndpoint()}${id}/`, moduloData);
  }

  deleteModulo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.modulosEndpoint()}${id}/`);
  }

}
