import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { ButtonDirective } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
    selector: 'app-main-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet, LogoComponent, Avatar, ButtonDirective],
    templateUrl: './main-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);

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
