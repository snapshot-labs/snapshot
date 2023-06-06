import { createSharedComposable } from '@vueuse/core';

const subscriptionTypes = ['summary', 'newProposal', 'closedProposal'] as const;
type SubscriptionType = (typeof subscriptionTypes)[number];
type SubscriptionStatus = 'NOT_SUBSCRIBED' | 'VERIFIED' | 'UNVERIFIED';

function useEmailSubscriptionComposable() {
  const userState = ref<SubscriptionStatus>('NOT_SUBSCRIBED');
  const error = ref('');
  const maskedEmail = ref('');
  const loading = ref(false);
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
    const { error: err, data } = await fetchSubscriptionsDetails({
      address: web3Account.value
    });

    if (err.value) {
      loading.value = false;
      return;
    }

    const { status: usrState, email = '', subscriptions } = data.value;
    userState.value = usrState;
    maskedEmail.value = email;
    apiSubscriptions.value = subscriptions || [];
    loading.value = false;
  };

  const subscribe = async (email: string) => {
    loading.value = true;
    const { data, error: err } = await subscribeWithEmail({
      address: web3Account.value,
      email
    });
    loading.value = false;

    error.value = err.value;

    if (data.value.result !== 'OK') {
      error.value = 'unknown';
    }

    return data.value.result === 'OK';
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

  return {
    userState,
    error,
    maskedEmail,
    clientSubscriptions,
    subscribe,
    updateSubscriptions,
    loadEmailSubscriptions,
    loading
  };
}

export const useEmailSubscription = createSharedComposable(
  useEmailSubscriptionComposable
);
