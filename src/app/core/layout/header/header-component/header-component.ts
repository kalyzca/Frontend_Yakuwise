import { Component, inject, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../../../../shared/services/sidebar.service';
import { AuthService } from '../../../services/auth.service';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AlertService } from '../../../../shared/services/alert.service';
import { AppHttpError } from '../../../../shared/interfaces/error-interface';

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
  private readonly alertService = inject(AlertService);
  
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

    console.log('users',this.roles);

  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
      error: (err: AppHttpError) => {
        // La sesión local se limpia igualmente, pero el usuario debe saber que
        // el servidor no confirmó el cierre de sesión.
        this.authService.clearSession();
        this.router.navigate(['/login']);
        this.alertService.warning(`No se pudo confirmar el cierre de sesión en el servidor: ${err.mensajeGeneral}`);
      }
    });
  }
}
