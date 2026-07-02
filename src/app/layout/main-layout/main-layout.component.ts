import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
    selector: 'app-main-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet, LogoComponent],
    templateUrl: './main-layout.component.html',
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
