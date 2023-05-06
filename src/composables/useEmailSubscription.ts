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

  const status: Ref<Status> = ref(Status.wating);
  const postSubscribeLevel: Ref<Level> = ref(Level.info);
  const postSubscribeMessage = ref('');
  const loading = ref(false);
  const { t } = useI18n();

  async function subscribe(email: string, address: string) {
    loading.value = true;

    try {
      const response = await fetch('https://envelop.fyi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          params: {
            email,
            address
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
