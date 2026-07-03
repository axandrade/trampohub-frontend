import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
    selector: 'app-main-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet, LogoComponent, Avatar, Menu],
    templateUrl: './main-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);

  sidebarOpen = false;

  readonly userMenuItems: MenuItem[] = [
    { label: 'Editar perfil', icon: 'pi pi-user-edit', routerLink: '/perfil/editar' },
    { separator: true },
    { label: 'Sair', icon: 'pi pi-sign-out', command: () => this.logout() },
  ];

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  get isEmpresa(): boolean {
    return this.authService.isEmpresa();
  }

  get username(): string | null {
    return this.authService.getUsername();
  }

  get initials(): string {
    const username = this.username;
    return username ? username.charAt(0).toUpperCase() : '?';
  }

  logout(): void {
    this.authService.logout();
  }
}
