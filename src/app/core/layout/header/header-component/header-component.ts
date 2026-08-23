import { Component, inject, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../../../../shared/services/sidebar.service';
import { AuthService } from '../../../services/auth.service';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { LoginResponse } from '../../../../shared/interfaces/login-interface';

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
  roles: LoginResponse['data']['roles'] = [];
  selectedRoleId: number | null = null;
  nombres:string = "";

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    
    if (userData !== null) {
      this.nombreCompleto = userData.nombre_completo;
      this.nombreUsuario = userData.nombre_usuario;
      this.nombres = userData.nombre;
      this.roles = userData.roles;
      
      // Set default role if none is selected
      let currentSelectedRole = this.authService.getSelectedRole();
      if (!currentSelectedRole) {
        currentSelectedRole = this.authService.getDefaultRole(userData);
        this.authService.saveSelectedRole(currentSelectedRole);
      }
      
      this.selectedRoleId = currentSelectedRole;
      const selectedRoleObj = this.roles.find(role => role.id_rol === currentSelectedRole);
      this.displayRole = selectedRoleObj ? selectedRoleObj.nombre_rol : userData.nombre_completo;
    }
    else {
      this.displayRole = 'Invitado';
    }

    console.log('users', this.roles);
    console.log('selectedRoleId', this.selectedRoleId);

  }

  onRoleSelect(roleId: number): void {
    this.selectedRoleId = roleId;
    this.authService.saveSelectedRole(roleId);
    const selectedRoleObj = this.roles.find(role => role.id_rol === roleId);
    this.displayRole = selectedRoleObj ? selectedRoleObj.nombre_rol : '';
    
    // Navigate to home/welcome when role changes
    this.router.navigate(['/home/welcome']);
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
