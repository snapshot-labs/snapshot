import { BOOST_WHITELIST_SETTINGS } from '@/helpers/boost';

export function useBoost({ spaceId }: { spaceId: string }) {
  const { env } = useApp();

  const isWhitelisted = computed(() => {
    return !!BOOST_WHITELIST_SETTINGS[env]?.[spaceId];
  });

  const bribeDisabled = computed(() => {
    return BOOST_WHITELIST_SETTINGS[env]?.[spaceId]?.bribeDisabled;
  });

  return {
    isWhitelisted,
    bribeDisabled
  };
}
