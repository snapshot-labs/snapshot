import mixpanel from 'mixpanel-browser';

export function useMixpanel() {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, { ip: false });

  return { mixpanel };
}
