import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../../shared/ui/logo/logo.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LogoComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
