import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterOutlet } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const outlet = fixture.debugElement.children.find((child) => child.name === 'router-outlet');
    expect(outlet).toBeTruthy();
    expect(outlet?.injector.get(RouterOutlet)).toBeInstanceOf(RouterOutlet);
  });

  it('should expose the application title as a signal', () => {
    const fixture = TestBed.createComponent(App);
    const title = (fixture.componentInstance as unknown as { title: () => string }).title;
    expect(typeof title).toBe('function');
    expect(title()).toBe('frontendYakuwise');
  });
});
