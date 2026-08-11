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
import { ModuloModalComponent } from '../../modals/modulo-modal-component/modulo-modal-component';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button'; 
import { ModulosService } from '../../../../shared/services/modulos.service'; 
import { ModuloData, ModuloResponse, ModulosListResponse } from '../../../../shared/interfaces/modulos-interface';

@Component({
  selector: 'app-modulo-component', 
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, FormsModule, MatIconModule, MatButtonModule], 
  templateUrl: './modulo-component.html', 
  styleUrl: './modulo-component.scss', 
})

export class ModuloComponent { 
  private readonly dialog = inject(MatDialog); 
  private readonly modulosService = inject(ModulosService); 
  
  displayedColumns: string[] = ['id', 'name', 'menus', 'state', 'actions']; 
  modulos = signal<ModuloData[]>([]); 
  totalModulos = signal<number>(0); 
  pageIndex = signal<number>(1); 
  pageSize = signal<number>(5); 
  activeSort = signal<Sort>({ active: '', direction: '' }); 
  paginatorPageIndex = computed(() => this.pageIndex() - 1); 
  searchTerm = signal<string>('');

  constructor() { 
    this.loadModulos(); 
  } 

  loadModulos(): void { 
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

    this.modulosService.getModulos({ 
      search: apiSearchParam, 
      ordering: ordering || 'id_modulo', 
      page: this.pageIndex(), 
      page_size: this.pageSize() 
    }).subscribe({ 
      next: (response: ModulosListResponse) => { 
        const mappedModulos = response.results.map(modulo => this.mapFromApiResponse(modulo)); 
        this.modulos.set(mappedModulos); 
        this.totalModulos.set(response.count); 
      },
      error: (error) => {
      console.log('error al obtener módulos',error)
      }
    });
  } 

  private mapSortField(field: string): string { 
    const fieldMap: { [key: string]: string } = { 'id': 'id_modulo', 'name': 'nombre_modulo', 'state': 'estado' }; 
    return fieldMap[field] || field; 
  } 

  displayedModulos = computed(() => { 
    const currentModulos = this.modulos(); 
    const search = this.searchTerm().toLowerCase().trim(); 
    if (!search) { 
      return currentModulos; 
    } 
    return currentModulos.filter(modulo => { 
      const moduloNameLower = modulo.name.toLowerCase(); 
      const moduloStateLower = modulo.state.toLowerCase(); 
      const moduloIdStr = modulo.id?.toString() || ''; 
      if (['activo', 'inactivo'].includes(search)) return moduloStateLower === search; 
      if (['act', 'activ', 'activa'].includes(search)) return moduloStateLower === 'activo'; 
      if (['inac', 'ina', 'inactiv', 'inactiva'].includes(search)) return moduloStateLower === 'inactivo'; 
      return moduloNameLower.includes(search) || moduloIdStr.includes(search); 
    }); 
  }); 
  
  onSearchChange(value: string): void { 
    this.searchTerm.set(value ?? ''); 
    this.loadModulos(); 
  } 

  onPageChange(event: PageEvent): void { 
    this.pageIndex.set(event.pageIndex + 1); 
    this.pageSize.set(event.pageSize); 
    this.loadModulos(); 
  } 

  onSortChange(sort: Sort): void { 
    this.activeSort.set(sort); 
    this.pageIndex.set(1); 
    this.loadModulos(); 
  } 

  private mapFromApiResponse(apiResponse: ModuloResponse): ModuloData { 
    const menus = apiResponse.menus_asociados
      ?.filter(menu => menu !== null)
      .map(menu => {
        // Handle if menu is a string (just the name)
        if (typeof menu === 'string') {
          return {
            id: 0,
            nivel: 0,
            orden: 0,
            ruta: '',
            id_modulo: apiResponse.id_modulo || apiResponse.id || 0,
            nombre_modulo: apiResponse.nombre_modulo,
            nombre_menu: menu,
            state: 'Activo'
          };
        }
        // Handle if menu is an object (MenuResponse)
        return {
          id: menu.id_menu || menu.id || 0,
          nivel: menu.nivel,
          orden: menu.orden,
          ruta: menu.ruta,
          id_modulo: menu.id_modulo,
          nombre_modulo: menu.nombre_modulo,
          nombre_menu: menu.nombre_menu || '',
          state: menu.estado ? 'Activo' : 'Inactivo'
        };
      }) || [];

    return { 
      id: apiResponse.id_modulo || apiResponse.id || 0, 
      name: apiResponse.nombre_modulo,
      state: apiResponse.estado ? 'Activo' : 'Inactivo',
      menus
    }; 
  } 

  openModalCreateModulo(modulo?: ModuloData): void { 
    const dialogRef = this.dialog.open(ModuloModalComponent, { 
      width: '30rem',
      height: 'auto', 
      data: modulo || null, 
      disableClose: true
    }); 

    dialogRef.afterClosed().subscribe((isSuccess: boolean) => { 
      if (isSuccess) { 
        this.loadModulos(); 
      } 
    }); 
  }

  getMenusForModulo(modulo: ModuloData): string {
    if (!modulo.menus || modulo.menus.length === 0) {
      return 'Sin menús';
    }
    return modulo.menus.map(menu => menu.nombre_menu || menu.ruta).join(', ');
  }

}
