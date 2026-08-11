import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; 
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenusService } from '../../../../shared/services/menus.service'; 
import { AlertService } from '../../../../shared/services/alert.service'; 
import { CreateMenuRequest } from '../../../../shared/interfaces/menus-interface'; 
import { ModuloData, MenuData } from '../../../../shared/interfaces/modulos-interface';
import { AssignRolesModalComponent } from '../assign-roles-modal/assign-roles-modal.component'; 

@Component({ 
  selector: 'app-menu-modal', 
  standalone: true, 
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSlideToggleModule, 
    MatIconModule,
    FormsModule, 
    DragDropModule
  ], 
  templateUrl: './menu-modal-component.html', 
  styleUrl: './menu-modal-component.scss', 
  changeDetection: ChangeDetectionStrategy.OnPush 
})

export class MenuModalComponent implements OnInit { 
  private readonly menusService = inject(MenusService); 
  private readonly alertService = inject(AlertService); 
  private readonly dialogRef = inject(MatDialogRef<MenuModalComponent>); 
  private readonly dialog = inject(MatDialog);
  readonly data: { modulo: ModuloData, menus?: MenuData[] } | null = inject(MAT_DIALOG_DATA); 

  readonly isEditMode = signal<boolean>(false); 
  readonly isLoading = signal<boolean>(false);
  readonly isActive = signal<boolean>(false); 
  readonly errorIconPath = signal<string>('assets/icons/error.svg'); 
  readonly serverError = signal<string | null>(null); 
  readonly statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');
  
  readonly menus = signal<MenuData[]>([]);
  readonly selectedMenuId = signal<number | null>(null);
  
  readonly menuModel = signal<MenuData>({ 
    nivel: 1, 
    orden: 0,
    ruta: '', 
    id_modulo: this.data?.modulo?.id || 0, 
    nombre_modulo: this.data?.modulo?.name || '', 
    nombre_menu: '',
    state: 'Inactivo' 
  }); 

  ngOnInit(): void { 
    if (this.data) {
      this.loadMenus();
    }
  }

  loadMenus(): void {
    if (this.data?.modulo?.id) {
      this.menusService.getMenus({ id_modulo: this.data.modulo.id, page: 1, page_size: 100 }).subscribe({
        next: (response) => {
          const mappedMenus = response.results.map(menu => ({
            id: menu.id_menu || menu.id || 0,
            nivel: menu.nivel,
            orden: menu.orden,
            ruta: menu.ruta,
            id_modulo: menu.id_modulo,
            nombre_modulo: menu.nombre_modulo,
            nombre_menu: menu.nombre_menu || '',
            state: menu.estado ? 'Activo' : 'Inactivo'
          })).sort((a, b) => {
            // First sort by nivel, then by orden
            if (a.nivel !== b.nivel) {
              return a.nivel - b.nivel;
            }
            return (a.orden || 0) - (b.orden || 0);
          });
          this.menus.set(mappedMenus);
        },
        error: (error) => {
          console.log('Error al cargar menús', error);
        }
      });
    }
  }
  
  onInputChange(): void {
    if (this.serverError()) {
      this.serverError.set(null);
    }
  }

  drop(event: CdkDragDrop<MenuData[]>): void {
    moveItemInArray(this.menus(), event.previousIndex, event.currentIndex);
    
    // Update orden based on new position within the same nivel group
    this.menus.update(menus => {
      const updatedMenus = [...menus];
      
      // Group menus by nivel and calculate orden within each group
      const nivelGroups: { [key: number]: MenuData[] } = {};
      updatedMenus.forEach(menu => {
        if (!nivelGroups[menu.nivel]) {
          nivelGroups[menu.nivel] = [];
        }
        nivelGroups[menu.nivel].push(menu);
      });
      
      // Update orden for each menu within its nivel group
      Object.keys(nivelGroups).forEach(nivel => {
        const group = nivelGroups[Number.parseInt(nivel)];
        group.forEach((menu, index) => {
          menu.orden = index + 1;
        });
      });
      
      return updatedMenus.sort((a, b) => {
        if (a.nivel !== b.nivel) {
          return a.nivel - b.nivel;
        }
        return (a.orden || 0) - (b.orden || 0);
      });
    });

    // Send PATCH requests for all menus with their new orders
    const updateRequests = this.menus().map((menu, index) => {
      if (menu.id) {
        return this.menusService.patchMenuOrder(menu.id, menu.orden || 0);
      }
      return null;
    }).filter(req => req !== null);

    if (updateRequests.length > 0) {
      // Execute all PATCH requests
      updateRequests.forEach(req => {
        req?.subscribe({
          next: () => {
            console.log('Orden actualizado exitosamente');
          },
          error: (error) => {
            console.log('Error al actualizar orden', error);
            this.alertService.error('Error al actualizar el orden del menú.');
            this.loadMenus(); // Reload to restore original order
          }
        });
      });
    }
  }

