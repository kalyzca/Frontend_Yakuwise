import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[soloLetrasPuntoUsuario]',
})

export class UsuarioDirective {
  private readonly regexUsuario = /^[a-z]+(?:\.[a-z]+)?$/;

  @HostListener('input', ['$event'])

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart;
    let val = input.value.toLowerCase().replace(/[^a-z.]/g, '');

    if (val.startsWith('.')) val = val.substring(1); // No punto al inicio
    
    const parts = val.split('.');
    if (parts.length > 2) {
      val = `${parts[0]}.${parts.slice(1).join('')}`; // Máximo un solo punto
    }

    if (input.value !== val) {
      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.setSelectionRange(start, start);
    }
  }

  @HostListener('blur', ['$event'])
  
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.value.endsWith('.')) {
      input.value = input.value.slice(0, -1);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
