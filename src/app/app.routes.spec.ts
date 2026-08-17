import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

describe('app routes', () => {
  it('should be an array', () => {
    expect(Array.isArray(routes)).toBe(true);
  });

  it('should not declare duplicated paths', () => {
    const paths = routes.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('should only declare routes with a target', () => {
    for (const route of routes) {
      const hasTarget =
        route.component !== undefined ||
        route.loadComponent !== undefined ||
        route.loadChildren !== undefined ||
        route.children !== undefined ||
        route.redirectTo !== undefined;
      expect(hasTarget).toBe(true);
    }
  });

  it('should keep any wildcard route in last position', () => {
    const wildcardIndex = routes.findIndex((route) => route.path === '**');
    if (wildcardIndex !== -1) {
      expect(wildcardIndex).toBe(routes.length - 1);
    }
  });

  it('should be accepted by the router configuration', () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const router = TestBed.inject(Router);
    expect(router.config).toEqual(routes);
  });
});
