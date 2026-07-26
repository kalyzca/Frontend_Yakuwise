import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule,  MatFormField, MatError } from '@angular/material/form-field';
import { form, required, FormField, pattern, minLength } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { IconService } from '../../../../shared/services/icon.service';
import { MatButtonModule } from '@angular/material/button';

export interface forgetPassData {
  usuario: string,
  email: string
}

@Component({
  selector: 'app-forget-password-modal',
  imports: [MatDialogModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatFormField,MatError,FormField],
  templateUrl: './forget-password-modal-component.html',
  styleUrl: './forget-password-modal-component.scss',
})

export class ForgetPasswordModal {
  private readonly iconService = inject(IconService);
  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly usuarioRegex = /^[a-z]+$/;

  errorIconPath = computed(() => this.iconService.getIconPath('error')());

  forgetPassModel = signal<forgetPassData>({
    usuario: '',
    email: ''
  });

  forgetPassForm = form(this.forgetPassModel, (fieldPath) => {
    required(fieldPath.usuario, {message: 'Usuario es requerido.'});
    minLength(fieldPath.usuario, 3, {message: 'El usuario debe tener al menos 3 caracteres.'});
    pattern(fieldPath.usuario, this.usuarioRegex, {message: 'El usuario solo debe contener letras minúsculas (no se permiten números).'});
    required(fieldPath.email, {message: 'Email es requerido.'});
    pattern(fieldPath.email, this.emailRegex, {message: 'Introduzca un correo electrónico válido.'});
  });

  passwordRecovery(event:Event) {
    console.log('forgetPassForm', this.forgetPassForm().value());
    
    event.preventDefault();

    if (this.forgetPassForm().invalid()) {
      this.forgetPassForm.usuario().markAsTouched();
      this.forgetPassForm.email().markAsTouched();
      return;
    }
  }
}
