
import { Component, inject, OnInit, signal } from '@angular/core';
import { form, required, FormRoot, FormField} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { elementAt } from 'rxjs';

export interface RoleFormData {
  name:string,
  state:boolean
}

@Component({
  selector: 'app-rol-modal-component',
  imports: [MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatButtonModule, FormRoot, FormField],
  templateUrl: './rol-modal-component.html',
  styleUrl: './rol-modal-component.scss',
})

export class RolModalComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<RolModalComponent>);
  data = inject(MAT_DIALOG_DATA);
  dataState:any;

  // 1. Crear el modelo de datos inicial con una signal
  private formModel = signal<RoleFormData>({
    name : '',
    state: false
  });

  // 2. Crear el FieldTree pasando el modelo y sus validaciones en el schema
  protected roleForm = form(this.formModel, (path:any) => {
    required(path.role, { message: 'El nombre de rol es obligatorio.' });
    // required(path.state, { message: 'El estado es requerido' });
  }, {
    // La directiva [formRoot] buscará esta propiedad 'submission' automáticamente
    submission: {
      action: async ( FieldTree) =>{
        const rawValues = this.formModel(); // 🟢 Esto te da un objeto de tipo RoleFormData limpio
        this.saveRole(rawValues);
        
      } 
        
    }
  });

  ngOnInit(): void {
    console.log('datos de la tabla', this.data);
    
  }

  private saveRole(formData:RoleFormData) {
    console.log('Datos listos y validados enviados al servidor: del form', formData);
  }
}


