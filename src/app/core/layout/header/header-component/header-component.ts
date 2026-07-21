import { Component, inject, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { SidebarService } from '../../../../shared/services/sidebar.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header-component',
  imports: [TitleCasePipe],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss',
})

export class HeaderComponent implements OnInit {
  protected sidebar = inject(SidebarService);
  private readonly authService = inject(AuthService);
  
  role: string | undefined = "";
  nombreCompleto:string | undefined = "";
  displayRole: string | undefined | null = "";

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    
    if (userData !== null) {
      this.nombreCompleto = userData.nombre_completo;
      this.displayRole = (userData.roles && userData.roles.length > 0) ? userData.roles[0].nombre_rol : userData.nombre_completo;
    }
    else {
      this.displayRole = 'Invitado';
    }
  }
}
