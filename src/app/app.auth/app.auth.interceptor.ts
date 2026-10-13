import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppAuthService } from './app.auth.service';

@Injectable()
export class AppAuthInterceptor implements HttpInterceptor {
  constructor(private auth: AppAuthService, private router: Router) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const api = new URL(environment.integraHost, window.location.origin);
    const target = new URL(req.url, window.location.origin);
    if (req.url === environment.integraAuth || target.origin !== api.origin || !target.pathname.startsWith(api.pathname)) {
      return next.handle(req);
    }
    if (!this.auth.isAutenticated()) {
      this.auth.logout();
      this.router.navigate(['/login']);
      return throwError(() => new Error('Sessão expirada. Entre novamente.'));
    }
    const token = localStorage.getItem('token');
    const authenticated = token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;
    return next.handle(authenticated).pipe(catchError(error => {
      if (error.status === 401) {
        this.auth.logout();
        this.router.navigate(['/login']);
      }
      return throwError(() => error);
    }));
  }
}
