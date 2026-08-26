import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AlertService, ButtonComponent } from "../../../../shared";
import { RouterLink } from "@angular/router";
import { CommonModule, UpperCasePipe, TitleCasePipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UsuarioModalComponent } from '../../modals/usuario-modal-component/usuario-modal-component';
import { UserData, UserResponse, UsersListResponse } from '../../../../shared/interfaces/usuario-interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../../../../shared/services/users.service';
import { MatChipsModule } from '@angular/material/chips';
import { ResetPassModalComponent } from '../../modals/resetPassword/reset-pass-modal-component/reset-pass-modal-component';


@Component({
  selector: 'app-usuario-component',
  imports: [CommonModule, ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, MatSnackBarModule, FormsModule, MatIconModule, MatButtonModule, MatChipsModule, UpperCasePipe,TitleCasePipe],
  templateUrl: './usuario-component.html',
  styleUrl: './usuario-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UsuarioComponent {
  private readonly dialog = inject(MatDialog);
  private readonly usersService = inject(UsersService);
  private readonly alertService = inject(AlertService);

  private readonly DISPLAYED_COLUMNS = ['id', 'username', 'name', 'role', 'state', 'actions'];
  private readonly ESTADO_BUSQUEDA_PALABRAS = ['activo', 'inactivo', 'act', 'inac', 'ina', 'activ', 'inactiv'];
  private readonly ACTIVO_VARIACIONES = ['act', 'activ', 'activo'];
  private readonly INACTIVO_VARIACIONES = ['inac', 'ina', 'inactiv', 'inactivo'];
  private readonly DEFAULT_PAGE_SIZE = 5;
  private readonly DEFAULT_ORDERING = 'id_usuario';

  readonly displayedColumns = this.DISPLAYED_COLUMNS;
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly users = signal<UserData[]>([]);
  readonly totalUsers = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(this.DEFAULT_PAGE_SIZE);
  readonly activeSort = signal<Sort>({ active: '', direction: '' });
  readonly searchTerm = signal<string>('');

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    const ordering = this.buildOrdering();
    const searchParam = this.buildSearchParam();

    this.usersService.getUsers({
      search: searchParam,
      ordering: ordering,
      page: this.pageIndex(),
      page_size: this.pageSize()
    }).subscribe({
      next: (response: UsersListResponse) => this.handleUsersResponse(response),
      error: () => this.handleLoadError()
    });
  }

  private buildOrdering(): string {
    const sort = this.activeSort();
    if (!sort.active || !sort.direction) {
      return this.DEFAULT_ORDERING;
    }

    const field = this.mapSortField(sort.active);
    const direction = sort.direction === 'asc' ? '' : '-';
    return `${direction}${field}`;
  }

  private buildSearchParam(): string | undefined {
    const rawSearch = this.searchTerm().toLowerCase().trim();
    const esBusquedaDeEstado = this.ESTADO_BUSQUEDA_PALABRAS.includes(rawSearch);

    return esBusquedaDeEstado ? undefined : (this.searchTerm() || undefined);
  }

  private handleUsersResponse(response: UsersListResponse): void {
    const mappedUsers = response.results
      .map(user => this.mapFromApiResponse(user))
      .filter((user): user is UserData => user !== null);

    this.users.set(mappedUsers);
    this.isLoading.set(false);
    this.totalUsers.set(response.count);
  }

  private handleLoadError(): void {
    this.alertService.error("Error al cargar usuarios. Por favor, inténtelo de nuevo.");
    this.isLoading.set(false);
  }

  private readonly FIELD_MAP: Record<string, string> = {
    'id': 'id_usuario',
    'username': 'nombre_usuario',
    'name': 'persona__nombres',
    'role': 'id_rol',
    'state': 'estado'
  };

  private mapSortField(field: string): string {
    return this.FIELD_MAP[field] || field;
  }

  displayedUsers = computed(() => {
    const currentUsers = this.users();
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) {
      return currentUsers;
    }

    return currentUsers.filter(user => this.matchesSearch(user, search));
  });

  private matchesSearch(user: UserData, search: string): boolean {
    if (this.isEstadoSearch(search)) {
      return this.matchesEstado(user.state, search);
    }

    return this.matchesGeneralFields(user, search);
  }

  private isEstadoSearch(search: string): boolean {
    return ['activo', 'inactivo'].includes(search) ||
           this.ACTIVO_VARIACIONES.includes(search) ||
           this.INACTIVO_VARIACIONES.includes(search);
  }

  private matchesEstado(userState: string, search: string): boolean {
    const userStateLower = userState.toLowerCase();

    if (this.ACTIVO_VARIACIONES.includes(search)) {
      return userStateLower === 'activo';
    }

    if (this.INACTIVO_VARIACIONES.includes(search)) {
      return userStateLower === 'inactivo';
    }

    return userStateLower === search;
  }

  private matchesGeneralFields(user: UserData, search: string): boolean {
    const userNameLower = user.username?.toLowerCase() || '';
    const emailLower = user.email.toLowerCase();
    const nameLower = user.name?.toLowerCase() || '';
    const userIdStr = user.id?.toString() || '';

    return emailLower.includes(search) ||
           nameLower.includes(search) ||
           userIdStr.includes(search) ||
           userNameLower.includes(search);
  }

  filteredUsersCount = computed(() => {
    return this.displayedUsers().length;
  });

  paginatorPageIndex = computed(() => this.pageIndex() - 1);

  onSearchChange(value: string): void {
    this.searchTerm.set(value ?? '');
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.activeSort.set(sort);
    this.pageIndex.set(1);
    this.loadUsers();
  }

  private mapFromApiResponse(apiResponse: UserResponse): UserData | null {
    if (!apiResponse.persona) {
      return null;
    }

    return {
      id: apiResponse.id_usuario,
      username: apiResponse.nombre_usuario,
      email: apiResponse.email_institucional,
      state: this.formatEstado(apiResponse.estado),
      name: apiResponse.persona.nombres + ' ' + apiResponse.persona.apellido_paterno + ' ' + apiResponse.persona.apellido_materno,
      id_roles: this.extractRoleIds(apiResponse.roles),
      roles_names: this.extractRoleNames(apiResponse.roles),
      persona: apiResponse.persona,
      bloqueado_hasta: apiResponse.bloqueado_hasta
    };
  }

  private formatEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }

  private extractRoleIds(roles: any[]): number[] {
    return roles?.map(r => r.id_rol) || [];
  }

  private extractRoleNames(roles: any[]): string[] {
    return roles?.map(r => this.capitalizeRoleName(r.nombre_rol)) || [];
  }

  private capitalizeRoleName(roleName: string): string {
    return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
  }

  createUser(user?: UserData): void {
    this.openUserModal(user, false);
  }

  viewUser(user: UserData): void {
    this.openUserModal(user, true);
  }

  private openUserModal(data: UserData | undefined, isReadOnly: boolean): void {
    const dialogRef = this.dialog.open(UsuarioModalComponent, {
      height: 'max-content',
      data: data ? { ...data, isReadOnly } : undefined,
      disableClose: true,
      panelClass: 'custom-responsive-modal-user'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action !== 'cancel') {
        this.loadUsers();
      }
    });
  }

  resetPassword(user?: UserData): void {
    const dialogRef = this.dialog.open(ResetPassModalComponent, {
      width: '25rem',
      minWidth: 'auto',
      height: '21rem',
      data: user,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
        this.alertService.success("Se ha restablecido la contraseña.");
      }
    });
  }
  
}
