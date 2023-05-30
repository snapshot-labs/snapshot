import { createSharedComposable } from '@vueuse/core';

enum Status {
  waiting,
  success,
  error
}

enum Level {
  info = 'info',
  warning = 'warning',
  'warning-red' = 'warning-red',
  success = 'success'
}

const subscriptionTypes = ['summary', 'newProposal', 'closedProposal'] as const;
type SubscriptionType = (typeof subscriptionTypes)[number];

function useEmailSubscriptionComposable() {
  const { t } = useI18n();

  const status = ref<Status>(Status.waiting);
  const isSuccessful = computed(() => status.value === Status.success);
  const postSubscribeLevel = ref<Level>(Level.info);
  const postSubscribeMessage = ref('');
  const loading = ref(false);
  const isSubscribed = ref(false);
  const shouldRemoveEmail = ref(true);
  const { aliasWallet } = useAliasAction();
  const { fetchSubscriptions, subscribeWithEmail, updateEmailSubscriptions } =
    useEmailFetchClient();

  const apiSubscriptions = ref<SubscriptionType[]>([]);
  const clientSubscriptions = computed({
    get() {
      return subscriptionTypes.reduce((acc, type) => {
        acc[type] = apiSubscriptions.value.includes(type);
        return acc;
      }, {} as Record<SubscriptionType, boolean>);
    },
    set(value) {
      apiSubscriptions.value = Object.entries(value)
        .map(([key, value]) => (value ? key : undefined))
        .filter(Boolean)
        .map(key => key as SubscriptionType);
    }
  });

  const loadEmailSubscriptions = async () => {
    loading.value = true;
    const { error, data } = await fetchSubscriptions({
      address: aliasWallet.value.address
    });
    loading.value = false;
    if (!error.value && data.value) {
      apiSubscriptions.value = data.value;
      isSubscribed.value = true;
    }
  };

  const subscribe = async (email: string) => {
    loading.value = true;
    const { data } = await subscribeWithEmail({
      address: aliasWallet.value.address,
      email
    });
    loading.value = false;

    if (data.value?.result === 'OK') {
      setPostSubscribeState(Status.success, Level.success, 'success');
    } else {
      setPostSubscribeState(Status.error, Level.warning, 'error');
    }
  };

  const updateSubscriptions = async () => {
    loading.value = true;
    await updateEmailSubscriptions({
      address: aliasWallet.value.address,
      email: '',
      subscriptions: apiSubscriptions.value
    });
    loading.value = false;
    loadEmailSubscriptions();
  };

  function setPostSubscribeState(
    newStatus: Status,
    level: Level,
    messageKey?: string
  ) {
    status.value = newStatus;
    postSubscribeLevel.value = level;
    postSubscribeMessage.value = messageKey
      ? t(`emailSubscription.postSubscribeMessage.${messageKey}`)
      : '';
  }

  function reset() {
    setPostSubscribeState(Status.waiting, Level.info);
  }

  return {
    clientSubscriptions,
    shouldRemoveEmail,
    subscribe,
    updateSubscriptions,
    loadEmailSubscriptions,
    status,
    loading,
    reset,
    isSuccessful,
    isSubscribed,
    postSubscribeState: {
      level: postSubscribeLevel,
      message: postSubscribeMessage
    }
  };
}

export const useEmailSubscription = createSharedComposable(
  useEmailSubscriptionComposable
);
