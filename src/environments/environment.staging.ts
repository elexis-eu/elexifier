import { Environment } from '@env/environment.interface';
import { SentryEnvironment } from '@elexifier/shared/type/sentry-environment.enum';

export const environment: Environment = {
  production: true,
  apiUrl: 'http://localhost:5000/api',
  sentryDsn: '',
  sentryEnvironment: SentryEnvironment.Staging,
  revision: '%REVISION%',
};
