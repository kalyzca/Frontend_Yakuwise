import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginData } from '../../../../../shared/interfaces/login-interface';
import { form, FormField, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { MatIcon } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IconService } from '../../../../../shared/services/icon.service';
import { AuthService, LoginRequest } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-login-component',
  imports: [FormField, MatIcon, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  hide = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');

  private readonly iconService = inject(IconService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorIconPath = computed(() => this.iconService.getIconPath('error')());
  
  loginModel = signal<LoginData>({
    usuario: '',
    password: '',
    forgetPassword: false,
    showPassword: false
  });

  loginForm = form(this.loginModel, (fieldPath) => {
    // Validators will go here
    required(fieldPath.usuario, {message: 'Usuario es requerido.'});
    required(fieldPath.password, {message: 'La contraseña es requerida.'});
    minLength(fieldPath.password, 1, {message: 'La contraseña es requerida.'});
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
    this.errorMessage.set('');

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
        this.errorMessage.set('Error al iniciar sesión. Por favor, verifique sus credenciales.');
        console.error('Login error:', error);
      }
    });
  }
  
}
