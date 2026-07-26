import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AlertService, ButtonComponent } from "../../../../shared";
import { RouterLink } from "@angular/router";
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UsuarioModalComponent } from '../../modals/usuario-modal-component/usuario-modal-component';
import { UserData } from '../../../../shared/interfaces/usuario-interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsersService, CreateUserRequest, UserResponse, UsersListResponse } from '../../../../shared/services/users.service';
import { MatChipsModule } from '@angular/material/chips';
import { ResetPassModalComponent } from '../../modals/resetPassword/reset-pass-modal-component/reset-pass-modal-component';
import { UpperCasePipe,TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-usuario-component',
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, MatSnackBarModule, FormsModule, MatIconModule, MatButtonModule, MatChipsModule, UpperCasePipe,TitleCasePipe],
  templateUrl: './usuario-component.html',
  styleUrl: './usuario-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioComponent {
  private readonly dialog = inject(MatDialog);
  private readonly usersService = inject(UsersService);
  private readonly alertService = inject(AlertService);

  displayedColumns: string[] = ['id', 'username', 'name', 'role', 'state', 'actions'];

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  users = signal<UserData[]>([]);
  
  totalUsers = signal<number>(0);
  pageIndex = signal<number>(1);
  pageSize = signal<number>(5);
  activeSort = signal<Sort>({ active: '', direction: '' });

  searchTerm = signal<string>('');

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    let ordering = '';
    if (this.activeSort()?.active && this.activeSort()?.direction) {
      const field = this.mapSortField(this.activeSort().active);
      const direction = this.activeSort().direction === 'asc' ? '' : '-';
      ordering = `${direction}${field}`;
    }

    const rawSearch = this.searchTerm().toLowerCase().trim();
    const palabrasEstado = ['activo', 'inactivo', 'act', 'inac', 'ina', 'activ', 'inactiv'];
    const esBusquedaDeEstado = palabrasEstado.includes(rawSearch);
    const apiSearchParam = esBusquedaDeEstado ? undefined : (this.searchTerm() || undefined);

    this.usersService.getUsers({
      search: apiSearchParam,
      ordering: ordering || 'id_usuario',
      page: this.pageIndex(),
      page_size: this.pageSize()
    }).subscribe({
      next: (response: UsersListResponse) => {
        const mappedUsers = response.results
          .map(user => this.mapFromApiResponse(user))
          .filter((user): user is UserData => user !== null);
        this.users.set(mappedUsers);
        this.totalUsers.set(response.count);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error("Error al cargar usuarios. Por favor, inténtelo de nuevo.");
        this.isLoading.set(false);
      }
    });
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'id': 'id_usuario',
      'username': 'nombre_usuario',
      'name': 'persona__nombres',
      'role': 'id_rol',
      'state': 'estado'
    };
    return fieldMap[field] || field;
  }

  displayedUsers = computed(() => {
    const currentUsers = this.users();
    const search = this.searchTerm().toLowerCase().trim();
    
    if (!search) {
      return currentUsers;
    }

    return currentUsers.filter(user => {
      const userNameLower = user.username?.toLowerCase() || '';
      const emailLower = user.email.toLowerCase();
      const nameLower = user.name?.toLowerCase() || '';
      const userStateLower = user.state.toLowerCase();
      const userIdStr = user.id?.toString() || '';

      if (['activo', 'inactivo'].includes(search)) {
        return userStateLower === search;
      }

      if (['act', 'activ', 'activo'].includes(search)) {
        return userStateLower === 'activo';
      }
      if (['inac', 'ina', 'inactiv', 'inactivo'].includes(search)) {
        return userStateLower === 'inactivo';
      }
      
      return emailLower.includes(search) || nameLower.includes(search) || userIdStr.includes(search) || userNameLower.includes(search);
    });
  });

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

  private mapToApiRequest(userData: UserData): CreateUserRequest {
    return {
      username: userData.username || '',
      email_institucional: userData.email,
      estado: userData.state === 'Activo',
      persona: {
        id_tipo_documento: userData.persona.id_tipo_documento,
        numero_documento: userData.persona.numero_documento,
        nombres: userData.persona.nombres,
        apellido_paterno: userData.persona.apellido_paterno,
        apellido_materno: userData.persona.apellido_materno,
        genero: userData.persona.genero,
        telefono: userData.persona.telefono,
        correo_personal: userData.persona.correo_personal,
        estado: userData.persona.estado
      },
      id_rol: userData.id_rol,
      id_roles: userData.id_roles
    };
  }

  private mapFromApiResponse(apiResponse: UserResponse): UserData | null {
    const persona = apiResponse.persona;
    if (!persona) {
      return null;
    }
    
    const rolesNames = apiResponse.roles?.map(r => r.nombre_rol.charAt(0).toUpperCase() + r.nombre_rol.slice(1).toLowerCase()) || [];
    const rolesIds = apiResponse.roles?.map(r => r.id_rol) || [];
    const apellidoPaterno = persona.apellido_paterno;
    const apellidoMaterno = persona.apellido_materno;
    const nombres = persona.nombres;
    
    const capitalizeNames = (fullName: string): string => {
      if (!fullName) return '';

      return fullName
        .toLowerCase()
        .split(' ')
        .map(word => {
          if (!word) return '';
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
    };
    
    return {
      id: apiResponse.id_usuario || apiResponse.id || 0,
      username: apiResponse.nombre_usuario,
      email: apiResponse.email_institucional,
      state: apiResponse.estado ? 'Activo' : 'Inactivo',
      name: `${apellidoPaterno} ${apellidoMaterno}, ${capitalizeNames(nombres)}`,
      id_rol: rolesIds[0] || 0,
      id_roles: rolesIds,
      roles_names: rolesNames,
      persona: persona
    };
  }

  createUser(user?: UserData): void {
    const dialogRef = this.dialog.open(UsuarioModalComponent, {
      height: 'max-content',
      data: user,
      disableClose: true,
      panelClass: 'custom-responsive-modal-user'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;

      if (result.action === 'success') {
        this.loadUsers();
        const message = user?.id ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente';
        this.alertService.success(message);
      } else if (result.action === 'cancel') {
        return;
      }
    });
  }

  viewUser(user: UserData): void {
    const dialogRef = this.dialog.open(UsuarioModalComponent, {
      height: 'max-content',
      data: { ...user, isReadOnly: true },
      disableClose: true,
      panelClass: 'custom-responsive-modal-user'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;
    });
  }

  // Método para extraer errores de campos específicos del backend
  private extractFieldErrors(errorResponse: any): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    
    if (!errorResponse) return fieldErrors;
    
    const detalles = errorResponse.detalles || errorResponse;
    
    if (typeof detalles === 'object') {
      for (const [key, value] of Object.entries(detalles)) {
        if (key === 'persona') continue;        
        if (Array.isArray(value) && value.length > 0) {
          fieldErrors[key] = value[0];
        } else if (typeof value === 'string') {
          fieldErrors[key] = value;
        }
      }
      
      if (detalles.persona && typeof detalles.persona === 'object') {
        for (const [key, value] of Object.entries(detalles.persona)) {
          if (Array.isArray(value) && value.length > 0) {
            fieldErrors[key] = value[0];
          } else if (typeof value === 'string') {
            fieldErrors[key] = value;
          }
        }
      }
    }
    return fieldErrors;
  }

  resetPassword(user?: UserData): void {
    const dialogRefResetPass = this.dialog.open(ResetPassModalComponent, {
      width: '25rem',
      minWidth: 'auto',
      height: '21rem',
      data: user,
      disableClose: true
    });

    dialogRefResetPass.afterClosed().subscribe((result) => {
      if (result) {
        this.alertService.success("Se ha restablecido la contraseña.");
      }
    });
  }
  
}
