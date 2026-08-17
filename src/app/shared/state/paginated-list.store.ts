import { computed, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ListQueryParams } from '../interfaces/list-query-interface';
import { buildOrdering, resolveApiSearch } from '../utils/list-query.util';

/**
 * Estado compartido de los listados paginados (búsqueda, paginación y ordenamiento)
 * junto con la construcción de los parámetros que espera el backend.
 */
export abstract class PaginatedListStore {
  readonly total = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(5);
  readonly activeSort = signal<Sort>({ active: '', direction: '' });
  readonly searchTerm = signal<string>('');
  readonly paginatorPageIndex = computed(() => this.pageIndex() - 1);

  /** Equivalencia entre las columnas de la tabla y los campos del backend. */
  protected abstract readonly sortFieldMap: Record<string, string>;

  /** Ordenamiento aplicado cuando la tabla no tiene un orden activo. */
  protected abstract readonly defaultOrdering: string;

  /** Recarga el listado con el estado actual. */
  protected abstract load(): void;

  onSearchChange(value: string): void {
    this.searchTerm.set(value ?? '');
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  onSortChange(sort: Sort): void {
    this.activeSort.set(sort);
    this.pageIndex.set(1);
    this.load();
  }

  protected listQueryParams(): ListQueryParams {
    return {
      search: resolveApiSearch(this.searchTerm()),
      ordering: buildOrdering(this.activeSort(), this.sortFieldMap, this.defaultOrdering),
      page: this.pageIndex(),
      page_size: this.pageSize()
    };
  }
}
