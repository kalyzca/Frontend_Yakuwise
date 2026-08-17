import { Directive, ElementRef, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[soloLetras]',
})

export class LetrasDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly renderer = inject(Renderer2);

  private unlistenInput?: () => void;
  private unlistenBlur?: () => void;

  ngOnInit(): void {
    const inputElement = this.el.nativeElement;

    this.unlistenInput = this.renderer.listen(inputElement, 'input', () => {
      const initialValue = inputElement.value;
      
      let cleaned = initialValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');

      if (cleaned.startsWith(' ')) {
        cleaned = cleaned.trimStart();
      }

      this.renderer.setProperty(inputElement, 'value', cleaned);

      if (initialValue !== cleaned) {
        inputElement.dispatchEvent(new Event('input'));
      }
    });

    this.unlistenBlur = this.renderer.listen(inputElement, 'blur', () => {
      const initialValue = inputElement.value;
      
      const cleaned = initialValue.trim().replace(/\s+/g, ' ');

      this.renderer.setProperty(inputElement, 'value', cleaned);

      if (initialValue !== cleaned) {
        inputElement.dispatchEvent(new Event('input'));
      }
    });
  }

  ngOnDestroy(): void {
    this.unlistenInput?.();
    this.unlistenBlur?.();
  }
}
