<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

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
  <BaseModal :open="open" @close="close">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('emailSubscription.title') }}</h3>
      </div>
    </template>

    <template v-if="modalView === 'SUBSCRIBE'">
      <div class="m-4">
        {{ $t('emailSubscription.description') }}
      </div>

      <form class="m-4" @submit.prevent="submit">
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

        <BaseButton
          class="mt-3 w-full"
          primary
          :type="'submit'"
          :loading="loading"
        >
          {{ $t('emailSubscription.subscribe') }}
        </BaseButton>
      </form>
    </template>

    <div v-if="modalView === 'SUCCESS'" class="m-4 text-center">
      <i-ho-check-circle
        class="mx-auto my-4 text-center text-[3em] text-green"
      />
      <h3>
        {{ $t('emailSubscription.postSubscribeMessage.successThanks') }}
      </h3>
      <p class="mt-3 italic">
        {{ $t('emailSubscription.postSubscribeMessage.successConfirmation') }}
      </p>
    </div>

    <template v-if="modalView === 'SUCCESS'" #footer>
      <BaseButton class="w-full" primary @click="close">
        {{ $t('close') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
