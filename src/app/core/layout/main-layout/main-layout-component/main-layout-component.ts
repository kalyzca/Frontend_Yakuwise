/// <reference types="@angular/localize" />
import { Component, Injectable } from '@angular/core';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';

// import '@angular/localize/init';

@Injectable()

export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();
  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = $localize`Primera página`;
  itemsPerPageLabel = $localize`Elementos por página:`;
  lastPageLabel = $localize`Última página`;

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = 'Página siguiente';
  previousPageLabel = 'Página anterior';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return $localize`Página 1 de 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return $localize`Página ${page + 1} de ${amountPages}`;
  }
}
@Component({
  selector: 'app-main-layout-component',
  imports: [RouterOutlet, MatPaginatorModule],
  templateUrl: './main-layout-component.html',
  styleUrl: './main-layout-component.scss',
  providers: [{provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl}],
})

export class MainLayoutComponent {

}
