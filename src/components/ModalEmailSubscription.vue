<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  address: string;
}>();

const emit = defineEmits(['close']);
const email = ref('');
const { subscribe, reset, postSubscribeState, status, loading, Status } =
  useEmailSubscription();

function close() {
  reset();
  email.value = '';
  emit('close');
}

function submit() {
  subscribe(email.value, props.address);
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
      v-if="postSubscribeState.message.value"
      :level="postSubscribeState.level.value"
      class="m-4"
    >
      {{ postSubscribeState.message.value }}
    </BaseMessageBlock>
    <div v-else class="m-4">
      {{ $t('emailSubscription.description') }}
    </div>
    <form v-if="status !== Status.success" class="m-4" @submit.prevent="submit">
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
