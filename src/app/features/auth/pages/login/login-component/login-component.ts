import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, minLength, pattern, required } from '@angular/forms/signals';
import { MatIcon } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IconService } from '../../../../../shared/services/icon.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { LoginRequest,LoginData } from '../../../../../shared/interfaces/login-interface';
import { AlertService } from '../../../../../shared';
import { MatDialog } from '@angular/material/dialog';
import { ForgetPasswordModal } from '../../../../../pages/security/modals/forget-password-modal/forget-password-modal-component';

@Component({
  selector: 'app-login-component',
  imports: [FormField, MatIcon, MatFormFieldModule, MatInputModule, MatButtonModule],
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

  errorIconPath = computed(() => this.iconService.getIconPath('error')());
  private readonly regexUsuario = /^[a-z]+(?:\.[a-z]+)?$/;
  
  loginModel = signal<LoginData>({
    usuario: '',
    password: ''
  });
  
  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.usuario, {message: 'El usuario es requerido.'});
    pattern(fieldPath.usuario, this.regexUsuario, {message: 'El usuario debe contener solo letras.'});
    required(fieldPath.password, {message: 'La contraseña es requerida.'});
    minLength(fieldPath.password, 10, {message: 'La contraseña debe tener al menos 10 caracteres.'});
  });

  tooglePasswordVisibility(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.loginForm.usuario().invalid() || this.loginForm.password().invalid()) {
      this.loginForm.usuario().markAsTouched();
      this.loginForm.password().markAsTouched();
      return;
    }

    this.isLoading.set(true);
    
    const loginRequest: LoginRequest = {
      nombre_usuario: this.loginModel().usuario,
      password: this.loginModel().password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.authService.saveUserData(response.data);
        this.authService.saveToken(response.data.token);
        this.isLoading.set(false);
        
        if (response.data.pass_actualizado) {
          this.router.navigate(['/home/welcome']);
        } else {
          this.router.navigate(['/update-password']);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error.error.error;
        this.alertService.error(`${errorMessage}`,0);
      }
    });
  }

  openForgetPasswordModal() {
    const dialogRefForgetPass = this.dialog.open(ForgetPasswordModal,{
      width: '25rem',
      minWidth: 'auto',
      height: 'auto',
      disableClose: true
    });
    
    dialogRefForgetPass.afterClosed().subscribe((result) => {
      if (result) {
        this.alertService.info("Se ha enviado un mensaje a su correo electrónico.");
      }
    });
  }
}
