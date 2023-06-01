<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  level: 'info' | 'warning' | 'warning-red';
}>();

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ title }}</h3>
      </div>
    </template>

    <BaseMessageBlock :level="level" class="m-4 whitespace-pre-line">
      <slot name="message" />
    </BaseMessageBlock>
    <template #footer>
      <BaseButton class="w-full" primary @click="$emit('close')">
        {{ $t('continue') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
