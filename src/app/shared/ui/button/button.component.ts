import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-button',
    imports: [],
    templateUrl: './button.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() loading = false;
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<MouseEvent>();
}
