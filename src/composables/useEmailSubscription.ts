import sign, { SubscribeType } from '@/helpers/sign';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

let auth;
let isInitialized = false;

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

const { t } = useI18n();
const { web3 } = useWeb3();

async function subscribe(email: string, address: string) {
  loading.value = true;

  try {
    const signature = await sign(
      auth.web3,
      web3.value.account,
      {
        email
      },
      SubscribeType
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
  onBeforeMount(() => {
    if (isInitialized) return;

    auth = getInstance();

    isInitialized = true;
  });

  return {
    subscribe,
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
