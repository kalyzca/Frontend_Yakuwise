import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef, MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel } from '@angular/material/snack-bar';
import { AlertData, AlertType } from '../../services/alert.service';
import { MatIconModule} from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  imports: [MatIconModule, CommonModule, MatButtonModule]
})

export class AlertComponent {
  public snackBarRef = inject(MatSnackBarRef);
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: AlertData,
  //   // private readonly snackBarRef: MatSnackBarRef<AlertComponent>
  ) {}

  /**
   * Cierra la alerta
  //  */
  // close(): void {
  //   this.snackBarRef.dismiss();
  // }

  /**
   * Obtiene el icono según el tipo de alerta
   */
  getIcon(): string {
    const icons: Record<AlertType, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[this.data.type];
  }

  /**
   * Obtiene el nombre de la clase del tipo
   */
  getTypeClass(): string {
    return `alert-${this.data.type}`;
  }
}
