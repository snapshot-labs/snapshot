<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

defineEmits(['close', 'confirm']);
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('confirmAction') }}</h3>
      </div>
    </template>

    <slot />
    <template v-slot:footer>
      <UiButton
        class="button-outline w-full"
        primary
        @click="$emit('confirm'), $emit('close')"
      >
        {{ $t('confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>
