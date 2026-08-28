import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserData } from '../../../../../shared/interfaces/usuario-interface';
import { UsersService } from '../../../../../shared/services/users.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reset-pass-modal-component',
  imports: [MatDialogModule, MatButtonModule,MatIconModule,MatTooltipModule],
  templateUrl: './reset-pass-modal-component.html',
  styleUrl: './reset-pass-modal-component.scss',
})

export class ResetPassModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ResetPassModalComponent>);
  public readonly dataUser = inject<UserData | undefined>(MAT_DIALOG_DATA);
  private readonly usersService = inject(UsersService);
  private readonly alertService = inject(AlertService);
  isLoading = signal(false);
  
  resetPassword(): void {
    this.isLoading.set(true);

    if (this.dataUser?.id) {
      this.usersService.resetPassword(this.dataUser.id).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.dialogRef.close(response);
        },
        error: () => {
          this.isLoading.set(false);
          this.alertService.error("Error al restablecer contraseña.\nPor favor, inténtelo de nuevo.");
        }
      });
    }
  }
}
