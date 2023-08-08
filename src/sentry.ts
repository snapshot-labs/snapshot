import * as Sentry from '@sentry/vue';

export const initSentry = (app, router) => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    return;
  }

  Sentry.init({
    app,
    tunnel: `${import.meta.env.VITE_SIDEKICK_URL}/sentry`,
    dsn,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router)
      }),
      new Sentry.Replay()
    ],
    sampleRate: 0.01,
    maxBreadcrumbs: 50,
    tracingOptions: {
      trackComponents: true
    },
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^chrome-extension:\/\//i]
  });
};

export const setUser = user => {
  Sentry.setUser(user);
};
