import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RolesService } from '../../../../shared/services/roles.service';
import { RolMenusService } from '../../../../shared/services/rol-menus.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { RoleResponse } from '../../../../shared/interfaces/roles-interface';
import { Observable } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface AssignRolesData {
  menuId: number;
  menuName: string;
}

@Component({
  selector: 'app-assign-roles-modal',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    TitleCasePipe,
    MatTooltipModule
  ],
  templateUrl: './assign-roles-modal.component.html',
  styleUrl: './assign-roles-modal.component.scss',
  
})

export class AssignRolesModalComponent implements OnInit {
  private readonly rolesService = inject(RolesService);
  private readonly rolMenusService = inject(RolMenusService);
  private readonly alertService = inject(AlertService);
  private readonly dialogRef = inject(MatDialogRef<AssignRolesModalComponent>);
  readonly data = inject<AssignRolesData>(MAT_DIALOG_DATA);

  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly availableRoles = signal<RoleResponse[]>([]);
  readonly assignedRoles = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadRoles();
    this.loadAssignedRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.rolesService.getRoles({ page: 1, page_size: 100 }).subscribe({
      next: (response) => {
        const activeRoles = response.results.filter(role => role.estado === true);
        this.availableRoles.set(activeRoles);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Error al cargar roles disponibles.');
        this.isLoading.set(false);
      }
    });
  }

  loadAssignedRoles(): void {
    this.rolMenusService.getRolMenus({ id_menu: this.data.menuId, page: 1, page_size: 100 }).subscribe({
      next: (response) => {
        const assignedRoleIds = new Set<number>();
        response.results.forEach(rm => {
          assignedRoleIds.add(rm.id_rol);
        });
        this.assignedRoles.set(assignedRoleIds);
      },
      error: () => {
        this.alertService.error('Error al cargar roles asignados.');
        this.assignedRoles.set(new Set<number>());
      }
    });
  }

  toggleRole(roleId: number): void {
    this.assignedRoles.update(current => {
      const newSet = new Set(current);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  }

  onSave(): void {
    this.isSaving.set(true);
    
    this.rolMenusService.getRolMenus({ id_menu: this.data.menuId, page: 1, page_size: 100 }).subscribe({
      next: (response) => {
        const currentlyAssigned = new Set<number>(
          response.results.map(rm => rm.id_rol)
        );
        const newAssignments = this.assignedRoles();
        const rolesToAdd: number[] = [];

        newAssignments.forEach(roleId => {
          if (!currentlyAssigned.has(roleId)) {
            rolesToAdd.push(roleId);
          }
        });

        const rolesToRemove: number[] = [];
        currentlyAssigned.forEach(roleId => {
          if (!newAssignments.has(roleId)) {
            const rolMenu = response.results.find(rm => rm.id_rol === roleId);
            if (rolMenu?.id_rol_menus) {
              rolesToRemove.push(rolMenu.id_rol_menus);
            }
          }
        });

        const addRequests = rolesToAdd.map(roleId =>
          this.rolMenusService.createRolMenu({ id_rol: roleId, id_menu: this.data.menuId })
        );

        const removeRequests = rolesToRemove.map(id =>
          this.rolMenusService.deleteRolMenu(id)
        );

        const allRequests: Observable<any>[] = [...addRequests, ...removeRequests];

        if (allRequests.length === 0) {
          this.isSaving.set(false);
          this.dialogRef.close(true);
          return;
        }

        let completed = 0;
        let hasError = false;

        allRequests.forEach(request => {
          request.subscribe({
            next: () => {
              completed++;
              if (completed === allRequests.length) {
                this.isSaving.set(false);
                if (hasError) {
                  this.alertService.warning('Algunas asignaciones no se pudieron completar.');
                } else {
                  this.alertService.success('Roles asignados exitosamente.');
                }
                this.dialogRef.close(true);
              }
            },
            error: () => {
              completed++;
              hasError = true;
              
              if (completed === allRequests.length) {
                this.isSaving.set(false);
                this.alertService.warning('Algunas asignaciones no se pudieron completar.');
                this.dialogRef.close(true);
              }
            }
          });
        });
      },
      error: () => {
        this.isSaving.set(false);
        this.alertService.error('Error al guardar asignaciones.');
      }
    });
  }
}
