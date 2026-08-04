import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule,  MatFormField, MatError } from '@angular/material/form-field';
import { form, required, FormField, pattern, minLength } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { IconService } from '../../../../shared/services/icon.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';

export interface ForgetPasswordData {
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
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<ForgetPasswordModal>);
  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  errorIconPath = computed(() => this.iconService.getIconPath('error')());
  showUsuarioErrors = signal<any[]>([]);
  showEmailErrors = signal<any[]>([]);

  forgetPassModel = signal<ForgetPasswordData>({
    usuario: '',
    email: ''
  });

  forgetPassForm = form(this.forgetPassModel, (fieldPath) => {
    required(fieldPath.usuario, {message: 'Usuario es requerido.'});
    minLength(fieldPath.usuario, 3, {message: 'El usuario debe tener al menos 3 caracteres.'});
    required(fieldPath.email, {message: 'Email es requerido.'});
    pattern(fieldPath.email, this.emailRegex, {message: 'Introduzca un email válido.'});
  });

  onInputChange(): void {
    if (this.showUsuarioErrors().length > 0 || this.showEmailErrors().length > 0) {
      this.showUsuarioErrors.set([]);
      this.showEmailErrors.set([]);
    }
  }

  passwordRecovery(event:Event) {
    event.preventDefault();
    if (this.forgetPassForm().invalid()) {
      this.forgetPassForm.usuario().markAsTouched();
      this.forgetPassForm.email().markAsTouched();
      return;
    }

    this.authService.resetPasswordCorreo(this.forgetPassForm.email().value(), this.forgetPassForm.usuario().value()).subscribe({
      next: (response) => {
        this.dialogRef.close(response);
      },
      error: (error) => {
        const detalles = error.error?.detalles || {};
        const usuarioErrors: any[] = [];
        const emailErrors: any[] = [];
        
        if (detalles.nombre_usuario) {
          detalles.nombre_usuario.forEach((msg: string) => {
            usuarioErrors.push({ message: msg, kind: 'backend' });
          });
        }
        if (detalles.email_institucional || detalles.email || detalles.correo) {
          const emailErrs = detalles.email_institucional || detalles.email || detalles.correo || [];
          emailErrs.forEach((msg: string) => {
            emailErrors.push({ message: msg, kind: 'backend' });
          });
        }

        this.showUsuarioErrors.set(usuarioErrors);
        this.showEmailErrors.set(emailErrors);
        this.forgetPassForm.usuario().markAsTouched();
        this.forgetPassForm.email().markAsTouched();
      }
    });
  }
}
