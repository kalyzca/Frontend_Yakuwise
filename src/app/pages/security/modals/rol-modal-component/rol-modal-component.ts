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
import { form, required, FormField, minLength } from '@angular/forms/signals'; 

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
    MatError
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

  readonly isEditMode = signal<boolean>(false); 
  readonly isLoading = signal<boolean>(false);
  readonly isActive = signal<boolean>(false); 
  readonly errorIconPath = signal<string>('assets/icons/error.svg'); 
  readonly serverError = signal<string | null>(null); 
  readonly statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');
  private readonly regexRole = /^[a-zA-ZáéíóúÁÉÍÓÚ ]+$/;
  
  readonly roleModel = signal<RoleData>({ name: '', state: 'Inactivo' }); 
  
  readonly roleForm = form( 
    this.roleModel, (fieldPath) => { 
      required(fieldPath.name, { message: 'El nombre del rol es requerido.' });
      minLength(fieldPath.name, 5, { message: 'El nombre del rol debe tener al menos 5 caracteres.' });
    } 
  ); 

  ngOnInit(): void { 
    if (this.data) { 
      this.isEditMode.set(true); 
      this.isActive.set(this.data.state === 'Activo'); 
      
      this.roleModel.set({
        id: this.data.id,
        name: this.data.name || '',
        state: this.data.state || 'Inactivo'
      });
    } 
  } 
  
  onInputChange(): void {
    if (this.serverError()) {
      this.serverError.set(null);
    }
  }

  onSave(event: Event) {
    console.log('error!!',this.serverError())
    event.preventDefault();

    if (this.roleForm().invalid()) { 
      this.roleForm.name().markAsTouched(); 
      return; 
    }

    this.isLoading.set(true); 
    this.serverError.set(null); 
    
    const apiRequest: CreateRoleRequest = { 
      nombre_rol: this.roleModel().name.trim().toUpperCase(), 
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
          const backendMessage = err.error?.detalles?.nombre_rol || 'Error al actualizar el rol.'; 
          this.serverError.set(backendMessage); 
          console.log('error edit',backendMessage);
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
          const backendMessage = err.error?.detalles?.nombre_rol || 'Error al crear el rol.'; 
          this.serverError.set(backendMessage); 
          this.roleForm.name().markAsTouched();
        } 
      }); 
    } 
  } 

  onCancel(): void { 
    this.dialogRef.close(false); 
  }

  blockNumbers(event: KeyboardEvent): void {
    if (!this.regexRole.test(event.key)) {
      event.preventDefault();
    }
  }

}
