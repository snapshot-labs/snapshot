<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['close']);
const { web3Account } = useWeb3();
const email = ref('');
const {
  subscribe,
  reset,
  postSubscribeState,
  isSuccessfullyFinished,
  loading,
  loadEmailSubscriptions
} = useEmailSubscription();

function close() {
  reset();
  email.value = '';
  emit('close');
  loadEmailSubscriptions();
}

function submit() {
  subscribe(email.value, web3Account.value);
}
</script>

<template>
  <BaseModal :open="open" @close="close">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('emailSubscription.title') }}</h3>
      </div>
    </template>
    <div v-if="isSuccessfullyFinished" class="m-4 text-center">
      <i-ho-check-circle
        class="mx-auto my-4 text-center text-[3em] text-green"
      />
      <h3>{{ postSubscribeState.message.value.split('\n')[0] }}</h3>
      <p class="mt-3 italic">
        {{ postSubscribeState.message.value.split('\n')[1] }}
      </p>
    </div>
    <BaseMessageBlock
      v-else-if="postSubscribeState.message.value"
      :level="postSubscribeState.level.value"
      class="m-4"
    >
      {{ postSubscribeState.message.value }}
    </BaseMessageBlock>
    <div v-else class="m-4">
      {{ $t('emailSubscription.description') }}
    </div>
    <form v-if="!isSuccessfullyFinished" class="m-4" @submit.prevent="submit">
      <BaseInput
        v-model="email"
        placeholder="Your email"
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

    <template v-if="isSuccessfullyFinished" #footer>
      <BaseButton class="w-full" primary @click="close">
        {{ $t('close') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
