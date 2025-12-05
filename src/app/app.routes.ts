import { Routes } from '@angular/router';
import { WelcomeComponent } from './features/welcome/welcome-component/welcome-component';
import { LoginComponent } from './features/login/login-component/login-component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent
  },
  {
    path:'login',
    component:LoginComponent
  },
  {
    path:'**',
    redirectTo:''
  }

];
