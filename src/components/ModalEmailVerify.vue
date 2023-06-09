<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();
const emit = defineEmits(['close']);

const { loadEmailSubscriptions } = useEmailSubscription();

watch(
  () => props.open,
  isModalOpen => {
    if (isModalOpen) {
      loadEmailSubscriptions();
    }
  }
);
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

      <BaseButton class="mt-4 w-full" primary @click="emit('close')">
        {{ $t('close') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
