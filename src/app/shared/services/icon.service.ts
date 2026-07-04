import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class IconService {
  // Signal con el registro de iconos disponibles
  private readonly iconsRegistry = signal<Record<string, string>>({
    error: 'error',
    check: 'check',
    delete: 'delete',
    edit: 'edit',
    plus: 'plus',
    save: 'save',
    'save-check': 'save-check',
    user: 'user'
  });

  // Signal para obtener la ruta base de los iconos
  private readonly basePath = 'assets/icons';

  // Signal computada para obtener la ruta completa de un icono
  getIconPath = (iconName: string) => {
    return computed(() => {
      const iconFileName = this.iconsRegistry()[iconName];
      if (!iconFileName) {
        console.warn(`Icono "${iconName}" no encontrado en el registro`);
        return '';
      }
      return `${this.basePath}/${iconFileName}.svg`;
    });
  };

  // Método para registrar nuevos iconos dinámicamente
  registerIcon(name: string, fileName: string): void {
    this.iconsRegistry.update(registry => ({
      ...registry,
      [name]: fileName
    }));
  }

  // Método para verificar si un icono existe
  hasIcon(iconName: string): boolean {
    return !!this.iconsRegistry()[iconName];
  }

  // Signals específicos para iconos comunes en alertas
  errorIcon = computed(() => this.getIconPath('error')());
  successIcon = computed(() => this.getIconPath('check')());
  warningIcon = computed(() => this.getIconPath('error')()); // Reutilizamos error para advertencias
  infoIcon = computed(() => this.getIconPath('user')()); // Reutilizamos user para info
}
