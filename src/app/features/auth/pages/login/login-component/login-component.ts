import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import { MatIcon } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IconService } from '../../../../../shared/services/icon.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { LoginRequest } from '../../../../../shared/interfaces/login-interface';
import { AlertService } from '../../../../../shared';
import { MatDialog } from '@angular/material/dialog';
import { ForgetPasswordModal } from '../../../../../pages/security/modals/forget-password-modal/forget-password-modal-component';
import { FormErrorService } from '../../../../../shared/services/form-error.service';
import { AppHttpError } from '../../../../../shared/interfaces/error-interface';
import { UsuarioDirective } from '../../../../../shared/directives/usuario-directive';

@Component({
  selector: 'app-login-component',
  imports: [FormField, MatIcon, MatFormFieldModule, MatInputModule, MatButtonModule, UsuarioDirective],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})

export class LoginComponent {
  hide = signal(true);
  isLoading = signal(false);
  
  private readonly iconService = inject(IconService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly dialog = inject(MatDialog);
  public errorService = inject(FormErrorService);
  
  backendErrors = signal<Record<string, string[]>>({});
  errorIconPath = computed(() => this.iconService.getIconPath('error')());
  
  loginModel = signal<LoginRequest> ({
    nombre_usuario: '',
    password: ''
  });
  
  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.nombre_usuario, {message: 'El usuario es requerido.'});
    minLength(fieldPath.nombre_usuario, 3, {message: 'El usuario debe tener al menos 3 caracteres.'});
    maxLength(fieldPath.nombre_usuario, 30, {message: 'El usuario no puede exceder los 30 caracteres.'});
    required(fieldPath.password, {message: 'La contraseña es requerida.'});
    minLength(fieldPath.password, 2, {message: 'La contraseña debe tener al menos 2 caracteres.'});
    maxLength(fieldPath.password, 50, {message: 'La contraseña no puede exceder los 50 caracteres.'});
  });

  usuarioError = this.errorService.createFieldTracker(this.loginForm.nombre_usuario, this.backendErrors, 'nombre_usuario');
  passwordError = this.errorService.createFieldTracker(this.loginForm.password, this.backendErrors, 'password');

  tooglePasswordVisibility(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);

    if (this.loginForm.nombre_usuario().invalid() || this.loginForm.password().invalid()) {
      this.loginForm.nombre_usuario().markAsTouched();
      this.loginForm.password().markAsTouched();
      this.isLoading.set(false);
      return;
    }

    const loginRequest: LoginRequest = {
      nombre_usuario: this.loginModel().nombre_usuario,
      password: this.loginModel().password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.authService.saveUserData(response.data);
        this.authService.saveToken(response.data.token);
        
        if (response.data.pass_actualizado) {
          this.router.navigate(['/home/welcome']);
        } else {
          this.router.navigate(['/update-password']);
        }
      },
      error: (err:AppHttpError) => {
        this.isLoading.set(false);
        this.alertService.error(err.mensajeGeneral);
        this.backendErrors.set(err.detalles ?? {});
      }
    });

  }

  openForgetPasswordModal() {
    this.dialog.open(ForgetPasswordModal,{
      width: '25rem',
      minWidth: 'auto',
      height: 'auto',
      disableClose: true
    });
  }
}
