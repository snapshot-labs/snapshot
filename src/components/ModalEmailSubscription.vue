<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  address: string;
}>();

const emit = defineEmits(['close', 'update:modelValue']);
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
      <BaseInput
        v-model="email"
        placeholder="johndoe@gmail.com"
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

      <small>
        You may be asked to sign a transaction to verify wallet ownership
      </small>

      <BaseButton
        class="mt-3 w-full"
        primary
        :type="'submit'"
        :loading="loading"
      >
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
