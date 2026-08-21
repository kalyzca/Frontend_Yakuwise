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
import { MenuModalComponent, MenuData } from '../../modals/menu-modal-component/menu-modal-component';
import { MenusService } from '../../../../shared/services/menus.service';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatChipsModule } from '@angular/material/chips';
import { MenuResponse, MenusListResponse } from '../../../../shared/interfaces/menus-interface';
import { AssignRolesModalComponent, AssignRolesData } from '../../modals/assign-roles-modal/assign-roles-modal.component';
import { Role } from '../../../../shared/interfaces/menus-interface';

@Component({
  selector: 'app-menu-component', 
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, FormsModule, MatIconModule, MatButtonModule, MatChipsModule], 
  templateUrl: './menu-component.html', 
  styleUrl: './menu-component.scss', 
})

export class MenuComponent { 
  private readonly dialog = inject(MatDialog); 
  private readonly menusService = inject(MenusService);
  
  displayedColumns: string[] = ['id_menu', 'nombre_menu', 'nombre_modulo', 'roles', 'nivel', 'orden', 'estado', 'actions']; 
  menus = signal<MenuData[]>([]); 
  totalMenus = signal<number>(0); 
  pageIndex = signal<number>(1); 
  pageSize = signal<number>(5); 
  activeSort = signal<Sort>({ active: '', direction: '' }); 
  paginatorPageIndex = computed(() => this.pageIndex() - 1); 
  searchTerm = signal<string>('');

  constructor() { 
    this.loadMenus(); 
  } 

  loadMenus(): void { 
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

    this.menusService.getMenus({ 
      search: apiSearchParam, 
      ordering: ordering || 'id_menu', 
      page: this.pageIndex(), 
      page_size: this.pageSize() 
    }).subscribe({ 
      next: (response: MenusListResponse) => { 
        const mappedMenus = response.results.map(menu => this.mapFromApiResponse(menu)); 
        this.menus.set(mappedMenus); 
        this.totalMenus.set(response.count); 
      },
      error: (error) => {
        console.log('error al obtener menús', error)
      }
    });
  } 

  private mapSortField(field: string): string { 
    const fieldMap: { [key: string]: string } = { 
      'id_menu': 'id_menu', 
      'nombre_menu': 'nombre_menu', 
      'nombre_modulo': 'nombre_modulo',
      'roles': 'roles',
      'nivel': 'nivel',
      'orden': 'orden',
      'estado': 'estado'
    }; 
    return fieldMap[field] || field; 
  } 

  displayedMenus = computed(() => { 
    const currentMenus = this.menus(); 
    const search = this.searchTerm().toLowerCase().trim(); 
    if (!search) { 
      return currentMenus; 
    } 
    return currentMenus.filter(menu => { 
      const menuNameLower = menu.nombre_menu.toLowerCase(); 
      const menuModuloLower = menu.nombre_modulo.toLowerCase();
      const menuRolesNames = menu.roles?.map(r => r.nombre_rol.toLowerCase()).join(' ') || '';
      const menuStateStr = menu.estado ? 'activo' : 'inactivo'; 
      const menuIdStr = menu.id_menu?.toString() || ''; 
      if (['activo', 'inactivo'].includes(search)) return menuStateStr === search; 
      if (['act', 'activ', 'activa'].includes(search)) return menuStateStr === 'activo'; 
      if (['inac', 'ina', 'inactiv', 'inactiva'].includes(search)) return menuStateStr === 'inactivo'; 
      return menuNameLower.includes(search) || menuModuloLower.includes(search) || menuRolesNames.includes(search) || menuIdStr.includes(search); 
    }); 
  }); 
  
  onSearchChange(value: string): void { 
    this.searchTerm.set(value ?? ''); 
    this.loadMenus(); 
  } 

  onPageChange(event: PageEvent): void { 
    this.pageIndex.set(event.pageIndex + 1); 
    this.pageSize.set(event.pageSize); 
    this.loadMenus(); 
  } 

  onSortChange(sort: Sort): void { 
    this.activeSort.set(sort); 
    this.pageIndex.set(1); 
    this.loadMenus(); 
  } 

  private mapFromApiResponse(apiResponse: MenuResponse): MenuData { 
    return { 
      id_menu: apiResponse.id_menu || apiResponse.id || 0, 
      nombre_menu: apiResponse.nombre_menu,
      nombre_modulo: apiResponse.nombre_modulo,
      ruta: apiResponse.ruta,
      nivel: apiResponse.nivel,
      orden: apiResponse.orden,
      estado: apiResponse.estado,
      id_modulo: apiResponse.id_modulo,
      roles: apiResponse.roles || [],
      id_depende: apiResponse.id_depende || 0
    }; 
  } 

  openModalCreateMenu(menu?: MenuData): void { 
    const dialogRef = this.dialog.open(MenuModalComponent, { 
      width: '30rem',
      height: 'auto', 
      data: menu || null, 
      disableClose: true
    }); 

    dialogRef.afterClosed().subscribe((result) => { 
      if (result) { 
        this.loadMenus(); 
      } 
    }); 
  }

  openAssignRolesModal(menu: MenuData): void {
    const dialogRef = this.dialog.open(AssignRolesModalComponent, {
      width: '30rem',
      height: 'auto',
      data: {
        menuId: menu.id_menu,
        menuName: menu.nombre_menu
      } as AssignRolesData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMenus();
      }
    });
  }
}