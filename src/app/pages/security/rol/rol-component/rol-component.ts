import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ButtonComponent } from "../../../../shared";
import { RouterLink } from "@angular/router";
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms'; 
import { RolModalComponent, RoleData } from '../../modals/rol-modal-component/rol-modal-component';
import { NgStyle } from "../../../../../../node_modules/@angular/common/types/_common_module-chunk";

// Datos iniciales de respaldo por si el localStorage está vacío la primera vez
const DEFAULT_ROLES : RoleData[] = [
  { id: 1, name: 'Administrador del sistema', state: 'Activo' },
  { id: 2, name: 'Operador', state: 'Activo' },
  { id: 3, name: 'Administrador de operaciones', state: 'Inactivo' },
  { id: 4, name: 'Jefe de operaciones', state: 'Inactivo' }
];

@Component({
  selector: 'app-rol-component',
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule, FormsModule],
  templateUrl: './rol-component.html',
  styleUrl: './rol-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RolComponent {
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'name', 'state', 'actions'];

  // 1. Inicialización reactiva: Intenta leer del localStorage. Si no hay nada, usa los por defecto.
  roles = signal<RoleData[]>(this.getInitialRoles());

  // Señales para controlar la paginación
  pageIndex = signal<number>(0);
  pageSize = signal<number>(5); // Inicializado en 2 para probar el cambio de página fácilmente
  activeSort = signal<Sort>({ active: '', direction: '' });
  searchTerm = signal<string>('');

  constructor() {
    // localStorage.clear();
    // 2. EFECTO REACTIVO AUTOMÁTICO: Escucha los cambios de la señal 'roles' y actualiza el localStorage.
    // Al estar en el constructor, se registra al nacer el componente y no requiere limpieza manual.
    effect(() => {
      const currentRoles = this.roles();
      localStorage.setItem('my_app_roles', JSON.stringify(currentRoles));
    });
  }

  // Función auxiliar de lectura segura para la inicialización de la señal
  private getInitialRoles(): RoleData[] {
    const saved = localStorage.getItem('my_app_roles');
    if (saved) {
      try {
        let roleParse = JSON.parse(saved);
        return roleParse;
      } catch (e) {
        console.error('Error al parsear los roles desde localStorage, usando valores por defecto.', e);
      }
    }
    return DEFAULT_ROLES;
  }
    // 3. SEÑAL COMPUTADA INTERMEDIA: Filtra los usuarios según el buscador
  // Esto nos permite calcular el total de páginas correcto de forma independiente
  filteredRoles = computed(() => {
    const term = (this.searchTerm() ?? '').toLowerCase().trim();
    if (!term) return this.roles();

    return this.roles().filter(role => {
      const nameLowerCase = (role.name || '').toLowerCase();
      const stateLowerCase = (role.state || '').toLowerCase();
      
      // Si el usuario escribe exactamente "activo" o "inactivo", filtramos directo por la columna estado
      if (term === 'activo' || term === 'inactivo') {
        return stateLowerCase === term;
      }
      // Si escribe cualquier otra cosa (ej: "Admin"), busca en nombre o estado normalmente
      return nameLowerCase.includes(term) || stateLowerCase.includes(term);
    });
  });

  // Señal computada para obtener la cantidad de elementos filtrados (para el paginador)
  filteredRolesCount = computed(() => this.filteredRoles().length);
  
  // SEÑAL COMPUTADA PRINCIPAL: Se encarga de ordenar y paginar automáticamente
  displayedRoles = computed(() => {
    // Tomamos una copia superficial de la lista original para no mutarla
    let processedRoles = [...this.filteredRoles()];

    // A. Aplicamos Ordenamiento si hay un criterio activo
    const sort = this.activeSort();

    if (sort.active && sort.direction) {
      processedRoles.sort((a, b) => {
        const valueA = (a[sort.active as keyof RoleData] || '').toString().toLowerCase();
        const valueB = (b[sort.active as keyof RoleData] || '').toString().toLowerCase();

        return sort.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }

    // B. Aplicamos Paginación (Corte del array resultante)
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();

    return processedRoles.slice(start, end);
  });

  // 3. Controladores de eventos que simplemente actualizan el estado de las señales
  onSearchChange(value: string): void {
    this.pageIndex.set(0); // Reiniciamos a la primera página al buscar
    this.searchTerm.set(value ?? '');
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.activeSort.set(sort);
    // Reiniciamos a la primera página al ordenar para evitar descuadres visuales
    this.pageIndex.set(0);
  }

  // clearTable() {
  //   this.dataSource.data = [];
  // }

  // addData() {
  //   this.dataSource.data = ELEMENT_DATA;
  // }

  createRole(role?: RoleData): void {
    const dialogRef = this.dialog.open(RolModalComponent, {
      width: '450px',
      data: role,// Pasamos el rol completo si estamos editando
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(
      (result: RoleData | undefined) => {
        // Si el usuario canceló el modal, no hacemos nada
        if (!result) return;

        if (role && role.id) {
          // MODO EDICIÓN: Buscamos por ID y reemplazamos el objeto completo
          this.roles.update(currentRoles =>
            currentRoles.map(r => r.id === role.id ? { ...result, id: role.id } : r)
          );
        } else {
          // MODO CREACIÓN: Generamos un ID único temporal y añadimos al arreglo
          const newRecord: RoleData = { id: Date.now(), ...result   // ID numérico limpio
          };
          this.roles.update(currentRoles => [...currentRoles, newRecord]);
        }
        // Forzamos el reinicio de la página a la primera para ver los cambios
        this.pageIndex.set(0);
      });
  }
}
