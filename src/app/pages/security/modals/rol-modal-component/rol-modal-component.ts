import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatError, MatFormFieldModule } from '@angular/material/form-field'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { FormsModule } from '@angular/forms'; 
import { RolesService } from '../../../../shared/services/roles.service'; 
import { AlertService } from '../../../../shared/services/alert.service'; 
import { RoleData, CreateRoleRequest } from '../../../../shared/interfaces/roles-interface'; 
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
  public errorService = inject(FormErrorService);

  readonly isEditMode = signal<boolean>(false); 
  readonly isLoading = signal<boolean>(false);
  readonly isActive = signal<boolean>(false); 
  readonly errorIconPath = signal<string>('assets/icons/error.svg'); 
  backendErrors = signal<Record<string, string[]>>({});
  readonly statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');
  readonly roleModel = signal<RoleData>({ nombre_rol: '', state: 'Inactivo' }); 
  
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
      this.isActive.set(this.data.state === 'Activo'); 
      
      this.roleModel.set({
        id: this.data.id,
        nombre_rol: this.data.nombre_rol || '',
        state: this.data.state || 'Inactivo'
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
    
    if (this.isEditMode() && this.data?.id) { 
      this.rolesService.updateRole(this.data.id, apiRequest).subscribe({ 
        next: (result) => {
          this.isLoading.set(false);
          this.alertService.success('Rol actualizado exitosamente.'); 
          this.dialogRef.close(result);
        }, 
        error: (err) => {
          this.isLoading.set(false);
          this.alertService.error(err.mensajeGeneral);
          if (err.detalles) return this.backendErrors.set(err.detalles);
        } 
      }); 
    } 
    else { 
      this.rolesService.createRole(apiRequest).subscribe({ 
        next: (result) => { 
          this.isLoading.set(false);
          this.alertService.success('Rol creado exitosamente.');
          this.dialogRef.close(result);
        }, 
        error: (err) => { 
          this.isLoading.set(false);
          this.alertService.error(err.mensajeGeneral);
        if (err.detalles) return this.backendErrors.set(err.detalles);
        } 
      }); 
    } 
  } 

}
