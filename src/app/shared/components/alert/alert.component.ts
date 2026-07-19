import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
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
  ) {}

  getIcon(): string {
    const icons: Record<AlertType, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[this.data.type];
  }

  getTypeClass(): string {
    return `alert-${this.data.type}`;
  }
}
