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
  errorMessage = signal('');
  successMessage = signal('');

  private readonly iconService = inject(IconService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorIconPath = signal(this.iconService.getIconPath('error')());

  updatePasswordModel = signal({
    password_actual: '',
    password_nueva: '',
    password_confirmacion: ''
  });

  updatePasswordForm = form(this.updatePasswordModel, (fieldPath) => {
    required(fieldPath.password_actual, {message: 'La contraseña actual es requerida.'});
    required(fieldPath.password_nueva, {message: 'La nueva contraseña es requerida.'});
    minLength(fieldPath.password_nueva, 8, {message: 'La contraseña debe tener mínimo 8 caracteres.'});
    maxLength(fieldPath.password_nueva, 50, {message: 'La contraseña debe tener máximo 50 caracteres.'});
    pattern(fieldPath.password_nueva, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message: 'La contraseña debe tener una mayúscula, una minúscula, un número y un carácter especial.'});
    required(fieldPath.password_confirmacion, {message: 'La confirmación de contraseña es requerida.'});
  });

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

    if (this.updatePasswordForm.password_actual().invalid() || 
        this.updatePasswordForm.password_nueva().invalid() || 
        this.updatePasswordForm.password_confirmacion().invalid()) {
      this.updatePasswordForm.password_actual().markAsTouched();
      this.updatePasswordForm.password_nueva().markAsTouched();
      this.updatePasswordForm.password_confirmacion().markAsTouched();
      return;
    }

    if (this.updatePasswordModel().password_nueva !== this.updatePasswordModel().password_confirmacion) {
      this.errorMessage.set('Las contraseñas nueva y de confirmación no coinciden.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: UpdatePasswordRequest = {
      password_actual: this.updatePasswordModel().password_actual,
      password_nueva: this.updatePasswordModel().password_nueva,
      password_confirmacion: this.updatePasswordModel().password_confirmacion
    };

    this.authService.updatePassword(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('Contraseña actualizada exitosamente. Redirigiendo...');
        
        // Actualizar pass_actualizado en localStorage
        const userData = this.authService.getUserData();
        if (userData) {
          userData.pass_actualizado = true;
          this.authService.saveUserData(userData);
        }

        setTimeout(() => {
          this.router.navigate(['/home/welcome']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al actualizar la contraseña. Por favor, verifique su contraseña actual.');
        console.error('Update password error:', error);
      }
    });
  }
}
