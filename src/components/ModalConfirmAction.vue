<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

defineEmits(['close', 'confirm']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('confirmAction') }}</h3>
      </div>
    </template>

    <slot />
    <template #footer>
      <BaseButton
        class="w-full"
        primary
        @click="$emit('confirm'), $emit('close')"
      >
        {{ $t('confirm') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
