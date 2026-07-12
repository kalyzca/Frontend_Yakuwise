import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LoginData } from '../../../../../shared/interfaces/login-interface';
import { form, FormField, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { MatIcon } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IconService } from '../../../../../shared/services/icon.service';

@Component({
  selector: 'app-login-component',
  imports: [RouterLink, RouterLinkActive, FormField, MatIcon, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  hide = signal(true);

  private readonly iconService = inject(IconService);

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
    minLength(fieldPath.password, 8, {message: 'La contraseña debe tener mínimo 8 caracteres.'});
    maxLength(fieldPath.password, 50, {message: 'La contraseña debe tener máximo 50 caracteres.'});
    pattern(fieldPath.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message: 'La contraseña debe tener una mayúscula, una minúscula, un número y un carácter especial.'});
  });

  tooglePasswordVisibility(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  
}
