import sign, { DataType } from '@/helpers/sign';
import { JSONRPCSuccess, JSONRPCError } from '@/helpers/interfaces';

let isInitialized = false;
let isSubscriptionsLoading = false;

const SubscribeSchema: DataType = {
  Subscribe: [
    { name: 'address', type: 'address' },
    { name: 'email', type: 'string' }
  ]
};

const UpdateSubscriptionsSchema: DataType = {
  Subscriptions: [
    { name: 'address', type: 'address' },
    { name: 'email', type: 'string' },
    { name: 'subscriptions', type: 'string[]' }
  ]
};

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

const status: Ref<Status> = ref(Status.waiting);
const postSubscribeLevel: Ref<Level> = ref(Level.info);
const postSubscribeMessage = ref('');
const loading = ref(false);
const isSubscribed = ref(false);
const shouldRemoveEmail = ref(true);

const { t } = useI18n();
const { web3Account } = useWeb3();
const { setAlias, aliasWallet, isValidAlias, checkAlias } = useAliasAction();
const apiSubscriptions: Ref<SubscriptionType[]> = ref([]);
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

async function signWithAlias(message, typesSchema) {
  let signature;
  try {
    await checkAlias();
    if (!aliasWallet.value || !isValidAlias.value) {
      await setAlias();
    }

    const wallet = aliasWallet.value;
    const address = aliasWallet.value.address;
    signature = await sign(wallet, address, message, typesSchema);
    console.log('signature', signature);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }

  return signature;
}

async function loadEmailSubscriptions() {
  const address = web3Account.value;

  if (!address) return;
  if (isSubscriptionsLoading) return;

  isSubscriptionsLoading = true;

  try {
    const url = `${import.meta.env.VITE_ENVELOP_URL}/subscriber`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address })
    });

    const result: SubscriptionType[] | JSONRPCError = await response.json();

    if ('error' in result) {
      isSubscribed.value = false;
      throw new Error(result.error.message);
    }

    apiSubscriptions.value = result;
    isSubscribed.value = true;
  } catch (e) {
    isSubscribed.value = false;
    console.error(e);
  } finally {
    isSubscriptionsLoading = false;
  }
}

async function subscribe(email: string, address: string) {
  loading.value = true;

  const message = {
    address,
    email
  };

  try {
    const signature = await signWithAlias(message, SubscribeSchema);

    const response = await fetch(import.meta.env.VITE_ENVELOP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        params: {
          email,
          address,
          signature
        },
        method: 'snapshot.subscribe'
      })
    });

    const result = await response.json();

    if (result.result === 'OK') {
      setPostSubscribeState(Status.success, Level.success, 'success');
    } else {
      setPostSubscribeState(Status.error, Level.warning, 'apiError');
    }
  } catch (e) {
    setPostSubscribeState(Status.error, Level.warning, 'unknownError');
  } finally {
    loading.value = false;
  }
}

async function updateSubscriptions() {
  if (loading.value) return;

  const address = web3Account.value;

  if (!address) return;

  const params = {
    address,
    email: 'dmytro@snapshot.org',
    subscriptions: apiSubscriptions.value
  };

  try {
    const signature = await signWithAlias(params, UpdateSubscriptionsSchema);

    const response = await fetch(import.meta.env.VITE_ENVELOP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'snapshot.update',
        params: {
          ...params,
          signature
        }
      })
    });

    const result: JSONRPCSuccess | JSONRPCError = await response.json();

    if ('error' in result) {
      throw new Error(result.error.message);
    }

    // TODO: refactor this when BE will be ready for removing email
    if (shouldRemoveEmail.value && !apiSubscriptions.value.length) {
      apiSubscriptions.value = [];
    }
  } catch (error) {
    await loadEmailSubscriptions();
  } finally {
    loading.value = false;
  }
}

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

export function useEmailSubscription() {
  onBeforeMount(async () => {
    if (isInitialized) return;
    if (!web3Account.value) return;

    try {
      await loadEmailSubscriptions();
    } finally {
      isInitialized = true;
    }
  });

  return {
    clientSubscriptions,
    shouldRemoveEmail,
    subscribe,
    updateSubscriptions,
    loadEmailSubscriptions,
    status,
    loading,
    reset,
    isSubscribed,
    postSubscribeState: {
      level: postSubscribeLevel,
      message: postSubscribeMessage
    },
    Status
  };
}
