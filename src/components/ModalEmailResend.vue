<script setup lang="ts">
defineProps<{
  open: boolean;
}>();
const emit = defineEmits(['close']);

const { maskedEmail } = useEmailSubscription();
</script>

<template>
  <BaseModal :open="open" @close="emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('emailResend.title') }}</h3>
      </div>
    </template>
    <div class="m-4 mb-6 text-center">
      {{ $t('emailResend.description') }}

      <BaseInput
        v-model="maskedEmail"
        class="my-4 !pl-[40px]"
        type="email"
        is-disabled
      >
        <template #before>
          <i-ho-mail class="text-[16px]" />
        </template>
      </BaseInput>

      <BaseButton class="w-full" primary @click="emit('close')">
        {{ $t('close') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
