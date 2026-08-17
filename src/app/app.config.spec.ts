import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { appConfig } from './app.config';
import { routes } from './app.routes';

describe('appConfig', () => {
  it('should expose providers', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should provide the router with the application routes', () => {
    TestBed.configureTestingModule({ providers: [...appConfig.providers] });
    const router = TestBed.inject(Router);
    expect(router.config).toEqual(routes);
  });

  it('should let the router navigate with the configured routes', async () => {
    TestBed.configureTestingModule({ providers: [...appConfig.providers] });
    const router = TestBed.inject(Router);
    await expect(router.navigateByUrl('/')).resolves.not.toThrow();
  });
});
