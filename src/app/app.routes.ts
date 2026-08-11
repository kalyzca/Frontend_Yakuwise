import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login-component/login-component';
import { DashboardComponent } from './pages/dashboard/dashboard-component/dashboard-component';
import { HomeComponent } from './pages/home/home-component/home-component';
import { FrontPageComponent } from './core/layout/front-page/front-page-component';
import { WelcomeComponent } from './pages/welcome/welcome-component/welcome-component';
import { RolComponent } from './pages/security/rol/rol-component/rol-component';
import { UsuarioComponent } from './pages/security/usuario/usuario-component/usuario-component';
import { ModuloComponent } from './pages/security/modulo/modulo-component/modulo-component';
import { MenuComponent } from './pages/security/menu/menu-component/menu-component';
import { UpdatePasswordComponent } from './features/auth/pages/update-password/update-password-component/update-password-component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'frontpage',
    component: FrontPageComponent
  },
  {
    path:'login',
    component:LoginComponent
  },
  {
    path: 'update-password',
    component: UpdatePasswordComponent,
    canActivate: [authGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
    children:[
      {
        path:'welcome',
        component:WelcomeComponent
      }
    ]
  },
  {
    path: 'security',
    component: HomeComponent,
    canActivate: [authGuard],
    children:[
      {
        path:'rol',
        component:RolComponent
      },
      {
        path:'usuario',
        component:UsuarioComponent
      },
      {
        path:'modulo',
        component:ModuloComponent
      },
      {
        path:'menu',
        component:MenuComponent
      }
    ]
  },
  {
    path:'dashboard',
    component:DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path:'**',
    redirectTo:'/frontpage'
  }
];
