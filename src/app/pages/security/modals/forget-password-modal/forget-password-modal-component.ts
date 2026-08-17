import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule,  MatFormField, MatError } from '@angular/material/form-field';
import { form, required, FormField, pattern, minLength, maxLength } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { IconService } from '../../../../shared/services/icon.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertService } from '../../../../shared';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { AppHttpError } from '../../../../shared/interfaces/error-interface';
import { UsuarioDirective } from '../../../../shared/directives/usuario-directive';

export interface ForgetPasswordData {
  nombre_usuario: string,
  email: string
}

@Component({
  selector: 'app-forget-password-modal',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatFormField, MatError, FormField, UsuarioDirective],
  templateUrl: './forget-password-modal-component.html',
  styleUrl: './forget-password-modal-component.scss',
})

export class ForgetPasswordModal {
  private readonly iconService = inject(IconService);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<ForgetPasswordModal>);
  private readonly alertService = inject(AlertService);
  public errorService = inject(FormErrorService);

  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  isLoading = signal(false);

  errorIconPath = computed(() => this.iconService.getIconPath('error')());
  backendErrors = signal<Record<string, string[]>>({});
  
  forgetPassModel = signal<ForgetPasswordData>({
    nombre_usuario: '',
    email: ''
  });

  forgetPassForm = form(this.forgetPassModel, (fieldPath) => {
    required(fieldPath.nombre_usuario, {message: 'Usuario es requerido.'});
    minLength(fieldPath.nombre_usuario, 3, {message: 'El usuario debe tener al menos 3 caracteres.'});
    maxLength(fieldPath.nombre_usuario, 30, {message: 'El usuario no puede exceder los 30 caracteres.'});
    required(fieldPath.email, {message: 'Email es requerido.'});
    pattern(fieldPath.email, this.emailRegex, {message: 'Introduzca un email válido. Ej.(usuario@correo.com)'});
  });

  usuarioError = this.errorService.createFieldTracker(this.forgetPassForm.nombre_usuario, this.backendErrors, 'nombre_usuario');
  emailError = this.errorService.createFieldTracker(this.forgetPassForm.email, this.backendErrors, 'correo');

  passwordRecovery(event:Event) {
    event.preventDefault();
    this.isLoading.set(true);

    if (this.forgetPassForm.nombre_usuario().invalid() || this.forgetPassForm.email().invalid()) {
      this.forgetPassForm.nombre_usuario().markAsTouched();
      this.forgetPassForm.email().markAsTouched();
      return;
    }

    this.authService.resetPasswordCorreo(this.forgetPassForm.email().value(), this.forgetPassForm.nombre_usuario().value()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.alertService.success("Hemos enviado un correo. Revise su bandeja de entrada.", 8000);
        this.alertService.success(response.message,4000);
        this.dialogRef.close(response);
        
      },
      error: (err:AppHttpError) => {
        this.isLoading.set(false);
        this.alertService.error(err.mensajeGeneral);
        if (err.detalles) return this.backendErrors.set(err.detalles);
      }
    });
  }
}
