import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../../../../shared/services/sidebar.service';
import { AuthService } from '../../../services/auth.service';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { LoginResponse } from '../../../../shared/interfaces/login-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-component',
  imports: [TitleCasePipe, MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss',
})

export class HeaderComponent implements OnInit, OnDestroy {
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
  private userDataSubscription: Subscription | null = null;
  isRefreshing = false;

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
      const selectedRoleObj = this.roles?.find(role => role.id_rol === currentSelectedRole);
      this.displayRole = selectedRoleObj ? selectedRoleObj.nombre_rol : userData.nombre_completo;
    }
    else {
      this.displayRole = 'Invitado';
    }

    // Subscribe to userData changes
    this.userDataSubscription = this.authService.userData$.subscribe(userData => {
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
        const selectedRoleObj = this.roles?.find(role => role.id_rol === currentSelectedRole);
        this.displayRole = selectedRoleObj ? selectedRoleObj.nombre_rol : userData.nombre_completo;
      }
      else {
        this.displayRole = 'Invitado';
      }
    });

  }

  onRoleSelect(roleId: number): void {
    this.selectedRoleId = roleId;
    this.authService.saveSelectedRole(roleId);
    const selectedRoleObj = this.roles.find(role => role.id_rol === roleId);
    this.displayRole = selectedRoleObj ? selectedRoleObj.nombre_rol : '';
    
    // Navigate to home/welcome when role changes
    this.router.navigate(['/home/welcome']);
  }

  onMenuOpened(): void {
    if (!this.isRefreshing && this.authService.isLoggedIn()) {
      this.isRefreshing = true;
      
      this.authService.refreshUserData().subscribe({
        next: () => {
          this.isRefreshing = false;
        },
        error: (err) => {
          console.error('Error al refrescar datos del usuario:', err);
          this.isRefreshing = false;
          // Si falla (ej: token expirado), limpiar la sesión
          if (err.status === 401) {
            this.authService.clearSession();
            this.router.navigate(['/login']);
          }
        }
      });
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

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }
}
