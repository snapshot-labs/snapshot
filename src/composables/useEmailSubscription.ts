import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export function useEmailSubscription() {
  enum Status {
    wating,
    success,
    error
  }

  enum Level {
    info = 'info',
    warning = 'warning',
    'warning-red' = 'warning-red'
  }

  const domain = {
    name: 'snapshot',
    version: '0.1.4'
  };

  const status: Ref<Status> = ref(Status.wating);
  const postSubscribeLevel: Ref<Level> = ref(Level.info);
  const postSubscribeMessage = ref('');
  const loading = ref(false);
  const auth = getInstance();
  const { t } = useI18n();
  const { web3 } = useWeb3();

  async function sign(
    message: {
      email: string;
      from: string;
      timestamp: number;
    },
    types: any
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const signer = auth.web3?.getSigner ? auth.web3.getSigner() : auth.web3;
    return await signer._signTypedData(domain, types, message);
  }

  async function subscribe(email: string, address: string) {
    loading.value = true;

    try {
      const signature = await sign(
        {
          email,
          from: web3.value.account,
          timestamp: parseInt((Date.now() / 1e3).toFixed())
        },
        {
          Subscribe: [
            { name: 'from', type: 'address' },
            { name: 'email', type: 'string' },
            { name: 'timestamp', type: 'uint64' }
          ]
        }
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
        status.value = Status.success;
        postSubscribeLevel.value = Level.info;
        postSubscribeMessage.value = t(
          'emailSubscription.postSubscribeMessage.success'
        );
      } else {
        status.value = Status.error;
        postSubscribeLevel.value = Level.warning;
        postSubscribeMessage.value = t(
          'emailSubscription.postSubscribeMessage.apiError'
        );
      }
    } catch (e) {
      status.value = Status.error;
      postSubscribeLevel.value = Level.warning;
      postSubscribeMessage.value = t(
        'emailSubscription.postSubscribeMessage.unknownError'
      );
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    status.value = Status.wating;
    postSubscribeLevel.value = Level.info;
    postSubscribeMessage.value = '';
  }

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
