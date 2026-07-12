import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserData } from '../../../../../shared/interfaces/usuario.interface';
import { UsersService } from '../../../../../shared/services/users.service';

@Component({
  selector: 'app-reset-pass-modal-component',
  imports: [MatDialogModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './reset-pass-modal-component.html',
  styleUrl: './reset-pass-modal-component.scss',
})

export class ResetPassModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ResetPassModalComponent>);
  public readonly dataUser = inject<UserData | undefined>(MAT_DIALOG_DATA);
  private readonly usersService = inject(UsersService);
  private readonly snackBar = inject(MatSnackBar);

  closeModalResetPass(): void {
    this.dialogRef.close();
  }

  resetPassword(): void {
    if (this.dataUser?.id) {
      this.usersService.resetPassword(this.dataUser.id).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          const errorMessage = error.error?.detail || error.error?.message || 'Error al restablecer contraseña. Por favor, inténtelo de nuevo.';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
