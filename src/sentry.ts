import * as Sentry from '@sentry/vue';

export const initSentry = (app, router) => {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    release: `snapshot@${process.env.npm_package_version}`,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router)
      }),
      new Sentry.Replay()
    ],
    sampleRate: 1.0,
    maxBreadcrumbs: 50,
    tracingOptions: {
      trackComponents: true
    },
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
};

export const setUser = user => {
  Sentry.setUser(user);
};
