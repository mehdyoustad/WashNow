import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

export function initSentry() {
  Sentry.init({
    dsn: 'https://your-sentry-dsn@sentry.io/your-project-id', // À remplacer par ton DSN Sentry
    enabled: !__DEV__, // Désactivé en développement
    environment: __DEV__ ? 'development' : 'production',
    release: Constants.expoConfig?.version ?? '1.0.0',
    tracesSampleRate: 0.2, // 20% des transactions tracées
    beforeSend(event) {
      // Filtrer les erreurs non critiques
      if (event.exception?.values?.[0]?.type === 'NetworkError') return null;
      return event;
    },
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[Sentry]', error, context);
    return;
  }
  Sentry.withScope(scope => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}

export function trackEvent(name: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({ message: name, data, level: 'info' });
}

export { Sentry };