  editMenu(menu: MenuData): void {
    this.selectedMenuId.set(menu.id || null);
    this.isActive.set(menu.state === 'Activo');
    this.menuModel.set({
      id: menu.id,
      nivel: menu.nivel,
      orden: menu.orden,
      ruta: menu.ruta,
      id_modulo: menu.id_modulo,
      nombre_modulo: menu.nombre_modulo,
      nombre_menu: menu.nombre_menu,
      state: menu.state
    });
  }

  addNewMenu(): void {
    this.selectedMenuId.set(null);
    this.isActive.set(true);
    this.menuModel.set({
      nivel: 1,
      orden: 0,
      ruta: '',
      id_modulo: this.data?.modulo?.id || 0,
      nombre_modulo: this.data?.modulo?.name || '',
      nombre_menu: '',
      state: 'Activo'
    });
  }

  onSave(event: Event) {
    event.preventDefault();

    // Manual validation
    if (!this.menuModel().nombre_menu || this.menuModel().nombre_menu.trim() === '') {
      this.serverError.set('El nombre del menú es requerido.');
      return;
    }
    if (!this.menuModel().ruta || this.menuModel().ruta.trim() === '') {
      this.serverError.set('La ruta es requerida.');
      return;
    }
    if (!this.menuModel().id_modulo) {
      this.serverError.set('El módulo es requerido.');
      return;
    }
    if (this.menuModel().nivel < 1) {
      this.serverError.set('El nivel debe ser al menos 1.');
      return;
    }

    this.isLoading.set(true); 
    this.serverError.set(null); 
    
    // Calculate orden based on existing menus of the same nivel
    const menusOfSameNivel = this.menus().filter(m => m.nivel === this.menuModel().nivel);
    const nextOrden = this.selectedMenuId() ? this.menuModel().orden : menusOfSameNivel.length + 1;
    
    const apiRequest: CreateMenuRequest = { 
      nivel: this.menuModel().nivel,
      orden: nextOrden,
      ruta: this.menuModel().ruta.trim(),
      id_modulo: this.menuModel().id_modulo,
      nombre_menu: this.menuModel().nombre_menu.trim(),
      estado: this.isActive() 
    }; 
    
    if (this.selectedMenuId()) { 
      this.menusService.updateMenu(this.selectedMenuId()!, apiRequest).subscribe({ 
        next: (result) => {
          this.isLoading.set(false);
          this.alertService.success('Menú actualizado exitosamente.'); 
          this.loadMenus();
          this.selectedMenuId.set(null);
        }, 
        error: (err) => {
          this.isLoading.set(false);
          const backendMessage = err.error?.detalles?.ruta || 'Error al actualizar el menú.'; 
          this.serverError.set(backendMessage); 
          console.log('error edit', backendMessage);
        } 
      }); 
    } 
    else { 
      this.menusService.createMenu(apiRequest).subscribe({ 
        next: (result) => { 
          this.isLoading.set(false);
          this.alertService.success('Menú creado exitosamente.');
          this.loadMenus();
          this.selectedMenuId.set(null);
        }, 
        error: (err) => { 
          this.isLoading.set(false);
          const backendMessage = err.error?.detalles?.ruta || 'Error al crear el menú.'; 
          this.serverError.set(backendMessage); 
        } 
      }); 
    } 
  } 

  deleteMenu(menuId: number): void {
    if (confirm('¿Está seguro de eliminar este menú?')) {
      this.menusService.deleteMenu(menuId).subscribe({
        next: () => {
          this.alertService.success('Menú eliminado exitosamente.');
          this.loadMenus();
        },
        error: (error) => {
          console.log('Error al eliminar menú', error);
          this.alertService.error('Error al eliminar el menú.');
        }
      });
    }
  }

  assignRoles(menu: MenuData): void {
    const dialogRef = this.dialog.open(AssignRolesModalComponent, {
      width: '500px',
      data: {
        menuId: menu.id!,
        menuName: menu.nombre_menu
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.alertService.success('Asignación de roles actualizada.');
      }
    });
  }

  onCancel(): void { 
    this.dialogRef.close(false); 
  }

}
