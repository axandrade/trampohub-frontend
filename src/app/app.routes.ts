import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { empresaGuard } from './core/guards/empresa.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/cadastro/cadastro.component').then((m) => m.CadastroComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'vagas',
        loadComponent: () =>
          import('./features/vagas/vagas-list/vagas-list.component').then((m) => m.VagasListComponent),
      },
      {
        path: 'vagas/nova',
        canActivate: [empresaGuard],
        loadComponent: () =>
          import('./features/vagas/vaga-form/vaga-form.component').then((m) => m.VagaFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
