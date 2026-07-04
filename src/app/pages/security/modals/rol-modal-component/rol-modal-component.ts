import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions,  MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MatFormField, MatError } from '@angular/material/form-field'; 
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { IconService } from '../../../../shared/services/icon.service';

export interface RoleData {
  id?: number;
  name:string;
  state: string;
}

@Component({
  selector: 'app-rol-modal-component',
  imports: [FormsModule, MatDialogActions, MatFormFieldModule, MatInputModule, MatDialogTitle, MatDialogContent, MatButtonModule, MatFormField, MatError, MatSlideToggleModule],
  templateUrl: './rol-modal-component.html',
  styleUrl: './rol-modal-component.scss',
})

export class RolModalComponent {
  private readonly dialogRef = inject(MatDialogRef<RolModalComponent>);
  // Recibimos los datos de la tabla (pueden ser undefined si es un nuevo registro)
  private readonly inputData = inject<RoleData | undefined>(MAT_DIALOG_DATA);
  private readonly iconService = inject(IconService);
  dataState:any;

  // 1. Valores de los campos
  name = signal<string>(this.inputData?.name ?? '');
  isActive = signal<boolean>(this.inputData?.state === 'Activo');

  // 2. Estado de interacción (touched) para no mostrar errores prematuros
  nameTouched = signal<boolean>(false);
  isEditMode = signal<boolean>(!!this.inputData);

  // CONVERSIÓN DE SALIDA: Traduce el booleano del checkbox a la cadena que la tabla necesita
  statusText = computed(() => this.isActive() ? 'Activo' : 'Inactivo');

  // 3. Señal computada para manejar las validaciones
  nameError = computed(() => {
    if (!this.nameTouched()) return null; // No mostrar error si no ha interactuado
    return this.name().trim() === '' ? 'El nombre es obligatorio.': null;
  });

  // Signal para obtener la ruta del icono de error
  errorIconPath = computed(() => this.iconService.getIconPath('error')());

  // 4. Estado general del botón del formulario
  isFormInvalid = computed(() => this.name().trim() === '');
  
  onSave(): void {
    // Si el usuario da clic directamente en guardar sin tocar nada, forzamos los errores
    if (this.isFormInvalid()) {
      this.nameTouched.set(true);
      return;
    }

    // Devolvemos el objeto limpio estructurado exactamente como lo espera la tabla
    const payload: RoleData = {
      name: this.name().trim().toUpperCase(),
      state: this.statusText() // Enviará 'Activo' o 'Inactivo'
    };

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}


