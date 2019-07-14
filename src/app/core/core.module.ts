import { NgModule } from '@angular/core';
import { ErrorInterceptor } from '@elexifier/core/error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@elexifier/core/auth.interceptor';
import { AuthService } from '@elexifier/core/auth.service';
import { MessageService } from 'primeng/api';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthService,
    MessageService,
  ],
})
export class CoreModule { }
