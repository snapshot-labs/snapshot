<script setup lang="ts">
const emit = defineEmits(['close']);

type ModalView = 'SUBSCRIBE' | 'SUCCESS';

const { web3Account } = useWeb3();
const { subscribe, error, loading, loadEmailSubscriptions } =
  useEmailSubscription();
const { t } = useI18n();
const { notify } = useFlashNotification();

const email = ref('');
const modalView = ref<ModalView>('SUBSCRIBE');

watchEffect(() => {
  if (error.value) {
    notify(['red', t('notify.somethingWentWrong')]);
    error.value = null;
  }
});

function close() {
  email.value = '';
  emit('close');
  modalView.value = 'SUBSCRIBE';
  loadEmailSubscriptions();
}

async function submit() {
  const isSucceed = await subscribe(email.value, web3Account.value);

  if (isSucceed) {
    modalView.value = 'SUCCESS';
  }
}
</script>

<template>
  <template v-if="modalView === 'SUBSCRIBE'">
    <div class="m-4 flex flex-col gap-4">
      <p>
        {{ $t('emailSubscription.description') }}
      </p>

      <form @submit.prevent="submit">
        <BaseInput
          v-model="email"
          :placeholder="$t('emailSubscription.inputPlaceholder')"
          class="!pl-[40px]"
          type="email"
          autocomplete="off"
          required
          focus-on-mount
        >
          <template #before>
            <i-ho-mail class="text-[16px]" />
          </template>
        </BaseInput>

        <small>{{ $t('emailSubscription.inputCaption') }}</small>

        <TuneButton
          class="mt-3 w-full"
          primary
          :type="'submit'"
          :loading="loading"
        >
          {{ $t('emailSubscription.subscribe') }}
        </TuneButton>
      </form>
    </div>
  </template>

  <template v-if="modalView === 'SUCCESS'">
    <div class="m-4 gap-4 flex flex-col text-center">
      <i-ho-check-circle class="mx-auto text-center text-[3em] text-green" />
      <div>
        <h3>
          {{ $t('emailSubscription.postSubscribeMessage.successThanks') }}
        </h3>
        <p class="mt-3 italic">
          {{ $t('emailSubscription.postSubscribeMessage.successConfirmation') }}
        </p>
      </div>
      <TuneButton class="w-full" primary @click="close">
        {{ $t('close') }}
      </TuneButton>
    </div>
  </template>
</template>
