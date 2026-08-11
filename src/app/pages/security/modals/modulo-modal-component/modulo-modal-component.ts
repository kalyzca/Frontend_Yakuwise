import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatFormFieldModule, MatFormField, MatError } from '@angular/material/form-field'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms'; 
import { ModulosService } from '../../../../shared/services/modulos.service'; 
import { AlertService } from '../../../../shared/services/alert.service'; 
import { ModuloData, CreateModuloRequest } from '../../../../shared/interfaces/modulos-interface'; 
import { form, required, minLength, FormField } from '@angular/forms/signals';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { AppHttpError } from '../../../../shared/interfaces/error-interface';
import { IconService } from '../../../../shared/services/icon.service'; 

@Component({ 
  selector: 'app-modulo-modal', 
  standalone: true, 
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSlideToggleModule, 
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    MatFormField,
    MatError,
    FormField
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
  public errorService = inject(FormErrorService);
  private readonly iconService = inject(IconService);

  readonly isEditMode = signal<boolean>(false); 
  readonly isLoading = signal<boolean>(false);
  readonly isActive = signal<boolean>(false); 
  readonly errorIconPath = computed(() => this.iconService.getIconPath('error')());
  readonly backendErrors = signal<Record<string, string[]>>({});
  readonly statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');
  private readonly regexModulo = /^[a-zA-ZáéíóúÁÉÍÓÚ ]+$/;
  
  readonly moduloModel = signal<ModuloData>({ name: '', state: 'Inactivo' });

  readonly moduloForm = form(this.moduloModel, (fieldPath) => {
    required(fieldPath.name, { message: 'El nombre del módulo es requerido.' });
    minLength(fieldPath.name, 5, { message: 'El nombre del módulo debe tener al menos 5 caracteres.' });
  });

  nameError = this.errorService.createFieldTracker(this.moduloForm.name, this.backendErrors, 'nombre_modulo'); 

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
  
  onSave(event: Event) {
    event.preventDefault();

    if (this.moduloForm.name().invalid()) {
      this.moduloForm.name().markAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.backendErrors.set({});
    
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
      this.modulosService.createModulo(apiRequest).subscribe({ 
        next: (result) => { 
          this.isLoading.set(false);
          this.alertService.success('Módulo creado exitosamente.');
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

  blockNumbers(event: KeyboardEvent): void {
    if (!this.regexModulo.test(event.key)) {
      event.preventDefault();
    }
  }

  closeModal(): void {
    this.dialogRef.close(false);
  }

}
