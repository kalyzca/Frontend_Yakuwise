import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { SidebarService } from '../../../../shared/services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../../../core/services/auth.service';
import { LoginResponse } from '../../../../shared/interfaces/login-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {

  // Inyectamos el servicio (usamos protected para que el HTML lo vea)
  protected sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);

  userData: LoginResponse['data'] | null = null;
  selectedRoleId: number | null = null;
  private roleSubscription: Subscription | null = null;
  private userDataSubscription: Subscription | null = null;

  ngOnInit() {
    this.userData = this.authService.getUserData();
    
    if (this.userData) {
      this.selectedRoleId = this.authService.getSelectedRole();
      if (!this.selectedRoleId) {
        this.selectedRoleId = this.authService.getDefaultRole(this.userData);
        this.authService.saveSelectedRole(this.selectedRoleId);
      }
    }

    // Subscribe to userData changes
    this.userDataSubscription = this.authService.userData$.subscribe(userData => {
      this.userData = userData;
      if (userData) {
        this.selectedRoleId = this.authService.getSelectedRole();
        if (!this.selectedRoleId) {
          this.selectedRoleId = this.authService.getDefaultRole(userData);
          this.authService.saveSelectedRole(this.selectedRoleId);
        }
      }
    });

    // Subscribe to role changes
    this.roleSubscription = this.authService.selectedRole$.subscribe(roleId => {
      // Protect against null roleId - if null, get it from localStorage
      if (roleId === null) {
        const savedRoleId = this.authService.getSelectedRole();
        if (savedRoleId) {
          this.selectedRoleId = savedRoleId;
        }
      } else {
        this.selectedRoleId = roleId;
      }
    });
  }

  ngOnDestroy() {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  // Verificar si el usuario tiene acceso a un menú basado en el rol seleccionado
  hasMenuAccess(menuRoles: { id_rol: number; nombre_rol: string }[] | undefined): boolean {
    if (!menuRoles || menuRoles.length === 0) return false;
    return menuRoles.some(role => role.id_rol === this.selectedRoleId);
  }

  // Filtrar menús que el usuario puede ver
  getFilteredMenus(menus: any[]) {
    return menus.filter(menu => 
      menu.estado && 
      this.hasMenuAccess(menu.roles)
    );
  }

  // Obtener menús de nivel 1 (sin dependencia)
  getLevel1Menus(menus: any[]) {
    return this.getFilteredMenus(menus).filter(menu => menu.nivel === 1 && !menu.id_depende);
  }

  // Obtener menús de nivel 2 (con dependencia)
  getLevel2Menus(menus: any[], parentId: number) {
    return this.getFilteredMenus(menus).filter(menu => menu.nivel === 2 && menu.id_depende === parentId);
  }

  // Obtener icono según el nombre del menú
  getMenuIcon(menuName: string): string {
    const lowerName = menuName.toLowerCase();
    
    if (lowerName.includes('rol') || lowerName.includes('role')) {
      // Icono de roles (escudo/persona)
      return 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z';
    } else if (lowerName.includes('usuario') || lowerName.includes('user')) {
      // Icono de usuarios (grupo de personas)
      return 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
    } else if (lowerName.includes('modulo') || lowerName.includes('module')) {
      // Icono de módulos (bloques)
      return 'M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z';
    } else if (lowerName.includes('menu')) {
      // Icono de menú (lista)
      return 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z';
    } else {
      // Icono genérico para otros menús (ajustes)
      return 'M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L5.09 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6z';
    }
  }

  // Manejar hover en submenú para afectar al padre
  onSubmenuHover(menuId: number, isHovering: boolean) {
    const parentLi = document.querySelector(`[data-menu-id="${menuId}"]`);
    if (parentLi) {
      if (isHovering) {
        parentLi.classList.add('has-submenu-hover');
      } else {
        parentLi.classList.remove('has-submenu-hover');
      }
    }
  }

}
