import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiConfigService } from '../services/api-config.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiConfig = inject(ApiConfigService);
  const token = authService.getToken();

  if (token && apiConfig.isApiUrl(req.url)) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Token ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
