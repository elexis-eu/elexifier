import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { AuthService } from '@elexifier/core/auth.service';

enum Exceptions {
  UserExists = 'USER_EXISTS',
  Unauthorized = 'UNAUTHORIZED',
  InvalidAuthToken = 'INVALID_AUTH_TOKEN',
  FileExists = 'FILE_EXISTS',
  FileError = 'FILE_ERROR',
  PostError = 'POST_ERROR',
  LoginError = 'LOGIN_ERROR',
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  public constructor(
    private messageService: MessageService,
    private authService: AuthService,
  ) {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(
        retry(1),
        catchError((res: HttpErrorResponse) => {
          let message = '';

          const exceptionEnum = res && res.error && res.error.enum || '';

          switch (true) {
            case Exceptions.UserExists === exceptionEnum:
              message = 'User already exists!';
              break;
            case Exceptions.Unauthorized === exceptionEnum:
              message = 'You are unauthorized to access this content!';
              this.authService.logout();
              break;
            case Exceptions.InvalidAuthToken === exceptionEnum:
              message = 'Invalid auth token. Please, login again!';
              this.authService.logout();
              break;
            case Exceptions.FileExists === exceptionEnum:
              message = 'File already exists!';
              break;
            case Exceptions.FileError === exceptionEnum:
              message = 'Ooops, file error!';
              break;
            case Exceptions.PostError === exceptionEnum:
              message = 'Ooops, post error!';
              break;
            case Exceptions.LoginError === exceptionEnum:
              message = 'Invalid email or password. Please, try again!';
              break;
            default:
              // message = JSON.stringify(res);
              message = 'We encountered a slight hiccup';
              console.log('Unhandled Exception');
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Message',
            detail: message,
          });

          return throwError(res);
        }),
      );
  }
}
