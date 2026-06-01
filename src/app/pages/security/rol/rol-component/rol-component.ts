import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ButtonComponent } from "../../../../shared";
import { RouterLink } from "@angular/router";
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface RolData {
  id: number;
  name: string;
  state: string;
}

const ELEMENT_DATA: RolData[] = [
  {id: 1, name:'Administrador del sistema', state:'Activo'},
  {id: 2, name:'Operador', state:'Activo'},
  {id: 3, name:'Administrador de operaciones', state:'Inactivo'}
];

@Component({
  selector: 'app-rol-component',
  imports: [ButtonComponent, RouterLink, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatTooltipModule],
  templateUrl: './rol-component.html',
  styleUrl: './rol-component.scss',
})

export class RolComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'state', 'opc'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  ngAfterViewInit(): void {
    console.log('DATOS:', ELEMENT_DATA);
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

  // addData() {
  //   this.dataSource.data = ELEMENT_DATA;
  // }
}

