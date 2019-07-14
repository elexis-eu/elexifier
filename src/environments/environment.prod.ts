import { Environment } from '@env/environment.interface';
import { SentryEnvironment } from '@elexifier/shared/type/sentry-environment.enum';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://elexifier.elex.is/api',
  sentryDsn: '',
  sentryEnvironment: SentryEnvironment.Production,
  revision: '%REVISION%',
};
