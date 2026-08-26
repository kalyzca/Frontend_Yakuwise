import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, minLength, maxLength, pattern, required, disabled, min } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MatFormField, MatError } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { RolesService } from '../../../../shared/services/roles.service';
import { TiposDocumentoService, TipoDocumentoResponse } from '../../../../shared/services/tipos-documento.service';
import { IconService } from '../../../../shared/services/icon.service';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../shared/services/users.service';
import { CreateUserRequest, UserData, UserFormData } from '../../../../shared/interfaces/usuario-interface';
import { RoleResponse } from '../../../../shared/interfaces/roles-interface';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { AlertService } from '../../../../shared';
import { AppHttpError } from '../../../../shared/interfaces/error-interface';
import { LetrasDirective } from '../../../../shared/directives/letras-directive';

@Component({
  selector: 'app-usuario-modal-component',
  imports: [FormsModule, MatDialogActions, MatFormFieldModule, MatInputModule, MatButtonModule,  MatFormField, MatCheckboxModule, MatError, MatSlideToggleModule, MatSelectModule, CommonModule, FormField, MatDialogModule, LetrasDirective],
  templateUrl: './usuario-modal-component.html',
  styleUrl: './usuario-modal-component.scss',
})

export class UsuarioModalComponent {
  private readonly dialogRef = inject(MatDialogRef<UsuarioModalComponent>);
  private readonly inputData = inject<UserData | undefined>(MAT_DIALOG_DATA);
  private readonly rolesService = inject(RolesService);
  private readonly tiposDocumentoService = inject(TiposDocumentoService);
  private readonly iconService = inject(IconService);
  private readonly usersService = inject(UsersService);
  public readonly errorService = inject(FormErrorService);
  private readonly alertService = inject(AlertService);

  readonly roles = signal<RoleResponse[]>([]);
  readonly tiposDocumento = signal<TipoDocumentoResponse[]>([]);
  readonly backendErrors = signal<Record<string, string[]>>({});
  readonly isEditMode = signal<boolean>(!!this.inputData?.id);
  readonly isReadOnly = signal<boolean>((this.inputData as any)?.isReadOnly === true);
  readonly isSaving = signal<boolean>(false);
  errorIconPath = computed(() => this.iconService.getIconPath('error')());
  private readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly ROLES_PAGE_SIZE = 100;
  private readonly PERSONA_FIELDS = [
    'id_tipo_documento', 'numero_documento', 'nombres',
    'apellido_paterno', 'apellido_materno', 'genero',
    'telefono', 'correo_personal'
  ] as const;

  private getInitialUserModal(): UserFormData {
    if (!this.inputData) {
      return this.getDefaultUser();
    }

    return this.getUserFromInput();
  }

  private getDefaultUser(): UserFormData {
    return {
      username: '',
      email: '',
      state: 'Inactivo',
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

  private getUserFromInput(): UserFormData {
    const data = this.inputData!;
    return {
      username: data.username || '',
      email: data.email,
      state: data.state,
      id_roles: data.id_roles || [],
      name: data.name || '',
      roles_names: data.roles_names || [],
      persona: {
        id_tipo_documento: data.persona.id_tipo_documento,
        numero_documento: data.persona.numero_documento,
        nombres: data.persona.nombres,
        apellido_paterno: data.persona.apellido_paterno,
        apellido_materno: data.persona.apellido_materno,
        genero: data.persona.genero,
        telefono: data.persona.telefono,
        correo_personal: data.persona.correo_personal,
        estado: data.persona.estado
      }
    };
  }

  userModal = signal<UserFormData>(this.getInitialUserModal());

  userForm = form(this.userModal, (fieldPath) => {
    this.setupDisabledFields(fieldPath);
    this.setupValidationRules(fieldPath);
  });

  private setupDisabledFields(fieldPath: any): void {
    this.PERSONA_FIELDS.forEach(field => {
      disabled(fieldPath.persona[field], () => this.isReadOnly());
    });

    disabled(fieldPath.id_roles, () => this.isReadOnly());
    disabled(fieldPath.email, () => this.isReadOnly());
    disabled(fieldPath.state, () => this.isReadOnly());
  }

  private setupValidationRules(fieldPath: any): void {
    this.setupMinLengthValidations(fieldPath);
    this.setupMaxLengthValidations(fieldPath);
    this.setupRequiredValidations(fieldPath);
    this.setupPatternValidations(fieldPath);
  }

  private setupMinLengthValidations(fieldPath: any): void {
    minLength(fieldPath.id_roles, 1, { message: 'Debe seleccionar al menos un rol.' });
    minLength(fieldPath.persona.nombres, 2, { message: 'El nombre debe tener al menos 2 caracteres.' });
    minLength(fieldPath.persona.apellido_paterno, 2, { message: 'El apellido paterno debe tener al menos 2 caracteres.' });
    minLength(fieldPath.persona.apellido_materno, 2, { message: 'El apellido materno debe tener al menos 2 caracteres.' });
  }

  private setupMaxLengthValidations(fieldPath: any): void {
    maxLength(fieldPath.persona.numero_documento, 12, { message: 'El número de documento de identidad debe tener un máximo de 12 dígitos numéricos.' });
    maxLength(fieldPath.persona.nombres, 30, { message: 'El nombre debe tener un máximo de 30 caracteres.' });
    maxLength(fieldPath.persona.apellido_paterno, 30, { message: 'El apellido paterno debe tener un máximo de 30 caracteres.' });
    maxLength(fieldPath.persona.apellido_materno, 30, { message: 'El apellido materno debe tener un máximo de 30 caracteres.' });
  }

  private setupRequiredValidations(fieldPath: any): void {
    min(fieldPath.persona.id_tipo_documento, 1, { message: 'Tipo de documento requerido.' });
    required(fieldPath.persona.numero_documento, { message: 'Número de documento requerido.' });
    required(fieldPath.persona.genero, { message: 'Género requerido.' });
    required(fieldPath.persona.telefono, { message: 'Teléfono requerido.' });
    required(fieldPath.persona.nombres, { message: 'Nombres requeridos.' });
    required(fieldPath.persona.apellido_paterno, { message: 'Apellido paterno requerido.' });
    required(fieldPath.persona.correo_personal, { message: 'Correo personal requerido.' });
    required(fieldPath.email, { message: 'Email institucional requerido.' });
  }

  private setupPatternValidations(fieldPath: any): void {
    pattern(fieldPath.persona.correo_personal, this.EMAIL_REGEX, { message: 'Correo personal inválido.' });
    pattern(fieldPath.email, this.EMAIL_REGEX, { message: 'Email inválido.' });
  }

  constructor() {
    this.loadRoles();
    this.loadTiposDocumento();
  }

  numeroDocError = this.errorService.createFieldTracker(this.userForm.persona.numero_documento, this.backendErrors, 'persona.numero_documento');
  telefonoError = this.errorService.createFieldTracker(this.userForm.persona.telefono, this.backendErrors, 'persona.telefono');

  private loadRoles(): void {
    this.rolesService.getRoles({ page_size: this.ROLES_PAGE_SIZE }).subscribe({
      next: (response) => this.roles.set(response.results),
      error: (err) => console.error('Error al cargar roles:', err)
    });
  }

  private loadTiposDocumento(): void {
    this.tiposDocumentoService.getTiposDocumento().subscribe({
      next: (response) => this.tiposDocumento.set(response.data),
      error: (err) => console.error('Error al cargar tipos de documento:', err)
    });
  }

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
      id_roles: userData.id_roles || []
    };
  }

