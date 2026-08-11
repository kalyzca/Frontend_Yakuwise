import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';
import { CreateMenuRequest, MenuResponse, MenusListResponse, GetMenusParams } from '../interfaces/menus-interface';

@Injectable({
  providedIn: 'root'
})

export class MenusService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  
  createMenu(menuData: CreateMenuRequest): Observable<MenuResponse> {
    return this.http.post<MenuResponse>(
      this.apiConfig.menusEndpoint(),
      menuData
    );
  }

  getMenus(params: GetMenusParams = {}): Observable<MenusListResponse> {
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

    if (params.id_modulo !== undefined && params.id_modulo !== null) {
      httpParams = httpParams.set('id_modulo', params.id_modulo.toString());
    }

    return this.http.get<MenusListResponse>(
      this.apiConfig.menusEndpoint(),
      { params: httpParams }
    );
  }

  getMenuById(id: number): Observable<MenuResponse> {
    return this.http.get<MenuResponse>(`${this.apiConfig.menusEndpoint()}${id}/`);
  }

  updateMenu(id: number, menuData: Partial<CreateMenuRequest>): Observable<MenuResponse> {
    return this.http.put<MenuResponse>(`${this.apiConfig.menusEndpoint()}${id}/`, menuData);
  }

  patchMenuOrder(id: number, orden: number): Observable<MenuResponse> {
    return this.http.patch<MenuResponse>(`${this.apiConfig.menusEndpoint()}${id}/`, { orden });
  }

  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.menusEndpoint()}${id}/`);
  }

}
