import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root'})

export class ButtonConfigService {
  // Signal reactiva para el color por defecto de la aplicación
  defaultColor = signal<'primary' | 'secondary' | 'accent'>('primary');

  // Método para actualizar el tema dinámicamente en tiempo de ejecución
  setGlobalColor(color: 'primary' | 'secondary' | 'accent'):void {
    this.defaultColor.set(color);
  }

}
