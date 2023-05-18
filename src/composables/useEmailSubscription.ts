import sign, { DataType } from '@/helpers/sign';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

let auth;
let isInitialized = false;
let isSubscriptionsLoading = false;

const SubscribeSchema: DataType = {
  Subscribe: [
    { name: 'address', type: 'address' },
    { name: 'email', type: 'string' }
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

const status: Ref<Status> = ref(Status.waiting);
const postSubscribeLevel: Ref<Level> = ref(Level.info);
const postSubscribeMessage = ref('');
const loading = ref(false);
const isSubscribed = ref(false);

const { t } = useI18n();
const { web3Account } = useWeb3();
const apiSubscriptions = ref([]);

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

    const result = await response.json();

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

  try {
    const signature = await sign(
      auth.web3,
      {
        address: web3Account.value,
        email
      },
      SubscribeSchema
    );

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

    auth = getInstance();

    if (!web3Account.value) return;

    try {
      await loadEmailSubscriptions();
    } finally {
      isInitialized = true;
    }
  });

  return {
    subscribe,
    loadEmailSubscriptions,
    status,
    loading,
    reset,
    postSubscribeState: {
      level: postSubscribeLevel,
      message: postSubscribeMessage
    },
    Status
  };
}
