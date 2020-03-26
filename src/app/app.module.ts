import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { PublicModule } from './public/public.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { CoreModule } from '@elexifier/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { setup } from 'xsm';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as Sentry from '@sentry/browser';
import { environment } from '@env/environment';
import { SentryEnvironment } from '@elexifier/shared/type/sentry-environment.enum';
import { bindState, get } from 'xsm';
import { AuthenticatedUser } from '@elexifier/shared/type/authenticated-user.interface';

@Injectable()
export class SentryErrorHandler implements ErrorHandler {

  private readonly user: AuthenticatedUser | null;

  public constructor() {
    bindState(this, {
      user: null,
    });

    this.user = get('user');

    Sentry.init({
      dsn: environment.sentryDsn,
      environment: environment.sentryEnvironment,
      release: environment.revision,
    });
  }

  public handleError(error) {
    if (!environment.production) {
      const eventId = Sentry.captureException(error.originalError || error);

      if (environment.sentryEnvironment === SentryEnvironment.Staging) {
        Sentry.showReportDialog({
          eventId,
          user: {
            name: this.user && this.user.username || null,
            email: this.user && this.user.email || null,
          },
        });
      }
    }
  }
}

// TODO: remove xsm immediately
setup({ framework: 'Angular' });

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    CoreModule,
    AppRoutingModule,
    PublicModule,
    DictionariesModule,
    UserModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: SentryErrorHandler },
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
