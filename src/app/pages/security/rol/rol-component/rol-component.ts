import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from "../../../../shared";
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
import { RolModalComponent, RoleData } from '../../modals/rol-modal-component/rol-modal-component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RolesService, CreateRoleRequest, RoleResponse, RolesListResponse } from '../../../../shared/services/roles.service';

@Component({
  selector: 'app-rol-component',
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, MatSnackBarModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './rol-component.html',
  styleUrl: './rol-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolComponent {
  private readonly dialog = inject(MatDialog);
  private readonly rolesService = inject(RolesService);
  private readonly snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'name', 'state', 'actions'];

  // Signals para manejar estados de carga y error
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Guardamos todos los roles originales devueltos por la API
  roles = signal<RoleData[]>([]);
  // Signal para el total de roles (para el paginador)
  totalRoles = signal<number>(0);

  // Señales para controlar la paginación
  pageIndex = signal<number>(1);
  pageSize = signal<number>(5);
  activeSort = signal<Sort>({ active: '', direction: '' });

  searchTerm = signal<string>('');

  constructor() {
    // Cargar roles al iniciar el componente
    this.loadRoles();
  }

  // Método para cargar roles desde el API
  loadRoles(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Mapear el ordenamiento de Angular Material al formato del API
    let ordering = '';
    if (this.activeSort()?.active && this.activeSort()?.direction) {
      const field = this.mapSortField(this.activeSort().active);
      const direction = this.activeSort().direction === 'asc' ? '' : '-';
      ordering = `${direction}${field}`;
    }

    const rawSearch = this.searchTerm().toLowerCase().trim();

    // SOLUCIÓN: Si es una palabra de estado, NO se la enviamos a la API para que no falle.
    // Si es un nombre de rol normal, sí lo enviamos.
    const palabrasEstado = ['activo', 'inactivo', 'act', 'inac', 'ina', 'activ', 'inactiv'];
    const esBusquedaDeEstado = palabrasEstado.includes(rawSearch);
    const apiSearchParam = esBusquedaDeEstado ? undefined : (this.searchTerm() || undefined);

    this.rolesService.getRoles({
      search: apiSearchParam, // Solo enviamos texto si no es "activo/inactivo"
      ordering: ordering || 'id_rol',
      page: this.pageIndex(),
      page_size: this.pageSize()
      // Eliminamos el parámetro 'estado' que rompía tu API
    }).subscribe({
      next: (response: RolesListResponse) => {
        const mappedRoles = response.results.map(role => this.mapFromApiResponse(role));
        this.roles.set(mappedRoles);
        this.totalRoles.set(response.count);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
        this.error.set('Error al cargar roles. Por favor, inténtelo de nuevo.');
        this.isLoading.set(false);
      }
    });
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'id': 'id_rol',
      'name': 'nombre_rol',
      'state': 'estado'
    };
    return fieldMap[field] || field;
  }

  // SEÑAL COMPUTADA: Filtra de manera fulminante en el navegador cualquier coincidencia
  displayedRoles = computed(() => {
    const currentRoles = this.roles();
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) {
      return currentRoles;
    }

    return currentRoles.filter(role => {
      const roleNameLower = role.name.toLowerCase();
      const roleStateLower = role.state.toLowerCase();
      const roleIdStr = role.id?.toString() || '';

      if (['activo', 'inactivo'].includes(search)) {
        return roleStateLower === search;
      }

      // Si busca por abreviaciones de estado
      if (['act', 'activ', 'activa'].includes(search)) {
        return roleStateLower === 'activo';
      }
      if (['inac', 'ina', 'inactiv', 'inactiva'].includes(search)) {
        return roleStateLower === 'inactivo';
      }
      // Si no es una palabra de estado, busca normalmente por nombre o ID usando .includes()
      return roleNameLower.includes(search) || roleIdStr.includes(search);
    });
  });

  // Señal computada para actualizar dinámicamente el paginador con los resultados filtrados
  filteredRolesCount = computed(() => {
    return this.displayedRoles().length;
  });

  paginatorPageIndex = computed(() => this.pageIndex() - 1);

  onSearchChange(value: string): void {
    this.searchTerm.set(value ?? '');

    // Si busca un texto normal o vacía el input, refresca desde el API.
    // Si busca un estado, la señal computada 'displayedRoles' filtrará los 5 registros en pantalla al instante.
    this.loadRoles();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadRoles();
  }

  onSortChange(sort: Sort): void {
    this.activeSort.set(sort);
    this.pageIndex.set(1);
    this.loadRoles();
  }

  private mapToApiRequest(roleData: RoleData): CreateRoleRequest {
    return {
      nombre_rol: roleData.name,
      estado: roleData.state === 'Activo'
    };
  }

  private mapFromApiResponse(apiResponse: RoleResponse): RoleData {
    return {
      id: apiResponse.id_rol || apiResponse.id || 0,
      name: apiResponse.nombre_rol,
      state: apiResponse.estado ? 'Activo' : 'Inactivo'
    };
  }

  createRole(role?: RoleData): void {
    const dialogRef = this.dialog.open(RolModalComponent, {
      width: '450px',
      data: role,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: RoleData | undefined) => {
      if (!result) return;

      if (role?.id) {
        this.isLoading.set(true);
        this.error.set(null);
        const apiRequest = this.mapToApiRequest(result);

        this.rolesService.updateRole(role.id, apiRequest).subscribe({
          next: () => {
            this.loadRoles();
            this.isLoading.set(false);
            // Mostrar alerta de éxito
            this.snackBar.open('Rol actualizado exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Error al actualizar el rol:', err);
            this.error.set('Error al actualizar el rol. Por favor, inténtelo de nuevo.');
            this.isLoading.set(false);
            // Mostrar alerta de error con mensaje del backend si está disponible
            const errorMessage = err.error?.detail || err.error?.message || 'Error al actualizar el rol. Por favor, inténtelo de nuevo.';
            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      } 
      else {
        // MODO CREACIÓN: Consumimos el endpoint del API
        this.isLoading.set(true);
        this.error.set(null);

        const apiRequest = this.mapToApiRequest(result);

        this.rolesService.createRole(apiRequest).subscribe({
          next: (apiResponse) => {
            this.loadRoles();
            this.isLoading.set(false);
            // Mostrar alerta de éxito
            this.snackBar.open('Rol creado exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Error al crear el rol:', err);
            this.error.set('Error al crear el rol. Por favor, inténtelo de nuevo.');
            this.isLoading.set(false);
            // Mostrar alerta de error con mensaje del backend si está disponible
            const errorMessage = err.error?.detail || err.error?.message || 'Error al crear el rol. Por favor, inténtelo de nuevo.';
            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
}
