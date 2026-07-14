import { UpperCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-welcome-component',
  imports: [UpperCasePipe],
  templateUrl: './welcome-component.html',
  styleUrl: './welcome-component.scss',
})
export class WelcomeComponent implements OnInit {
  welcome: string = "";
  nombreCompleto: string = "";
  genero: boolean = false;

  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.nombreCompleto = userData.nombre_completo;
    }

    if (this.genero) {
      this.welcome = "bienvenido";
    } else {
      this.welcome = "bienvenida";
    }
  }
}
