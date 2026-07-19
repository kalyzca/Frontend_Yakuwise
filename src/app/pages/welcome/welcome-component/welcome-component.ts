import { TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-welcome-component',
  imports: [TitleCasePipe],
  templateUrl: './welcome-component.html',
  styleUrl: './welcome-component.scss',
})

export class WelcomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  welcome: string = "";
  nombres: string | undefined = "";
  apellidoPaterno: string = "";
  
  ngOnInit(): void {
    const userData = this.authService.getUserData();

    if (userData) {
      this.nombres = userData.nombre;
      this.apellidoPaterno = userData.apellido;
    }

    if (userData?.genero === 'M') {
      this.welcome = `Bienvenido, ${this.getFirstName()} ${this.apellidoPaterno}`;
    } else if (userData?.genero === 'F') {
      this.welcome = `Bienvenida, ${this.getFirstName()} ${this.apellidoPaterno}`;
    } else {
      this.welcome = `Bienvenid@, ${this.getFirstName()} ${this.apellidoPaterno}`;
    }
  }

  getFirstName() : string {
    const names = this.nombres;
    return names?.trim().split(' ')[0] || '';
  }
  
}
