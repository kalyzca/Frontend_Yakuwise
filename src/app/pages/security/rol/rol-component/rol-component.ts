import { Component, computed, inject, signal } from '@angular/core'; 
import { ButtonComponent } from "../../../../shared"; 
import { RouterLink } from "@angular/router"; 
import { MatPaginatorModule } from '@angular/material/paginator'; 
import { MatSortModule } from '@angular/material/sort'; 
import { MatTableModule } from '@angular/material/table'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatDialog } from '@angular/material/dialog'; 
import { FormsModule } from '@angular/forms'; 
import { RolModalComponent } from '../../modals/rol-modal-component/rol-modal-component'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button'; 
import { RolesService } from '../../../../shared/services/roles.service'; 
import { RoleData, RoleResponse, RolesListResponse } from '../../../../shared/interfaces/roles-interface';
import { PaginatedListStore } from '../../../../shared/state/paginated-list.store';
import { ESTADO_ACTIVO, ESTADO_INACTIVO, resolveEstadoSearch } from '../../../../shared/utils/list-query.util';

@Component({
  selector: 'app-rol-component', 
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, FormsModule, MatIconModule, MatButtonModule], 
  templateUrl: './rol-component.html', 
  styleUrl: './rol-component.scss', 
})

export class RolComponent extends PaginatedListStore { 
  private readonly dialog = inject(MatDialog); 
  private readonly rolesService = inject(RolesService); 

  protected readonly sortFieldMap: Record<string, string> = { 'id': 'id_rol', 'name': 'nombre_rol', 'state': 'estado' };
  protected readonly defaultOrdering = 'id_rol';

  displayedColumns: string[] = ['id', 'name', 'state', 'actions']; 
  roles = signal<RoleData[]>([]); 

  readonly totalRoles = this.total;

  constructor() { 
    super();
    this.loadRoles(); 
  } 

  loadRoles(): void { 
    this.rolesService.getRoles(this.listQueryParams()).subscribe({ 
      next: (response: RolesListResponse) => { 
        const mappedRoles = response.results.map(role => this.mapFromApiResponse(role)); 
        this.roles.set(mappedRoles); 
        this.total.set(response.count); 
      },
      error: (error) => {
      console.log('error al obtener roles',error)
      }
    });
  } 

  protected override load(): void {
    this.loadRoles();
  }

  displayedRoles = computed(() => { 
    const currentRoles = this.roles(); 
    const search = this.searchTerm().toLowerCase().trim(); 
    if (!search) { 
      return currentRoles; 
    } 
    const estado = resolveEstadoSearch(search);
    if (estado) {
      return currentRoles.filter(role => role.state.toLowerCase() === estado.toLowerCase());
    }
    return currentRoles.filter(role => { 
      const roleNameLower = role.nombre_rol.toLowerCase(); 
      const roleIdStr = role.id?.toString() || ''; 
      return roleNameLower.includes(search) || roleIdStr.includes(search); 
    }); 
  }); 

  private mapFromApiResponse(apiResponse: RoleResponse): RoleData { 
    return { 
      id: apiResponse.id_rol || apiResponse.id || 0, 
      nombre_rol: apiResponse.nombre_rol,
      state: apiResponse.estado ? ESTADO_ACTIVO : ESTADO_INACTIVO 
    }; 
  } 

  openModalCreateRole(role?: RoleData): void { 
    const dialogRef = this.dialog.open(RolModalComponent, { 
      width: '30rem',
      height: 'auto', 
      data: role || null, 
      disableClose: true
    }); 

    dialogRef.afterClosed().subscribe((isSuccess: boolean) => { 
      if (isSuccess) { 
        this.loadRoles(); 
      } 
    }); 
  }

}
