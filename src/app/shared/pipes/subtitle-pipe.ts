import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'subtitulo',
})

export class SubtitlePipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) return '';
    const trimmed = value.trim();
    if (trimmed.length === 0) return '';

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  
  }

}
