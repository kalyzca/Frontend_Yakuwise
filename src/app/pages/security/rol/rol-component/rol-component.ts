import { AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { ButtonComponent } from "../../../../shared";
import { RouterLink } from "@angular/router";
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { RolModalComponent } from '../../modals/rol-modal-component/rol-modal-component';

export interface RolData {
  id: number;
  name: string;
  state: string;
}

const ELEMENT_DATA: RolData[] = [
  {id: 1, name:'Administrador del sistema', state:'Activo'},
  {id: 2, name:'Operador', state:'Activo'},
  {id: 3, name:'Administrador de operaciones', state:'Inactivo'},
  {id: 4, name:'Jefe de operaciones', state:'Inactivo'}
];

@Component({
  selector: 'app-rol-component',
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule],
  templateUrl: './rol-component.html',
  styleUrl: './rol-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RolComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'state', 'opc'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  readonly dialog = inject(MatDialog);
  
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  ngAfterViewInit(): void {
    console.log('DATOS DE LA TABLA, ROL:', ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearTable() {
    this.dataSource.data = [];
  }

  addData() {
    this.dataSource.data = ELEMENT_DATA;
  }

  createRole():void {
    this.dialog.open(RolModalComponent, {
      width: '350px',
      // height: '400px',
      data: ELEMENT_DATA,
      disableClose:true
    });
  
  }
}

