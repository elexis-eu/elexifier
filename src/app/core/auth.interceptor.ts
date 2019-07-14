import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = localStorage.getItem('auth_token');

    const newReq = !authToken ? req
      : req.clone({
        headers: new HttpHeaders({
          'Cache-Control': 'no-cache',
          Authorization: `Bearer ${authToken}`,
        }),
      });
    return next.handle(newReq);
  }
}
