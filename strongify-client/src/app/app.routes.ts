import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/user/profile/profile';
import { UserUpdate } from './pages/user/user-update/user-update';
import { Locations } from './pages/locations/locations';
import { Workouts } from './pages/workouts/workouts';
import { Records } from './pages/records/records';
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
    path: 'locations',
    component: Locations,
    canActivate: [authGuard]
  },
  {
    path: 'workouts',
    component: Workouts,
    canActivate: [authGuard]
  },
  {
    path: 'records',
    component: Records,
    canActivate: [authGuard]
  },
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        component: Profile
      },
      {
        path: 'update',
        component: UserUpdate
      }
    ]
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
