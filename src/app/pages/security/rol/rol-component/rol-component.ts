import { Component, computed, inject, signal } from '@angular/core'; 
import { ButtonComponent } from "../../../../shared"; 
import { RouterLink } from "@angular/router"; 
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; 
import { MatSortModule, Sort } from '@angular/material/sort'; 
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

@Component({
  selector: 'app-rol-component', 
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, FormsModule, MatIconModule, MatButtonModule], 
  templateUrl: './rol-component.html', 
  styleUrl: './rol-component.scss', 
})

export class RolComponent { 
  private readonly dialog = inject(MatDialog); 
  private readonly rolesService = inject(RolesService); 
  
  displayedColumns: string[] = ['id', 'name', 'state', 'actions']; 
  roles = signal<RoleData[]>([]); 
  totalRoles = signal<number>(0); 
  pageIndex = signal<number>(1); 
  pageSize = signal<number>(5); 
  activeSort = signal<Sort>({ active: '', direction: '' }); 
  paginatorPageIndex = computed(() => this.pageIndex() - 1); 
  searchTerm = signal<string>(''); 

  constructor() { 
    this.loadRoles(); 
  } 

  loadRoles(): void { 
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

    this.rolesService.getRoles({ 
      search: apiSearchParam, 
      ordering: ordering || 'id_rol', 
      page: this.pageIndex(), 
      page_size: this.pageSize() 
    }).subscribe({ 
      next: (response: RolesListResponse) => { 
        const mappedRoles = response.results.map(role => this.mapFromApiResponse(role)); 
        this.roles.set(mappedRoles); 
        this.totalRoles.set(response.count); 
      },
      error: (error) => {
      console.log('error al obtener roles',error)
      }
    });
  } 

  private mapSortField(field: string): string { 
    const fieldMap: { [key: string]: string } = { 'id': 'id_rol', 'name': 'nombre_rol', 'state': 'estado' }; 
    return fieldMap[field] || field; 
  } 

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
      if (['activo', 'inactivo'].includes(search)) return roleStateLower === search; 
      if (['act', 'activ', 'activa'].includes(search)) return roleStateLower === 'activo'; 
      if (['inac', 'ina', 'inactiv', 'inactiva'].includes(search)) return roleStateLower === 'inactivo'; 
      return roleNameLower.includes(search) || roleIdStr.includes(search); 
    }); 
  }); 
  
  onSearchChange(value: string): void { 
    this.searchTerm.set(value ?? ''); 
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

  private mapFromApiResponse(apiResponse: RoleResponse): RoleData { 
    return { 
      id: apiResponse.id_rol || apiResponse.id || 0, 
      name: apiResponse.nombre_rol,
      state: apiResponse.estado ? 'Activo' : 'Inactivo' 
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
