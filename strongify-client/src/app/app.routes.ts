import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard, redirectLoggedInToApp, redirectLoggedInFromDashboard, matchAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: Dashboard,
    canMatch: [redirectLoggedInFromDashboard]
  },
  {
    path: 'login',
    component: Login,
    canMatch: [redirectLoggedInToApp]
  },
  {
    path: 'register',
    component: Register,
    canMatch: [redirectLoggedInToApp]
  },
  {
    path: 'home',
    component: Home,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
