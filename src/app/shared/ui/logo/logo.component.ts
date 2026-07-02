import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-logo',
    imports: [],
    templateUrl: './logo.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './logo.component.css'
})
export class LogoComponent {
  @Input() variant: 'full' | 'icon' = 'full';
  @Input() theme: 'light' | 'dark' = 'dark';
}
