<script setup lang="ts">
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

const props = defineProps<{
  open: boolean;
  address: string;
}>();
const { t } = useI18n();

const emit = defineEmits(['close']);

const email = ref('');
const status: Ref<Status> = ref(Status.wating);
const postSubscribeLevel: Ref<Level> = ref(Level.info);
const postSubscribeMessage = ref('');
const loading = ref(false);

function close() {
  resetForm();
  emit('close');
}

function resetForm() {
  email.value = '';
  status.value = Status.wating;
  postSubscribeLevel.value = Level.info;
  postSubscribeMessage.value = '';
}

async function subscribe() {
  loading.value = true;

  try {
    const response = await fetch('https://envelop.fyi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        params: {
          email: email.value,
          address: props.address
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
</script>

<template>
  <BaseModal :open="open" @close="close">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('emailSubscription.title') }}</h3>
      </div>
    </template>

    <BaseMessageBlock
      v-if="postSubscribeMessage"
      :level="postSubscribeLevel"
      class="m-4"
    >
      {{ postSubscribeMessage }}
    </BaseMessageBlock>
    <div v-else class="m-4">
      {{ $t('emailSubscription.description') }}
    </div>
    <form
      v-if="status !== Status.success"
      class="m-4"
      @submit.prevent="subscribe"
    >
      <InputEmail v-model="email" name="email" autocomplete="off" required>
        <button
          type="submit"
          class="absolute right-0 h-[42px] rounded-r-full px-3"
        >
          <LoadingSpinner v-if="loading" />
          <i-ho-paper-airplane v-else class="rotate-90 text-skin-link" />
        </button>
      </InputEmail>
      <BaseButton class="mt-3 w-full" primary :type="'submit'">
        {{ $t('emailSubscription.subscribe') }}
      </BaseButton>
    </form>

    <template v-if="status === Status.success" #footer>
      <BaseButton class="w-full" primary @click="close">
        {{ $t('close') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
