import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
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
  private dialog = inject(MatDialog);
  private rolesService = inject(RolesService);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'name', 'state', 'actions'];

  // Signals para manejar estados de carga y error
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Signal para almacenar los roles desde el API
  roles = signal<RoleData[]>([]);

  // Signal para el total de roles (para el paginador)
  totalRoles = signal<number>(0);

  // Señales para controlar la paginación
  pageIndex = signal<number>(1); // API usa page=1 como primera página
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
    if (this.activeSort().active && this.activeSort().direction) {
      const field = this.mapSortField(this.activeSort().active);
      const direction = this.activeSort().direction === 'asc' ? '' : '-';
      ordering = `${direction}${field}`;
    }

    this.rolesService.getRoles({
      search: this.searchTerm() || undefined,
      ordering: ordering || 'id_rol',
      page: this.pageIndex(),
      page_size: this.pageSize()
    }).subscribe({
      next: (response: RolesListResponse) => {
        // Mapear la respuesta del API al formato local
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

  // Mapear campos de ordenamiento de Angular Material al API
  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'id': 'id_rol',
      'name': 'nombre_rol',
      'state': 'estado'
    };
    return fieldMap[field] || field;
  }

  // SEÑAL COMPUTADA: Los roles ya vienen filtrados y paginados del API
  displayedRoles = computed(() => this.roles());

  // Señal computada para obtener la cantidad total de roles (para el paginador)
  filteredRolesCount = computed(() => this.totalRoles());

  // Señal computada para convertir pageIndex basado en 1 (API) a basado en 0 (Angular Material)
  paginatorPageIndex = computed(() => this.pageIndex() - 1);

  // Controladores de eventos que actualizan las señales y recargan desde el API
  onSearchChange(value: string): void {
    this.pageIndex.set(1); // Reiniciamos a la primera página al buscar
    this.searchTerm.set(value ?? '');
    this.loadRoles(); // Recargar desde el API con los nuevos parámetros
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex + 1); // API usa page=1 como primera página
    this.pageSize.set(event.pageSize);
    this.loadRoles(); // Recargar desde el API con los nuevos parámetros
  }

  onSortChange(sort: Sort): void {
    this.activeSort.set(sort);
    this.pageIndex.set(1); // Reiniciamos a la primera página al ordenar
    this.loadRoles(); // Recargar desde el API con los nuevos parámetros
  }

  // clearTable() {
  //   this.dataSource.data = [];
  // }

  // addData() {
  //   this.dataSource.data = ELEMENT_DATA;
  // }

  // Método auxiliar para mapear RoleData local a CreateRoleRequest del API
  private mapToApiRequest(roleData: RoleData): CreateRoleRequest {
    return {
      nombre_rol: roleData.name,
      estado: roleData.state === 'Activo'
    };
  }

  // Método auxiliar para mapear RoleResponse del API a RoleData local
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
      data: role,// Pasamos el rol completo si estamos editando
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(
      (result: RoleData | undefined) => {
        // Si el usuario canceló el modal, no hacemos nada
        if (!result) return;

        if (role && role.id) {
          // MODO EDICIÓN: Actualizamos el rol en el API
          this.isLoading.set(true);
          this.error.set(null);

          const apiRequest = this.mapToApiRequest(result);

          this.rolesService.updateRole(role.id, apiRequest).subscribe({
            next: (apiResponse) => {
              // Recargamos los roles desde el API para obtener los datos actualizados
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
        } else {
          // MODO CREACIÓN: Consumimos el endpoint del API
          this.isLoading.set(true);
          this.error.set(null);

          const apiRequest = this.mapToApiRequest(result);

          this.rolesService.createRole(apiRequest).subscribe({
            next: (apiResponse) => {
              // Recargamos los roles desde el API para obtener la lista actualizada
              this.pageIndex.set(1); // Reiniciamos a la primera página
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
