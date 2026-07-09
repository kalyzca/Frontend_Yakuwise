import { Component, computed, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
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

export interface PersonaData {
  id_tipo_documento: number;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  genero: string;
  telefono: string;
  correo_personal: string;
  estado: boolean;
}

export interface UserData {
  id?: number;
  username?: string;
  email: string;
  state: string;
  id_rol: number;
  id_roles?: number[];
  persona: PersonaData;
  name?: string;
  roles_names?: string[];
}

@Component({
  selector: 'app-usuario-modal-component',
  imports: [FormsModule, MatDialogActions, MatFormFieldModule, MatInputModule, MatDialogTitle, MatDialogContent, MatButtonModule,  MatFormField, MatCheckboxModule, MatError, MatSlideToggleModule, MatSelectModule, CommonModule],
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

  username = signal<string>(this.inputData?.username ?? '');
  email = signal<string>(this.inputData?.email ?? '');
  isActive = signal<boolean>(this.inputData?.state === 'Activo');
  idRol = signal<number>(this.inputData?.id_rol ?? 1);
  idRoles = signal<number[]>(this.inputData?.id_roles ?? [this.inputData?.id_rol ?? 1]);

  // Persona fields
  idTipoDocumento = signal<number>(this.inputData?.persona?.id_tipo_documento ?? 0);
  numeroDocumento = signal<string>(this.inputData?.persona?.numero_documento ?? '');
  nombres = signal<string>(this.inputData?.persona?.nombres ?? '');
  apellidoPaterno = signal<string>(this.inputData?.persona?.apellido_paterno ?? '');
  apellidoMaterno = signal<string>(this.inputData?.persona?.apellido_materno ?? '');
  genero = signal<string>(this.inputData?.persona?.genero ?? '');
  telefono = signal<string>(this.inputData?.persona?.telefono ?? '');
  correoPersonal = signal<string>(this.inputData?.persona?.correo_personal ?? '');
  personaActiva = signal<boolean>(this.inputData?.persona?.estado ?? true);

  // 2. Estado de interacción (touched) para no mostrar errores prematuros
  emailTouched = signal<boolean>(false);
  numeroDocumentoTouched = signal<boolean>(false);
  nombresTouched = signal<boolean>(false);
  apellidoPaternoTouched = signal<boolean>(false);
  apellidoMaternoTouched = signal<boolean>(false);
  generoTouched = signal<boolean>(false);
  telefonoTouched = signal<boolean>(false);
  correoPersonalTouched = signal<boolean>(false);
  idTipoDocumentoTouched = signal<boolean>(false);
  idRolTouched = signal<boolean>(false);
  idRolesTouched = signal<boolean>(false);

  // Backend errors signals
  backendErrors = signal<Record<string, string>>((this.inputData as any)?._backendErrors || {});

  isEditMode = signal<boolean>(!!this.inputData?.id);

  constructor() {
    this.loadRoles();
    this.loadTiposDocumento();
    
    // Si hay errores del backend iniciales, marcar todos los campos como touched
    if ((this.inputData as any)?._backendErrors) {
      this.emailTouched.set(true);
      this.numeroDocumentoTouched.set(true);
      this.nombresTouched.set(true);
      this.apellidoPaternoTouched.set(true);
      this.apellidoMaternoTouched.set(true);
      this.generoTouched.set(true);
      this.telefonoTouched.set(true);
      this.correoPersonalTouched.set(true);
      this.idTipoDocumentoTouched.set(true);
      this.idRolesTouched.set(true);
    }
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

  // CONVERSIÓN DE SALIDA: Traduce el booleano del checkbox a la cadena que la tabla necesita
  statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');

  // 3. Señal computada para manejar las validaciones
  emailError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['email_institucional'] || this.backendErrors()['email'];
    if (backendError) return backendError;
    
    if (!this.emailTouched()) return null;
    const emailValue = this.email().trim();
    if (emailValue === '') return 'El email institucional es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) return 'Ingrese un email válido.';
    return null;
  });

  numeroDocumentoError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['numero_documento'] || this.backendErrors()['persona__numero_documento'];
    if (backendError) return backendError;
    
    if (!this.numeroDocumentoTouched()) return null;
    return this.numeroDocumento().trim() === '' ? 'El número de documento es obligatorio.' : null;
  });

  nombresError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['nombres'] || this.backendErrors()['persona__nombres'];
    if (backendError) return backendError;
    
    if (!this.nombresTouched()) return null;
    return this.nombres().trim() === '' ? 'Los nombres son obligatorios.' : null;
  });

  apellidoPaternoError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['apellido_paterno'] || this.backendErrors()['persona__apellido_paterno'];
    if (backendError) return backendError;
    
    if (!this.apellidoPaternoTouched()) return null;
    return this.apellidoPaterno().trim() === '' ? 'El apellido paterno es obligatorio.' : null;
  });

  apellidoMaternoError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['apellido_materno'] || this.backendErrors()['persona__apellido_materno'];
    if (backendError) return backendError;
    
    if (!this.apellidoMaternoTouched()) return null;
    return this.apellidoMaterno().trim() === '' ? 'El apellido materno es obligatorio.' : null;
  });

  generoError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['genero'] || this.backendErrors()['persona__genero'];
    if (backendError) return backendError;
    
    if (!this.generoTouched()) return null;
    return this.genero().trim() === '' ? 'El género es obligatorio.' : null;
  });

  telefonoError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['telefono'] || this.backendErrors()['persona__telefono'];
    if (backendError) return backendError;
    
    if (!this.telefonoTouched()) return null;
    return this.telefono().trim() === '' ? 'El teléfono es obligatorio.' : null;
  });

  correoPersonalError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['correo_personal'] || this.backendErrors()['persona__correo_personal'];
    if (backendError) return backendError;
    
    if (!this.correoPersonalTouched()) return null;
    const correoValue = this.correoPersonal().trim();
    if (correoValue === '') return 'El correo personal es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoValue)) return 'Ingrese un correo válido.';
    return null;
  });

  idRolError = computed(() => {
    if (!this.idRolTouched()) return null;
    return this.idRol() === 0 ? 'El rol es obligatorio.' : null;
  });

  idRolesError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['id_roles'] || this.backendErrors()['id_rol'];
    if (backendError) return backendError;
    
    if (!this.idRolesTouched()) return null;
    return this.idRoles().length === 0 ? 'Debe seleccionar al menos un rol.' : null;
  });

  idTipoDocumentoError = computed(() => {
    // Prioridad a errores del backend
    const backendError = this.backendErrors()['id_tipo_documento'] || this.backendErrors()['persona__id_tipo_documento'];
    if (backendError) return backendError;
    
    if (!this.idTipoDocumentoTouched()) return null;
    return this.idTipoDocumento() === 0 ? 'El tipo de documento es obligatorio.' : null;
  });

  // 4. Estado general del botón del formulario
  isFormInvalid = computed(() => {
    // Relajamos las validaciones para permitir que el backend valide
    return false;
  });
  
  // Signal para controlar el estado de carga
  isSaving = signal<boolean>(false);

  private mapToApiRequest(userData: UserData): CreateUserRequest {
    return {
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

  onSave(): void {
    // Limpiar errores previos del backend
    this.backendErrors.set({});
    this.isSaving.set(true);

    // Devolvemos el objeto limpio estructurado exactamente como lo espera la tabla
    const payload: UserData = {
      username: this.username().trim().toLowerCase(),
      email: this.email().trim().toLowerCase(),
      state: this.statusText(),
      id_rol: this.idRoles()[0] || 1,
      id_roles: this.idRoles(),
      persona: {
        id_tipo_documento: this.idTipoDocumento(),
        numero_documento: this.numeroDocumento().trim(),
        nombres: this.nombres().trim().toUpperCase(),
        apellido_paterno: this.apellidoPaterno().trim().toUpperCase(),
        apellido_materno: this.apellidoMaterno().trim().toUpperCase(),
        genero: this.genero(),
        telefono: this.telefono().trim(),
        correo_personal: this.correoPersonal().trim().toLowerCase(),
        estado: this.personaActiva()
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
        
        // Forzar que todos los campos estén touched para mostrar los errores del backend
        this.emailTouched.set(true);
        this.numeroDocumentoTouched.set(true);
        this.nombresTouched.set(true);
        this.apellidoPaternoTouched.set(true);
        this.apellidoMaternoTouched.set(true);
        this.generoTouched.set(true);
        this.telefonoTouched.set(true);
        this.correoPersonalTouched.set(true);
        this.idTipoDocumentoTouched.set(true);
        this.idRolesTouched.set(true);
        
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
