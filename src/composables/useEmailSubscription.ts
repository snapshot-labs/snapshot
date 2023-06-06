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
type SubscriptionStatus = 'RECORD_NOT_FOUND' | 'VERIFIED' | 'UNVERIFIED';

function useEmailSubscriptionComposable() {
  const { t } = useI18n();

  const status = ref<Status>(Status.waiting);
  const maskedEmail = ref('');
  const isSuccessful = computed(() => status.value === Status.success);
  const postSubscribeLevel = ref<Level>(Level.info);
  const postSubscribeMessage = ref('');
  const loading = ref(false);
  // TODO: `isSubscribed` should be replaced with `state: SubscriptionStatus` when the API is ready
  const isSubscribed = ref(false);
  const shouldRemoveEmail = ref(true);
  const { web3Account } = useWeb3();
  const {
    fetchSubscriptionsDetails,
    subscribeWithEmail,
    updateEmailSubscriptions
  } = useEmailFetchClient();

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
    const { error, data } = await fetchSubscriptionsDetails({
      address: web3Account.value
    });

    if (error.value) {
      setPostSubscribeState(Status.error, Level.warning, 'error');
      isSubscribed.value = false;
      loading.value = false;
      return;
    }

    const { status, email, subscriptions } = data.value;
    switch (status as SubscriptionStatus) {
      case 'VERIFIED':
        isSubscribed.value = true;
        apiSubscriptions.value = subscriptions;
        maskedEmail.value = email;
        break;
      case 'UNVERIFIED':
        isSubscribed.value = false;
        maskedEmail.value = email;
        break;
      case 'RECORD_NOT_FOUND':
        isSubscribed.value = false;
        break;
    }

    loading.value = false;
  };

  const subscribe = async (email: string) => {
    loading.value = true;
    const { data } = await subscribeWithEmail({
      address: web3Account.value,
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
      address: web3Account.value,
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
