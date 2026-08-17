import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatError, MatFormFieldModule } from '@angular/material/form-field'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { FormsModule } from '@angular/forms'; 
import { RolesService } from '../../../../shared/services/roles.service'; 
import { AlertService } from '../../../../shared/services/alert.service'; 
import { IconService } from '../../../../shared/services/icon.service';
import { RoleData, CreateRoleRequest } from '../../../../shared/interfaces/roles-interface'; 
import { ESTADO_ACTIVO, ESTADO_INACTIVO } from '../../../../shared/utils/list-query.util';
import { AppHttpError } from '../../../../shared/interfaces/error-interface';
import { form, required, FormField, minLength,maxLength } from '@angular/forms/signals'; 
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { LetrasDirective } from '../../../../shared/directives/letras-directive';

@Component({ 
  selector: 'app-rol-modal', 
  standalone: true, 
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSlideToggleModule, 
    FormsModule, 
    FormField, 
    MatError,
    LetrasDirective
  ], 
  templateUrl: './rol-modal-component.html', 
  styleUrl: './rol-modal-component.scss', 
  changeDetection: ChangeDetectionStrategy.OnPush 
})

export class RolModalComponent implements OnInit { 
  private readonly rolesService = inject(RolesService); 
  private readonly alertService = inject(AlertService); 
  private readonly dialogRef = inject(MatDialogRef<RolModalComponent>); 
  readonly data: RoleData | null = inject(MAT_DIALOG_DATA); 
  private readonly iconService = inject(IconService);
  public errorService = inject(FormErrorService);

  readonly isEditMode = signal<boolean>(false); 
  readonly isLoading = signal<boolean>(false);
  readonly isActive = signal<boolean>(false); 
  readonly errorIconPath = this.iconService.errorIcon; 
  backendErrors = signal<Record<string, string[]>>({});
  readonly statusText = computed(() => this.isActive() ? ESTADO_ACTIVO : ESTADO_INACTIVO);
  readonly roleModel = signal<RoleData>({ nombre_rol: '', state: ESTADO_INACTIVO }); 
  
  readonly roleForm = form( 
    this.roleModel, (fieldPath) => { 
      required(fieldPath.nombre_rol, { message: 'El nombre del rol es requerido.' });
      minLength(fieldPath.nombre_rol, 4, { message: 'El nombre del rol debe tener al menos 4 caracteres.' });
      maxLength(fieldPath.nombre_rol, 40, { message: 'El nombre del rol debe tener máximo 40 caracteres.' });
    } 
  ); 

  rolError = this.errorService.createFieldTracker(this.roleForm.nombre_rol, this.backendErrors, 'nombre_rol');

  ngOnInit(): void { 
    if (this.data) { 
      this.isEditMode.set(true); 
      this.isActive.set(this.data.state === ESTADO_ACTIVO); 
      
      this.roleModel.set({
        id: this.data.id,
        nombre_rol: this.data.nombre_rol || '',
        state: this.data.state || ESTADO_INACTIVO
      });
    } 
  } 
  
  onSave(event: Event) {
    event.preventDefault();
    this.isLoading.set(true); 

    if (this.roleForm.nombre_rol().invalid()) { 
      this.roleForm.nombre_rol().markAsTouched(); 
      return; 
    }
    
    const apiRequest: CreateRoleRequest = { 
      nombre_rol: this.roleModel().nombre_rol.trim().toUpperCase(), 
      estado: this.isActive() 
    }; 
    
    const isEdit = this.isEditMode() && !!this.data?.id;

    const save$ = isEdit
      ? this.rolesService.updateRole(this.data!.id!, apiRequest)
      : this.rolesService.createRole(apiRequest);

    save$.subscribe({ 
      next: (result) => {
        this.isLoading.set(false);
        this.alertService.success(isEdit ? 'Rol actualizado exitosamente.' : 'Rol creado exitosamente.'); 
        this.dialogRef.close(result);
      }, 
      error: (err: AppHttpError) => this.errorService.handleBackendError(err, this.backendErrors, this.isLoading)
    }); 
  } 

}
