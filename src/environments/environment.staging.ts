import { Environment } from '@env/environment.interface';
import { SentryEnvironment } from '@elexifier/shared/type/sentry-environment.enum';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://staging.elexifier.elex.is/api',
  sentryDsn: 'https://9d133abcd0db4447923dfb72766db1c5@sentry.io/1768443',
  sentryEnvironment: SentryEnvironment.Staging,
  revision: '%REVISION%',
};
