import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css',
})
export class LogoComponent {
  @Input() variant: 'full' | 'icon' = 'full';
  @Input() theme: 'light' | 'dark' = 'dark';
}
