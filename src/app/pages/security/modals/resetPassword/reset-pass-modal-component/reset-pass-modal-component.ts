import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserData } from '../../../../../shared/interfaces/usuario-interface';
import { UsersService } from '../../../../../shared/services/users.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { AppHttpError } from '../../../../../shared/interfaces/error-interface';

@Component({
  selector: 'app-reset-pass-modal-component',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './reset-pass-modal-component.html',
  styleUrl: './reset-pass-modal-component.scss',
})

export class ResetPassModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ResetPassModalComponent>);
  public readonly dataUser = inject<UserData | undefined>(MAT_DIALOG_DATA);
  private readonly usersService = inject(UsersService);
  private readonly alertService = inject(AlertService);
  
  closeModalResetPass(): void {
    this.dialogRef.close();
  }

  resetPassword(): void {
    if (!this.dataUser?.id) {
      this.alertService.error('No se pudo identificar al usuario. Cierre el diálogo e inténtelo de nuevo.');
      return;
    }

    this.usersService.resetPassword(this.dataUser.id).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err: AppHttpError) => {
        this.alertService.error(`Error al restablecer contraseña: ${err.mensajeGeneral}`);
      }
    });
  }
}
