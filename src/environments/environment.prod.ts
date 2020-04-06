import { Environment } from '@env/environment.interface';
import { SentryEnvironment } from '@elexifier/shared/type/sentry-environment.enum';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://app.elexifier.elex.is/api',
  appUrl: 'https://app.elexifier.elex.is',
  sentryDsn: 'https://b65f0fecd1984fae977e41691e41e0b8@sentry.io/1724076',
  sentryEnvironment: SentryEnvironment.Production,
  revision: '%REVISION%',
};
