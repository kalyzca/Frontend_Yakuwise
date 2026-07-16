import { Component, computed, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { form, FormField, minLength, min, pattern, required } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions,  MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MatFormField, MatError } from '@angular/material/form-field';
import{MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { RolesService, RoleResponse } from '../../../../shared/services/roles.service';
import { TiposDocumentoService, TipoDocumentoResponse } from '../../../../shared/services/tipos-documento.service';
import { IconService } from '../../../../shared/services/icon.service';
import { CommonModule } from '@angular/common';
import { UsersService, CreateUserRequest } from '../../../../shared/services/users.service';
import { UserData, UserFormData } from '../../../../shared/interfaces/usuario-interface';

@Component({
  selector: 'app-usuario-modal-component',
  imports: [FormsModule, MatDialogActions, MatFormFieldModule, MatInputModule, MatDialogTitle, MatDialogContent, MatButtonModule,  MatFormField, MatCheckboxModule, MatError, MatSlideToggleModule, MatSelectModule, CommonModule, FormField],
  templateUrl: './usuario-modal-component.html',
  styleUrl: './usuario-modal-component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})

export class UsuarioModalComponent {
  private readonly dialogRef = inject(MatDialogRef<UsuarioModalComponent>);
  private readonly inputData = inject<UserData | undefined>(MAT_DIALOG_DATA);
  private readonly rolesService = inject(RolesService);
  private readonly tiposDocumentoService = inject(TiposDocumentoService);
  private readonly iconService = inject(IconService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly usersService = inject(UsersService);

  roles = signal<RoleResponse[]>([]);
  tiposDocumento = signal<TipoDocumentoResponse[]>([]);

  // Backend errors signals
  backendErrors = signal<Record<string, string>>((this.inputData as any)?._backendErrors || {});

  isEditMode = signal<boolean>(!!this.inputData?.id);

  // Inicializar userModal con datos de inputData si está en modo edición
  private getInitialUserModal(): UserFormData {
    if (this.inputData) {
      return {
        username: this.inputData.username || '',
        email: this.inputData.email,
        state: this.inputData.state,
        id_rol: this.inputData.id_rol,
        id_roles: this.inputData.id_roles || [],
        name: this.inputData.name || '',
        roles_names: this.inputData.roles_names || [],
        persona: {
          id_tipo_documento: this.inputData.persona.id_tipo_documento,
          numero_documento: this.inputData.persona.numero_documento,
          nombres: this.inputData.persona.nombres,
          apellido_paterno: this.inputData.persona.apellido_paterno,
          apellido_materno: this.inputData.persona.apellido_materno,
          genero: this.inputData.persona.genero,
          telefono: this.inputData.persona.telefono,
          correo_personal: this.inputData.persona.correo_personal,
          estado: this.inputData.persona.estado
        }
      };
    }
    
    // Valores por defecto para modo creación
    return {
      username: '',
      email: '',
      state: 'Inactivo',
      id_rol: 0,
      id_roles: [],
      name: '',
      roles_names: [],
      persona: {
        id_tipo_documento: 0,
        numero_documento: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        genero: '',
        telefono: '',
        correo_personal: '',
        estado: true
      }
    };
  }

  userModal = signal<UserFormData>(this.getInitialUserModal());

  userForm = form(this.userModal, (fieldPath) => {
    // Email (obligatorio)
    required(fieldPath.email, {message: 'Email es requerido.'});
    pattern(fieldPath.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, {message: 'Email inválido.'});
    
    // Estado (obligatorio)
    required(fieldPath.state, {message: 'Estado es requerido.'});
    
    // Roles (obligatorio)
    minLength(fieldPath.id_roles, 1, {message: 'Debe seleccionar al menos un rol.'});
    
    // Persona - campos (todos obligatorios en PersonaData)
    min(fieldPath.persona.id_tipo_documento, 1, {message: 'Tipo de documento requerido.'});
    required(fieldPath.persona.numero_documento, {message: 'Número de documento requerido.'});
    required(fieldPath.persona.nombres, {message: 'Nombres requeridos.'});
    required(fieldPath.persona.apellido_paterno, {message: 'Apellido paterno requerido.'});
    required(fieldPath.persona.apellido_materno, {message: 'Apellido materno requerido.'});
    required(fieldPath.persona.genero, {message: 'Género requerido.'});
    required(fieldPath.persona.telefono, {message: 'Teléfono requerido.'});
    required(fieldPath.persona.correo_personal, {message: 'Correo personal requerido.'});
    pattern(fieldPath.persona.correo_personal, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, {message: 'Correo personal inválido.'});
  });

  constructor() {
    this.loadRoles();
    this.loadTiposDocumento();
  }

  // Cargar la lista de roles desde el backend
  private loadRoles(): void {
    this.rolesService.getRoles({ page_size: 100 }).subscribe({
      next: (response) => {
        this.roles.set(response.results);
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
      }
    });
  }

  // Cargar la lista de tipos de documento desde el backend
  private loadTiposDocumento(): void {
    this.tiposDocumentoService.getTiposDocumento().subscribe({
      next: (response) => {
        this.tiposDocumento.set(response.data);
      },
      error: (err) => {
        console.error('Error al cargar tipos de documento:', err);
      }
    });
  }

  // 4. Estado general del botón del formulario
  isFormInvalid = computed(() => {
    // Angular Signal Forms maneja las validaciones automáticamente
    return false;
  });
  
  // Signal para controlar el estado de carga
  isSaving = signal<boolean>(false);

  private mapToApiRequest(userData: UserData): CreateUserRequest {
    return {
      username: userData.username || '',
      email_institucional: userData.email,
      estado: userData.state === 'Activo',
      persona: {
        id_tipo_documento: userData.persona.id_tipo_documento,
        numero_documento: userData.persona.numero_documento,
        nombres: userData.persona.nombres,
        apellido_paterno: userData.persona.apellido_paterno,
        apellido_materno: userData.persona.apellido_materno,
        genero: userData.persona.genero,
        telefono: userData.persona.telefono,
        correo_personal: userData.persona.correo_personal,
        estado: userData.persona.estado
      },
      id_rol: userData.id_rol,
      id_roles: userData.id_roles
    };
  }

  private extractFieldErrors(errorResponse: any): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    
    if (!errorResponse) return fieldErrors;
    
    const detalles = errorResponse.detalles || errorResponse;
    
    if (typeof detalles === 'object') {
      // Procesar campos directos (email_institucional, id_roles, etc.)
      for (const [key, value] of Object.entries(detalles)) {
        if (key === 'persona') continue;
        
        if (Array.isArray(value) && value.length > 0) {
          fieldErrors[key] = value[0];
        } else if (typeof value === 'string') {
          fieldErrors[key] = value;
        }
      }
      
      // Procesar campos anidados en persona
      if (detalles.persona && typeof detalles.persona === 'object') {
        for (const [key, value] of Object.entries(detalles.persona)) {
          if (Array.isArray(value) && value.length > 0) {
            fieldErrors[key] = value[0];
          } else if (typeof value === 'string') {
            fieldErrors[key] = value;
          }
        }
      }
    }
    
    return fieldErrors;
  }

  onSave(event: Event): void {
    event.preventDefault();
    // Limpiar errores previos del backend
    this.backendErrors.set({});

    if (this.userForm().invalid()) {
      // Marcar todos los campos como touched para mostrar errores
      this.userForm.email().markAsTouched();
      this.userForm.state().markAsTouched();
      this.userForm.id_roles().markAsTouched();
      this.userForm.persona.id_tipo_documento().markAsTouched();
      this.userForm.persona.numero_documento().markAsTouched();
      this.userForm.persona.nombres().markAsTouched();
      this.userForm.persona.apellido_paterno().markAsTouched();
      this.userForm.persona.apellido_materno().markAsTouched();
      this.userForm.persona.genero().markAsTouched();
      this.userForm.persona.telefono().markAsTouched();
      this.userForm.persona.correo_personal().markAsTouched();
      return;
    }
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    
    
    this.isSaving.set(true);

    // Usar userModal directamente
    const payload: UserData = {
      username: this.userModal().username.trim().toLowerCase(),
      email: this.userModal().email.trim().toLowerCase(),
      state: this.userModal().state,
      id_rol: this.userModal().id_rol,
      id_roles: this.userModal().id_roles,
      persona: {
        id_tipo_documento: this.userModal().persona.id_tipo_documento,
        numero_documento: this.userModal().persona.numero_documento.trim(),
        nombres: this.userModal().persona.nombres.trim().toUpperCase(),
        apellido_paterno: this.userModal().persona.apellido_paterno.trim().toUpperCase(),
        apellido_materno: this.userModal().persona.apellido_materno.trim().toUpperCase(),
        genero: this.userModal().persona.genero,
        telefono: this.userModal().persona.telefono.trim(),
        correo_personal: this.userModal().persona.correo_personal.trim().toLowerCase(),
        estado: this.userModal().persona.estado
      }
    };

    const apiRequest = this.mapToApiRequest(payload);

    if (this.isEditMode()) {
      // MODO EDICIÓN: Actualizar usuario existente
      this.usersService.updateUser(this.inputData?.id || 0, apiRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          // Cerrar el modal y notificar éxito
          this.dialogRef.close({ action: 'success', data: payload });
        },
        error: (err) => {
          this.isSaving.set(false);
          const fieldErrors = this.extractFieldErrors(err.error);
          this.setBackendErrors(fieldErrors);
        }
      });
    } else {
      // MODO CREACIÓN: Crear nuevo usuario
      this.usersService.createUser(apiRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          // Cerrar el modal y notificar éxito
          this.dialogRef.close({ action: 'success', data: payload });
        },
        error: (err) => {
          this.isSaving.set(false);
          const fieldErrors = this.extractFieldErrors(err.error);
          this.setBackendErrors(fieldErrors);
        }
      });
    }
  }

  // Método público para cerrar el modal (llamado desde el componente padre)
  closeModal(): void {
    this.dialogRef.close();
  }

  // Método para establecer errores del backend (llamado desde el componente padre)
  setBackendErrors(errors: Record<string, string>): void {
    this.ngZone.runOutsideAngular(() => {
      this.ngZone.run(() => {
        this.backendErrors.set(errors);
        // Angular Signal Forms maneja el estado touched automáticamente
        // Forzar detección de cambios
        this.cdr.detectChanges();
      });
    });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  errorIconPath = computed(() => this.iconService.getIconPath('error')());
}
