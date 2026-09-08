import { Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatFormFieldModule, MatFormField, MatError } from '@angular/material/form-field'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MenusService } from '../../../../shared/services/menus.service'; 
import { ModulosService } from '../../../../shared/services/modulos.service';
import { AlertService } from '../../../../shared/services/alert.service'; 
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { AppHttpError } from '../../../../shared/interfaces/error-interface';
import { IconService } from '../../../../shared/services/icon.service';
import { CreateMenuRequest, MenuData } from '../../../../shared/interfaces/menus-interface'; 
import { ModuloData } from '../../../../shared/interfaces/modulos-interface';
import { form, required, FormField, min, max, minLength, maxLength, disabled } from '@angular/forms/signals';
import { LetrasDirective }  from '../../../../shared/directives/letras-directive';

@Component({ 
  selector: 'app-menu-modal', 
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSlideToggleModule, 
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatFormField,
    MatError,
    FormField,
    MatAutocompleteModule,
    LetrasDirective
  ], 
  templateUrl: './menu-modal-component.html', 
  styleUrl: './menu-modal-component.scss', 
})

export class MenuModalComponent implements OnInit { 
  private readonly menusService = inject(MenusService); 
  private readonly modulosService = inject(ModulosService);
  private readonly alertService = inject(AlertService); 
  private readonly dialogRef = inject(MatDialogRef<MenuModalComponent>); 
  private readonly data = inject<MenuData | null>(MAT_DIALOG_DATA); 
  public errorService = inject(FormErrorService);
  private readonly iconService = inject(IconService);
  readonly isEditMode = signal<boolean>(!!this.data?.id_menu);
  readonly isReadOnly = signal<boolean>((this.data as any)?.isReadOnly === true); 
  readonly isLoading = signal<boolean>(false);
  readonly isActive = signal<boolean>(false); 
  readonly errorIconPath = computed(() => this.iconService.getIconPath('error')());
  readonly backendErrors = signal<Record<string, string[]>>({});
  readonly statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');
  readonly modulos = signal<ModuloData[]>([]);
  readonly menus = signal<{id: number, name: string}[]>([]);
  readonly menuSearch = signal<string>('');
  
  readonly filteredMenus = computed(() => {
    const search = this.menuSearch().toLowerCase();
    
    if (this.isEditMode() && !search) {
      return this.menus();
    }
    return this.menus().filter(menu => 
      menu.name.toLowerCase().includes(search)
    );
  });
  
  readonly menuModel = signal<MenuData>({ 
    id_menu: 0,
    nivel: 1, 
    orden: 1,
    ruta: '', 
    id_modulo: 0, 
    nombre_modulo: '',
    nombre_menu: '',
    estado: false,
    id_depende: 0,
  });

  readonly menuForm = form(this.menuModel, (fieldPath) => {
    min(fieldPath.id_modulo, 1, { message: 'El módulo es requerido.' });
    min(fieldPath.nivel, 1, { message: 'Nivel mínimo 1.' });
    max(fieldPath.nivel, 2, { message: 'Nivel máximo 2.' });
    min(fieldPath.orden, 1, { message: 'Nivel mínimo 1.' });
    max(fieldPath.orden, 10, { message: 'Orden máximo 10.' });
    minLength(fieldPath.nombre_menu, 3, { message: 'El nombre del menú debe tener un mínimo de 3 caracteres.' });
    maxLength(fieldPath.nombre_menu, 40, { message: 'El nombre del menú debe tener un máximo de 40 caracteres.' });
    required(fieldPath.nombre_menu, { message: 'El nombre del menú es requerido.' });
    required(fieldPath.nivel, { message: 'El nivel es requerido.' });
    required(fieldPath.orden, { message: 'El orden es requerido.' });
    required(fieldPath.ruta, { message: 'La ruta es requerida.' });
    this.setupDisabledFields(fieldPath);
  });

  readonly showIdDepiende = computed(() => Number(this.menuModel().nivel) === 2);
  
  private setupDisabledFields(fieldPath: any): void {
      disabled(fieldPath.id_modulo, () => this.isReadOnly());
      disabled(fieldPath.nivel, () => this.isReadOnly());
      disabled(fieldPath.orden, () => this.isReadOnly());
      disabled(fieldPath.ruta, () => this.isReadOnly());
      disabled(fieldPath.nombre_menu, () => this.isReadOnly());
      disabled(fieldPath.id_depende, () => this.isReadOnly());
    }
  
  
  nombreMenuError = this.errorService.createFieldTracker(this.menuForm.nombre_menu, this.backendErrors, 'nombre_menu');
  nivelError = this.errorService.createFieldTracker(this.menuForm.nivel, this.backendErrors, 'nivel');
  rutaError = this.errorService.createFieldTracker(this.menuForm.ruta, this.backendErrors, 'ruta');
  ordenError = this.errorService.createFieldTracker(this.menuForm.orden, this.backendErrors, 'orden');
  menuDependeError = this.errorService.createFieldTracker(this.menuForm.id_depende, this.backendErrors, 'id_depende');

