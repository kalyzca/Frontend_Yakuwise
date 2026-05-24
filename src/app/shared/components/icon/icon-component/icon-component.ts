import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icon-component',
  imports: [],
  templateUrl: './icon-component.html',
  styleUrl: './icon-component.scss',
})
export class IconComponent {
  name = input.required<string>();
  size = input<number>(20);
  // Genera la ruta exacta al archivo SVG local de forma reactiva
  iconPath = computed(() => `url(assets/icons/${this.name()}.svg)`);
}
