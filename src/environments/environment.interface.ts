import { SentryEnvironment } from '@elexifier/shared/type/sentry-environment.enum';

export interface Environment {
  apiUrl: string;
  production: boolean;
  revision: string;
  sentryDsn: string;
  sentryEnvironment: SentryEnvironment;
}
