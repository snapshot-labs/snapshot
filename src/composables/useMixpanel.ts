import mixpanel from 'mixpanel-browser';

const MIXPANEL_PROXY_DOMAIN = 'https://t.snapshot.org';

export function useMixpanel() {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
    ip: false,
    api_host: MIXPANEL_PROXY_DOMAIN
  });

  return { mixpanel };
}
