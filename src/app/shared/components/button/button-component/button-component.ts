import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonConfigService } from '../../../services/button-config.service';
import { IconComponent } from "../../icon/icon-component/icon-component";

@Component({
  selector: 'app-button-component',
  imports: [CommonModule, IconComponent],
  templateUrl: './button-component.html',
  styleUrl: './button-component.scss',
})

export class ButtonComponent {
  private configService = inject(ButtonConfigService);

  // Inputs basados en Signals (Angular 21)
  label = input.required<string>();
  color = input<'primary' | 'secondary' | 'accent' | string>();
  icon = input<string | null>(null);
  iconPosition = input<'left' | 'right'>('left');

  // Nueva Signal para el tipo de botón (por defecto 'button')
  type = input<'button' | 'submit' | 'reset'>('button');

  // Output moderno
  clicked = output<MouseEvent>();

  // Evalúa si el color recibido pertenece al tema predefinido
  isThemeColor = computed(() => 
    ['primary', 'secondary', 'accent'].includes(this.color() || '')
  );

  // Gestiona de forma reactiva las clases del botón
  buttonClass = computed(() => {
    const colorClass = this.isThemeColor() ? `btn-${this.color()}` : 'btn-custom';
    const fallbackColor = !this.color() ? `btn-${this.configService.defaultColor()}` : '';
    
    return `btn ${colorClass} ${fallbackColor}`.trim();
  });

  // Manejador interno del clic
  handleClick(event: MouseEvent): void {
    // Si el tipo es 'button', prevenimos cualquier acción por defecto del navegador en formularios
    if (this.type() === 'button') {
      event.preventDefault();
    }
    this.clicked.emit(event);
  }
    
}
