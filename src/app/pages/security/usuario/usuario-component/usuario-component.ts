import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AlertService, ButtonComponent } from "../../../../shared";
import { RouterLink } from "@angular/router";
import { CommonModule, UpperCasePipe, TitleCasePipe } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UsuarioModalComponent } from '../../modals/usuario-modal-component/usuario-modal-component';
import { UserData, UsersListResponse } from '../../../../shared/interfaces/usuario-interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../../../../shared/services/users.service';
import { MatChipsModule } from '@angular/material/chips';
import { ResetPassModalComponent } from '../../modals/resetPassword/reset-pass-modal-component/reset-pass-modal-component';
import { PaginatedListStore } from '../../../../shared/state/paginated-list.store';
import { mapUserFromApiResponse } from '../../../../shared/mappers/usuario-mapper';
import { resolveEstadoSearch } from '../../../../shared/utils/list-query.util';

@Component({
  selector: 'app-usuario-component',
  imports: [CommonModule, ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, MatSnackBarModule, FormsModule, MatIconModule, MatButtonModule, MatChipsModule, UpperCasePipe,TitleCasePipe],
  templateUrl: './usuario-component.html',
  styleUrl: './usuario-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioComponent extends PaginatedListStore {
  private readonly dialog = inject(MatDialog);
  private readonly usersService = inject(UsersService);
  private readonly alertService = inject(AlertService);

  protected readonly sortFieldMap: Record<string, string> = {
    'id': 'id_usuario',
    'username': 'nombre_usuario',
    'name': 'persona__nombres',
    'role': 'id_rol',
    'state': 'estado'
  };
  protected readonly defaultOrdering = 'id_usuario';

  displayedColumns: string[] = ['id', 'username', 'name', 'role', 'state', 'actions'];

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  users = signal<UserData[]>([]);

  readonly totalUsers = this.total;

  constructor() {
    super();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    this.usersService.getUsers(this.listQueryParams()).subscribe({
      next: (response: UsersListResponse) => {
        const mappedUsers = response.results
          .map(user => mapUserFromApiResponse(user))
          .filter((user): user is UserData => user !== null);
        this.users.set(mappedUsers);
        this.total.set(response.count);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error("Error al cargar usuarios. Por favor, inténtelo de nuevo.");
        this.isLoading.set(false);
      }
    });
  }

  protected override load(): void {
    this.loadUsers();
  }

  displayedUsers = computed(() => {
    const currentUsers = this.users();
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) {
      return currentUsers;
    }

    const estado = resolveEstadoSearch(search);
    if (estado) {
      return currentUsers.filter(user => user.state.toLowerCase() === estado.toLowerCase());
    }

    return currentUsers.filter(user => {
      const userNameLower = user.username?.toLowerCase() || '';
      const emailLower = user.email.toLowerCase();
      const nameLower = user.name?.toLowerCase() || '';
      const userIdStr = user.id?.toString() || '';

      return emailLower.includes(search) || nameLower.includes(search) || userIdStr.includes(search) || userNameLower.includes(search);
    });
  });

  filteredUsersCount = computed(() => {
    return this.displayedUsers().length;
  });

  createUser(user?: UserData): void {
    const dialogRef = this.dialog.open(UsuarioModalComponent, {
      height: 'max-content',
      data: user,
      disableClose: true,
      panelClass: 'custom-responsive-modal-user'
    });

    dialogRef.afterClosed().subscribe((result: { action?: string } | undefined) => {
      if (!result) return;

      if (result.action === 'success') {
        this.loadUsers();
        const message = user?.id ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente';
        this.alertService.success(message);
      }
    });
  }

  viewUser(user: UserData): void {
    this.dialog.open(UsuarioModalComponent, {
      height: 'max-content',
      data: { ...user, isReadOnly: true },
      disableClose: true,
      panelClass: 'custom-responsive-modal-user'
    });
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
        this.loadUsers();
      }
    });
  }

}