  ngOnInit(): void { 
    this.loadModulos();
    this.loadMenus().then(() => {
      if (this.data) { 
        this.isEditMode.set(true); 
        this.isActive.set(this.data.estado); 
        
        const idDepende = this.data.id_depende || 0;
        
        this.menuModel.set({
          id_menu: this.data.id_menu,
          nivel: this.data.nivel,
          orden: this.data.orden,
          ruta: this.data.ruta,
          id_modulo: this.data.id_modulo,
          nombre_modulo: this.data.nombre_modulo,
          nombre_menu: this.data.nombre_menu,
          estado: this.data.estado,
          id_depende: idDepende,
          
        });
      } 
    });
  }

  loadModulos(): void {
    this.modulosService.getModulos({ page: 1, page_size: 100 }).subscribe({
      next: (response) => {
        const mappedModulos = response.results?.map(modulo => ({
          id: modulo.id_modulo || modulo.id || 0,
          module_name: modulo.nombre_modulo,
          state: modulo.estado ? 'Activo' : 'Inactivo'
        })) || [];
        this.modulos.set(mappedModulos);
      },
      error: (error) => {
        console.log('Error al cargar módulos', error);
      }
    });
  }

  loadMenus(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.menusService.getMenus({ page: 1, page_size: 100 }).subscribe({
        next: (response) => {
          const mappedMenus = response.results?.map(menu => ({
            id: menu.id_menu || menu.id || 0,
            name: menu.nombre_menu
          })) || [];
          this.menus.set(mappedMenus);
          resolve();
        },
        error: (error) => {
          console.log('Error al cargar menús', error);
          reject(error);
        }
      });
    });
  }

  onNivelChange(): void {
    const newNivel = Number(this.menuModel().nivel);
    if (newNivel !== 2) {
      this.menuModel.update(current => ({ ...current, id_depende: 0 }));
      this.menuSearch.set('');
      
      this.errorService.limpiarCampoBackend(this.backendErrors, 'id_depende');
    } 
    else if (newNivel === 2 && this.isEditMode() && this.data) {
      const idDepende = this.data.id_depende;
      if (idDepende) {
        const menuPadre = this.menus().find(m => m.id === idDepende);
        if (menuPadre) {
          this.menuModel.update(current => ({ ...current, id_depende: idDepende}));
          this.menuSearch.set(menuPadre.name);
        }
      }
    }
  }

  onMenuInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.menuSearch.set(value);
    this.errorService.limpiarCampoBackend(this.backendErrors, 'id_depende');
    
    if (!value) {
      this.menuModel.update(current => ({ ...current, id_depende: this.menuModel().id_depende }));
    }
    
  }
  
  onMenuSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedMenu = this.menus().find(m => m.id === event.option.value);
    if (selectedMenu) {
      this.menuModel.update(current => ({ ...current, id_depende: selectedMenu.id }));
    }
  }

  displayMenuName = (menuId: number): string => {
    if (!menuId || menuId === 0) return '';
    const menu = this.menus().find(m => m.id === menuId);
    if (menu) return menu.name;
    
    return this.menuSearch() || '';
  };
  
  private updateMenu(apiRequest: CreateMenuRequest): void {
    this.menusService.updateMenu(this.data?.id_menu || 0, apiRequest).subscribe({ 
      next: (result) => {
        this.isLoading.set(false);
        this.alertService.success('Menú actualizado exitosamente.');
        this.dialogRef.close(result);
      }, 
      error: (err: AppHttpError) => {
        this.isLoading.set(false);
        this.alertService.error(err.mensajeGeneral);
        if (err.detalles) {
          this.backendErrors.set(err.detalles);
        }
      } 
    });
  }

  private createMenu(apiRequest: CreateMenuRequest) {
    this.menusService.createMenu(apiRequest).subscribe({ 
      next: (result) => { 
        this.isLoading.set(false);
        this.alertService.success('Menú creado exitosamente.');
        this.dialogRef.close(result);
      }, 
      error: (err: AppHttpError) => { 
        this.isLoading.set(false);
        this.alertService.error(err.mensajeGeneral);
        if (err.detalles) {
          this.backendErrors.set(err.detalles);
        }
      } 
    });
  }

  onSave(event: Event) {
    event.preventDefault();
    if (this.isReadOnly()) return;
    this.isLoading.set(true);
    this.backendErrors.set({});
    
    const apiRequest: CreateMenuRequest = { 
      nivel: this.menuModel().nivel,
      orden: this.menuModel().orden,
      ruta: this.menuModel().ruta.trim(),
      id_modulo: this.menuModel().id_modulo,
      nombre_menu: this.menuModel().nombre_menu.trim(),
      estado: this.isActive()
    };

    if (this.menuModel().nivel === 1){apiRequest.id_depende = 0;}
    if (this.menuModel().nivel === 2 && this.menuModel().id_depende !== 0) {
      apiRequest.id_depende = this.menuModel().id_depende;
    } 

    if (this.isEditMode() && this.data) { 
      this.updateMenu(apiRequest);
    } else { 
      this.createMenu(apiRequest);
    }

    if (this.menuForm.id_modulo().invalid() || this.menuForm.nombre_menu().invalid() || this.menuForm.nivel().invalid() || 
      this.menuForm.ruta().invalid()) {
        this.menuForm.id_modulo().markAsTouched();
        this.menuForm.nombre_menu().markAsTouched();
        this.menuForm.nivel().markAsTouched();
        this.menuForm.ruta().markAsTouched();
        this.menuForm.id_depende().markAsTouched();
    }
  }
}