  onSave(event: Event): void {
    event.preventDefault();
    if (this.isReadOnly()) return;

    this.backendErrors.set({});

    if (this.userForm().invalid()) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSaving.set(true);

    const payload = this.preparePayload();
    const apiRequest = this.mapToApiRequest(payload);

    if (this.isEditMode()) {
      this.updateUser(apiRequest);
    } else {
      this.createUser(apiRequest);
    }
  }

  private markAllFieldsAsTouched(): void {
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
  }

  private preparePayload(): UserData {
    const userData = this.userModal();
    return {
      username: userData.username.trim().toLowerCase(),
      email: userData.email.trim(),
      state: userData.state,
      id_roles: userData.id_roles,
      persona: {
        id_tipo_documento: userData.persona.id_tipo_documento,
        numero_documento: userData.persona.numero_documento.trim(),
        nombres: userData.persona.nombres.trim().toUpperCase(),
        apellido_paterno: userData.persona.apellido_paterno.trim().toUpperCase(),
        apellido_materno: userData.persona.apellido_materno.trim().toUpperCase(),
        genero: userData.persona.genero,
        telefono: userData.persona.telefono.trim(),
        correo_personal: userData.persona.correo_personal.trim(),
        estado: userData.persona.estado
      }
    };
  }

  private createUser(apiRequest: CreateUserRequest): void {
    this.usersService.createUser(apiRequest).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (err: AppHttpError) => this.manejarErroresBackend(err)
    });
  }

  private updateUser(apiRequest: CreateUserRequest): void {
    this.usersService.updateUser(this.inputData?.id || 0, apiRequest).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (err: AppHttpError) => this.manejarErroresBackend(err)
    });
  }

  private handleSuccess(response: any): void {
    this.isSaving.set(false);
    this.dialogRef.close(response);
    this.alertService.success(response.message);
  }
  
  private manejarErroresBackend(err: AppHttpError): void {
    this.isSaving.set(false);
    this.alertService.error(err.mensajeGeneral || 'Ocurrió un error al procesar los datos.');

    const erroresMapeados = this.mapBackendErrors(err.detalles);
    this.backendErrors.set(erroresMapeados);
    this.refreshErrorFields();
  }

  private mapBackendErrors(detalles: any): Record<string, string[]> {
    const erroresMapeados: Record<string, string[]> = {};

    if (!detalles || typeof detalles !== 'object') {
      return erroresMapeados;
    }

    this.mapPersonaErrors(detalles['persona'], erroresMapeados);
    this.mapRootErrors(detalles, erroresMapeados);

    return erroresMapeados;
  }

  private mapPersonaErrors(datosPersona: any, erroresMapeados: Record<string, string[]>): void {
    if (!datosPersona || typeof datosPersona !== 'object' || Array.isArray(datosPersona)) {
      return;
    }

    Object.keys(datosPersona).forEach(campoPersona => {
      const mensajes = datosPersona[campoPersona];
      if (Array.isArray(mensajes)) {
        erroresMapeados[`persona.${campoPersona}`] = mensajes;
      }
    });
  }

  private mapRootErrors(detalles: any, erroresMapeados: Record<string, string[]>): void {
    Object.keys(detalles).forEach(key => {
      if (key !== 'persona' && Array.isArray(detalles[key])) {
        erroresMapeados[key] = detalles[key];
      }
    });
  }

  private refreshErrorFields(): void {
    if (this.userForm.persona?.numero_documento) {
      this.userForm.persona.numero_documento().markAsTouched();
    }
    if (this.userForm.persona?.telefono) {
      this.userForm.persona.telefono().markAsTouched();
    }
  }

}
