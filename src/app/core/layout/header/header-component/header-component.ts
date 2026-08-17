import { Component, inject, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../../../../shared/services/sidebar.service';
import { AuthService } from '../../../services/auth.service';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header-component',
  imports: [TitleCasePipe, MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss',
})

export class HeaderComponent implements OnInit {
  protected sidebar = inject(SidebarService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  role: string | undefined = "";
  nombreCompleto:string | undefined = "";
  displayRole: string | undefined | null = "";
  nombreUsuario: string | undefined = "";
  roles:string[] = [];
  nombres:string = "";

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    
    if (userData !== null) {
      this.nombreCompleto = userData.nombre_completo;
      this.displayRole = (userData.roles && userData.roles.length > 0) ? userData.roles[0].nombre_rol : userData.nombre_completo;
      this.nombreUsuario = userData.nombre_usuario;
      this.nombres = userData.nombre;
      this.roles = userData.roles.map((role: { nombre_rol: string }) => role.nombre_rol);
    }
    else {
      this.displayRole = 'Invitado';
    }
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }
}
