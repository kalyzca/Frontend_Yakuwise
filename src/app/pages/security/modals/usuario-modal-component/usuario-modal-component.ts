import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions,  MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MatFormField, MatError } from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { RolesService, RoleResponse } from '../../../../shared/services/roles.service';
import { IconService } from '../../../../shared/services/icon.service';
import { CommonModule } from '@angular/common';

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
})

export class UsuarioModalComponent {
  private readonly dialogRef = inject(MatDialogRef<UsuarioModalComponent>);
  private readonly inputData = inject<UserData | undefined>(MAT_DIALOG_DATA);
  private readonly rolesService = inject(RolesService);
  private readonly iconService = inject(IconService);

  roles = signal<RoleResponse[]>([]);

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
  idRolTouched = signal<boolean>(false);
  idRolesTouched = signal<boolean>(false);

  isEditMode = signal<boolean>(!!this.inputData);

  constructor() {
    this.loadRoles();
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

  // CONVERSIÓN DE SALIDA: Traduce el booleano del checkbox a la cadena que la tabla necesita
  statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');

  // 3. Señal computada para manejar las validaciones
  emailError = computed(() => {
    if (!this.emailTouched()) return null;
    const emailValue = this.email().trim();
    if (emailValue === '') return 'El email institucional es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) return 'Ingrese un email válido.';
    return null;
  });

  numeroDocumentoError = computed(() => {
    if (!this.numeroDocumentoTouched()) return null;
    return this.numeroDocumento().trim() === '' ? 'El número de documento es obligatorio.' : null;
  });

  nombresError = computed(() => {
    if (!this.nombresTouched()) return null;
    return this.nombres().trim() === '' ? 'Los nombres son obligatorios.' : null;
  });

  apellidoPaternoError = computed(() => {
    if (!this.apellidoPaternoTouched()) return null;
    return this.apellidoPaterno().trim() === '' ? 'El apellido paterno es obligatorio.' : null;
  });

  apellidoMaternoError = computed(() => {
    if (!this.apellidoMaternoTouched()) return null;
    return this.apellidoMaterno().trim() === '' ? 'El apellido materno es obligatorio.' : null;
  });

  generoError = computed(() => {
    if (!this.generoTouched()) return null;
    return this.genero().trim() === '' ? 'El género es obligatorio.' : null;
  });

  telefonoError = computed(() => {
    if (!this.telefonoTouched()) return null;
    return this.telefono().trim() === '' ? 'El teléfono es obligatorio.' : null;
  });

  correoPersonalError = computed(() => {
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
    if (!this.idRolesTouched()) return null;
    return this.idRoles().length === 0 ? 'Debe seleccionar al menos un rol.' : null;
  });

  // 4. Estado general del botón del formulario
  isFormInvalid = computed(() => {
    return this.email().trim() === '' ||
           this.numeroDocumento().trim() === '' ||
           this.nombres().trim() === '' ||
           this.apellidoPaterno().trim() === '' ||
           this.apellidoMaterno().trim() === '' ||
           this.genero().trim() === '' ||
           this.telefono().trim() === '' ||
           this.correoPersonal().trim() === '' ||
           this.idRoles().length === 0;
  });
  
  onSave(): void {
    // Si el usuario da clic directamente en guardar sin tocar nada, forzamos los errores
    if (this.isFormInvalid()) {
      this.emailTouched.set(true);
      this.numeroDocumentoTouched.set(true);
      this.nombresTouched.set(true);
      this.apellidoPaternoTouched.set(true);
      this.apellidoMaternoTouched.set(true);
      this.generoTouched.set(true);
      this.telefonoTouched.set(true);
      this.correoPersonalTouched.set(true);
      this.idRolesTouched.set(true);
      return;
    }

    // Devolvemos el objeto limpio estructurado exactamente como lo espera la tabla
    const payload: UserData = {
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

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  errorIconPath = computed(() => this.iconService.getIconPath('error')());
}
