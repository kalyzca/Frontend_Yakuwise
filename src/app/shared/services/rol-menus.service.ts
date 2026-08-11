import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';
import { CreateRolMenuRequest, RolMenuResponse, RolMenusListResponse, GetRolMenusParams } from '../interfaces/rol-menus-interface';

@Injectable({
  providedIn: 'root'
})

export class RolMenusService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  
  createRolMenu(rolMenuData: CreateRolMenuRequest): Observable<RolMenuResponse> {
    return this.http.post<RolMenuResponse>(
      this.apiConfig.rolMenusEndpoint(),
      rolMenuData
    );
  }

  getRolMenus(params: GetRolMenusParams = {}): Observable<RolMenusListResponse> {
    let httpParams = new HttpParams();

    if (params.id_rol !== undefined && params.id_rol !== null) {
      httpParams = httpParams.set('id_rol', params.id_rol.toString());
    }

    if (params.id_menu !== undefined && params.id_menu !== null) {
      httpParams = httpParams.set('id_menu', params.id_menu.toString());
    }

    if (params.page !== undefined && params.page !== null) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params.page_size !== undefined && params.page_size !== null) {
      httpParams = httpParams.set('page_size', params.page_size.toString());
    }

    return this.http.get<RolMenusListResponse>(
      this.apiConfig.rolMenusEndpoint(),
      { params: httpParams }
    );
  }

  deleteRolMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.rolMenusEndpoint()}${id}/`);
  }
}
