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
import { CreateMenuRequest, Role } from '../../../../shared/interfaces/menus-interface'; 
import { ModuloData } from '../../../../shared/interfaces/modulos-interface';
import { form, required, validate, requiredError, FormField } from '@angular/forms/signals';

export interface MenuData {
  id_menu: number;
  nivel: number;
  orden: number;
  ruta: string;
  nombre_menu: string;
  id_modulo: number;
  nombre_modulo: string;
  estado: boolean;
  roles?: Role[];
  id_depende: number | null;
} 

@Component({ 
  selector: 'app-menu-modal', 
  standalone: true, 
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
    MatAutocompleteModule
  ], 
  templateUrl: './menu-modal-component.html', 
  styleUrl: './menu-modal-component.scss', 
})

export class MenuModalComponent implements OnInit { 
  private readonly menusService = inject(MenusService); 
  private readonly modulosService = inject(ModulosService);
  private readonly alertService = inject(AlertService); 
  private readonly dialogRef = inject(MatDialogRef<MenuModalComponent>); 
  readonly data: MenuData | null = inject(MAT_DIALOG_DATA); 
  public errorService = inject(FormErrorService);
  private readonly iconService = inject(IconService);

  readonly isEditMode = signal<boolean>(false); 
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
    return this.menus().filter(menu => 
      menu.name.toLowerCase().includes(search)
    );
  });
  
  readonly menuModel = signal<MenuData>({ 
    id_menu: 0,
    nivel: 1, 
    orden: 0,
    ruta: '', 
    id_modulo: 0, 
    nombre_modulo: '',
    nombre_menu: '',
    estado: false,
    id_depende: null
  });

  readonly menuForm = form(this.menuModel, (fieldPath) => {
    required(fieldPath.id_modulo, { message: 'El módulo es requerido.' });
    required(fieldPath.nombre_menu, { message: 'El nombre del menú es requerido.' });
    required(fieldPath.nivel, { message: 'El nivel es requerido.' });
    required(fieldPath.ruta, { message: 'La ruta es requerida.' });
    validate(fieldPath.id_depende, ({ value, valueOf }) => {
      const esNivel2 = Number(valueOf(fieldPath.nivel)) === 2;
      const idDepende = value();
      if (esNivel2 && (typeof idDepende !== 'number' || idDepende <= 0)) {
        return requiredError({ message: 'Debe seleccionar un menú padre cuando el nivel es 2.' });
      }
      return undefined;
    });
  });

  readonly showIdDepiende = computed(() => Number(this.menuModel().nivel) === 2);

  moduloError = this.errorService.createFieldTracker(this.menuForm.id_modulo, this.backendErrors, 'id_modulo');
  nombreMenuError = this.errorService.createFieldTracker(this.menuForm.nombre_menu, this.backendErrors, 'nombre_menu');
  nivelError = this.errorService.createFieldTracker(this.menuForm.nivel, this.backendErrors, 'nivel');
  rutaError = this.errorService.createFieldTracker(this.menuForm.ruta, this.backendErrors, 'ruta');
  ordenError = this.errorService.createFieldTracker(this.menuForm.orden, this.backendErrors, 'orden');
  idDependeError = this.errorService.createFieldTracker(this.menuForm.id_depende, this.backendErrors, 'id_depende');

  ngOnInit(): void { 
    this.loadModulos();
    this.loadMenus();
    if (this.data) { 
      this.isEditMode.set(true); 
      this.isActive.set(this.data.estado); 
      
      this.menuModel.set({
        id_menu: this.data.id_menu,
        nivel: this.data.nivel,
        orden: this.data.orden,
        ruta: this.data.ruta,
        id_modulo: this.data.id_modulo,
        nombre_modulo: this.data.nombre_modulo,
        nombre_menu: this.data.nombre_menu,
        estado: this.data.estado,
        id_depende: null
      });
    } 
  }

  loadModulos(): void {
    this.modulosService.getModulos({ page: 1, page_size: 100 }).subscribe({
      next: (response) => {
        const mappedModulos = response.results.map(modulo => ({
          id: modulo.id_modulo || modulo.id || 0,
          module_name: modulo.nombre_modulo,
          state: modulo.estado ? 'Activo' : 'Inactivo'
        }));
        this.modulos.set(mappedModulos);
      },
      error: (error) => {
        console.log('Error al cargar módulos', error);
      }
    });
  }

  loadMenus(): void {
    this.menusService.getMenus({ page: 1, page_size: 100 }).subscribe({
      next: (response) => {
        const mappedMenus = response.results.map(menu => ({
          id: menu.id_menu || menu.id || 0,
          name: menu.nombre_menu
        }));
        this.menus.set(mappedMenus);
        this.preselectParentMenu();
      },
      error: (error) => {
        console.log('Error al cargar menús', error);
        this.preselectParentMenu();
      }
    });
  }

  private preselectParentMenu(): void {
    const idDepende = Number(this.data?.id_depende);
    if (!idDepende) {
      return;
    }
    const applyParent = () => this.menuModel.update(current => ({ ...current, id_depende: idDepende }));

    if (this.menus().some(m => m.id === idDepende)) {
      applyParent();
      return;
    }

    this.menusService.getMenuById(idDepende).subscribe({
      next: (menu) => {
        this.menus.update(current => [...current, { id: idDepende, name: menu.nombre_menu }]);
        applyParent();
      },
      error: (error) => {
        console.log('Error al cargar el menú padre', error);
        applyParent();
      }
    });
  }

  onNivelChange(): void {
    if (Number(this.menuModel().nivel) !== 2) {
      this.menuModel.update(current => ({ ...current, id_depende: null }));
      this.menuSearch.set('');
      this.errorService.limpiarCampoBackend(this.backendErrors, 'id_depende');
    }
  }

  onMenuInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.menuSearch.set(value);
    this.errorService.limpiarCampoBackend(this.backendErrors, 'id_depende');
    
    if (!value) {
      this.menuModel.update(current => ({ ...current, id_depende: null }));
    }
  }

  onMenuSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedMenu = this.menus().find(m => m.id === event.option.value);
    this.menuModel.update(current => ({ ...current, id_depende: selectedMenu ? selectedMenu.id : null }));
  }

  displayMenuName = (menuId: number | string | null): string => {
    if (typeof menuId === 'string') {
      return menuId;
    }
    const menu = this.menus().find(m => m.id === menuId);
    return menu ? menu.name : '';
  };
  
  onSave(event: Event) {
    event.preventDefault();

    if (this.menuForm().invalid()) {
      this.menuForm.id_modulo().markAsTouched();
      this.menuForm.nombre_menu().markAsTouched();
      this.menuForm.nivel().markAsTouched();
      this.menuForm.ruta().markAsTouched();
      this.menuForm.orden().markAsTouched();
      this.menuForm.id_depende().markAsTouched();
      return;
    }

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

    const idDepende = this.menuModel().id_depende;
    if (Number(this.menuModel().nivel) === 2 && typeof idDepende === 'number' && idDepende > 0) {
      apiRequest.id_depende = idDepende;
    } 
    
    if (this.isEditMode() && this.data?.id_menu) { 
      this.menusService.updateMenu(this.data.id_menu, apiRequest).subscribe({ 
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
    else { 
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
  }

  closeModal(): void {
    this.dialogRef.close(false);
  }
}