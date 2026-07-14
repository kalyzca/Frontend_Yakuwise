import { Injectable, signal } from '@angular/core'; 
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar'; 
import { AlertComponent } from '../components/alert/alert.component'; 

export type AlertType = 'success' | 'error' | 'warning' | 'info'; 

export interface AlertData { 
  message: string; 
  type: AlertType; 
  duration?: number; 
} 

@Injectable({ 
  providedIn: 'root', 
})

export class AlertService { 
  // Signal para rastrear si hay una alerta activa 
  hasActiveAlert = signal(false); 

  constructor(private readonly snackBar: MatSnackBar) {} 

  /** 
   * Muestra una alerta del tipo especificado 
   * @param message - Mensaje a mostrar 
   * @param type - Tipo de alerta (success, error, warning, info) 
   * @param duration - Duración en ms (default: 4000) 
   */ 
  show(message: string, type: AlertType = 'info', duration: number = 4000): void { 
    this.hasActiveAlert.set(true); 

    const config: MatSnackBarConfig = { 
      data: { message, type }, 
      duration, 
      horizontalPosition: 'right', 
      verticalPosition: 'top', 
      // 🔥 Tip Senior: Pasamos un array de clases. 
      // 'custom-snackbar' nos da control del layout e inyecta especificidad, 
      // y 'alert-' mapea el color dinámico.
      panelClass: ['custom-snackbar', `alert-${type}`], 
    }; 

    const snackBarRef = this.snackBar.openFromComponent(AlertComponent, config); 

    // Resetear el signal cuando se cierra 
    snackBarRef.afterDismissed().subscribe(() => { 
      this.hasActiveAlert.set(false); 
    }); 
  } 

  /** Atajos limpios para las alertas */ 
  success(message: string, duration: number = 4000): void { 
    this.show(message, 'success', duration); 
  } 

  error(message: string, duration: number = 4000): void { 
    this.show(message, 'error', duration); 
  } 

  warning(message: string, duration: number = 4000): void { 
    this.show(message, 'warning', duration); 
  } 

  info(message: string, duration: number = 4000): void { 
    this.show(message, 'info', duration); 
  } 

  /** Cierra todas las alertas activas */ 
  dismiss(): void { 
    this.snackBar.dismiss(); 
    this.hasActiveAlert.set(false); 
  } 
}
