import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { MatIcon } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IconService } from '../../../../../shared/services/icon.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { UpdatePasswordRequest } from '../../../../../shared/interfaces/login-interface';
import { AlertService } from '../../../../../shared';
import { AppHttpError } from '../../../../../shared/interfaces/error-interface';
import { FormErrorService } from '../../../../../shared/services/form-error.service';

@Component({
  selector: 'app-update-password-component',
  imports: [FormField, MatIcon, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './update-password-component.html',
  styleUrl: './update-password-component.scss',
})

export class UpdatePasswordComponent {
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);
  isLoading = signal(false);
  
  private readonly iconService = inject(IconService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  public errorService = inject(FormErrorService);

  errorIconPath = signal(this.iconService.getIconPath('error')());
  backendErrors = signal<Record<string, string[]>>({});

  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  updatePasswordModel = signal<UpdatePasswordRequest>({
      password_actual: '',
      password_nueva: '',
      password_confirmacion: ''
  });

  updatePasswordForm = form(this.updatePasswordModel, (fieldPath) => {
    required(fieldPath.password_actual, {message: 'La contraseña actual es requerida.'});
    required(fieldPath.password_nueva, {message: 'La nueva contraseña es requerida.'});
    required(fieldPath.password_confirmacion, {message: 'La confirmación de contraseña es requerida.'});
    minLength(fieldPath.password_actual, 1, {message: 'La contraseña debe tener mínimo 1 caracteres.'});
    minLength(fieldPath.password_nueva, 8, {message: 'La contraseña debe tener mínimo 8 caracteres.'});
    maxLength(fieldPath.password_actual, 50, {message: 'La contraseña debe tener máximo 50 caracteres.'});
    maxLength(fieldPath.password_nueva, 50, {message: 'La contraseña debe tener máximo 50 caracteres.'});
    maxLength(fieldPath.password_confirmacion, 50, {message: 'La contraseña debe tener máximo 50 caracteres.'});
    pattern(fieldPath.password_nueva, this.passwordRegex, {message: 'La contraseña debe tener al menos una letra mayúscula, minúscula, un número y un carácter especial.'});

  });

  passwordActualError = this.errorService.createFieldTracker(this.updatePasswordForm.password_actual, this.backendErrors,'password_actual');
  passwordNuevoError = this.errorService.createFieldTracker(this.updatePasswordForm.password_nueva, this.backendErrors,'password_nueva');
  passwordConfirmacionError = this.errorService.createFieldTracker(this.updatePasswordForm.password_confirmacion, this.backendErrors, 'password_confirmacion');

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm', event: MouseEvent) {
    event.stopPropagation();
    if (field === 'current') {
      this.hideCurrentPassword.set(!this.hideCurrentPassword());
    } else if (field === 'new') {
      this.hideNewPassword.set(!this.hideNewPassword());
    } else {
      this.hideConfirmPassword.set(!this.hideConfirmPassword());
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);

    if (this.updatePasswordForm.password_actual().invalid() || 
        this.updatePasswordForm.password_nueva().invalid() || 
        this.updatePasswordForm.password_confirmacion().invalid()) {
      this.updatePasswordForm.password_actual().markAsTouched();
      this.updatePasswordForm.password_nueva().markAsTouched();
      this.updatePasswordForm.password_confirmacion().markAsTouched();
      return;
    }
    
    const request: UpdatePasswordRequest = {
      password_actual: this.updatePasswordModel().password_actual,
      password_nueva: this.updatePasswordModel().password_nueva,
      password_confirmacion: this.updatePasswordModel().password_confirmacion
    };

    this.authService.updatePassword(request).subscribe({
      next: () => {
        const userData = this.authService.getUserData();
        if (userData) {
          this.isLoading.set(false);
          userData.pass_actualizado = true;
          this.authService.saveUserData(userData);
          this.router.navigate(['/home/welcome']);
          this.alertService.success("Contraseña actualizada exitosamente.\nRedirigiendo...");
        }
      },
      error: (err:AppHttpError) => {
        this.isLoading.set(false);
        this.alertService.error(err.mensajeGeneral);
        if (err.detalles) return this.backendErrors.set(err.detalles);
      }
    });
  }
}
