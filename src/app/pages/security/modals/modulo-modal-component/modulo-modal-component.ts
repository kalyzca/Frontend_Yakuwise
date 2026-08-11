import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { FormsModule } from '@angular/forms'; 
import { ModulosService } from '../../../../shared/services/modulos.service'; 
import { AlertService } from '../../../../shared/services/alert.service'; 
import { ModuloData, CreateModuloRequest } from '../../../../shared/interfaces/modulos-interface'; 
import { form, required, minLength } from '@angular/forms/signals'; 

@Component({ 
  selector: 'app-modulo-modal', 
  standalone: true, 
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSlideToggleModule, 
    FormsModule
  ], 
  templateUrl: './modulo-modal-component.html', 
  styleUrl: './modulo-modal-component.scss', 
  changeDetection: ChangeDetectionStrategy.OnPush 
})

export class ModuloModalComponent implements OnInit { 
  private readonly modulosService = inject(ModulosService); 
  private readonly alertService = inject(AlertService); 
  private readonly dialogRef = inject(MatDialogRef<ModuloModalComponent>); 
  readonly data: ModuloData | null = inject(MAT_DIALOG_DATA); 

  readonly isEditMode = signal<boolean>(false); 
  readonly isLoading = signal<boolean>(false);
  readonly isActive = signal<boolean>(false); 
  readonly errorIconPath = signal<string>('assets/icons/error.svg'); 
  readonly serverError = signal<string | null>(null); 
  readonly statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');
  private readonly regexModulo = /^[a-zA-ZáéíóúÁÉÍÓÚ ]+$/;
  
  readonly moduloModel = signal<ModuloData>({ name: '', state: 'Inactivo' }); 
  
  readonly moduloForm = form( 
    this.moduloModel, (fieldPath) => { 
      required(fieldPath.name, { message: 'El nombre del módulo es requerido.' });
      minLength(fieldPath.name, 5, { message: 'El nombre del módulo debe tener al menos 5 caracteres.' });
    } 
  ); 

  ngOnInit(): void { 
    if (this.data) { 
      this.isEditMode.set(true); 
      this.isActive.set(this.data.state === 'Activo'); 
      
      this.moduloModel.set({
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

    if (this.moduloForm().invalid()) { 
      this.moduloForm.name().markAsTouched(); 
      return; 
    }

    this.isLoading.set(true); 
    this.serverError.set(null); 
    
    const apiRequest: CreateModuloRequest = { 
      nombre_modulo: this.moduloModel().name.trim().toUpperCase(), 
      estado: this.isActive() 
    }; 
    
    if (this.isEditMode() && this.data?.id) { 
      this.modulosService.updateModulo(this.data.id, apiRequest).subscribe({ 
        next: (result) => {
          this.isLoading.set(false);
          this.alertService.success('Módulo actualizado exitosamente.'); 
          this.dialogRef.close(result);
        }, 
        error: (err) => {
          this.isLoading.set(false);
          const backendMessage = err.error?.detalles?.nombre_modulo || 'Error al actualizar el módulo.'; 
          this.serverError.set(backendMessage); 
          console.log('error edit',backendMessage);
        } 
      }); 
    } 
    else { 
      this.modulosService.createModulo(apiRequest).subscribe({ 
        next: (result) => { 
          this.isLoading.set(false);
          this.alertService.success('Módulo creado exitosamente.');
          this.dialogRef.close(result);
        }, 
        error: (err) => { 
          this.isLoading.set(false);
          const backendMessage = err.error?.detalles?.nombre_modulo || 'Error al crear el módulo.'; 
          this.serverError.set(backendMessage); 
          this.moduloForm.name().markAsTouched();
        } 
      }); 
    } 
  } 

  onCancel(): void { 
    this.dialogRef.close(false); 
  }

  blockNumbers(event: KeyboardEvent): void {
    if (!this.regexModulo.test(event.key)) {
      event.preventDefault();
    }
  }

}
