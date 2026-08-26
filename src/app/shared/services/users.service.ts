import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/services/api-config.service';
import { CreateUserRequest, GetUsersParams, UserResponse, UsersListResponse } from '../interfaces/usuario-interface';

@Injectable({
  providedIn: 'root'
})

export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  createUser(userData: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      this.apiConfig.usersEndpoint(),
      userData
    );
  }

  getUsers(params: GetUsersParams = {}): Observable<UsersListResponse> {
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

    return this.http.get<UsersListResponse>(
      this.apiConfig.usersEndpoint(),
      { params: httpParams }
    );
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiConfig.usersEndpoint()}${id}/`);
  }

  updateUser(id: number, userData: Partial<CreateUserRequest>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiConfig.usersEndpoint()}${id}/`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.usersEndpoint()}${id}/`);
  }

  resetPassword(idUsuario: number): Observable<void> {
    return this.http.post<void>(
      this.apiConfig.resetPasswordEndpoint(),
      { id_usuario: idUsuario }
    );
  }
}
