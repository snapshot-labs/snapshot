<script setup lang="ts">
defineProps<{
  open: boolean;
  title?: string;
  showCancel?: boolean;
  disabled?: boolean;
}>();

defineEmits(['close', 'confirm']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ title ? title : $t('confirmAction') }}</h3>
      </div>
    </template>

    <slot />

    <template #footer>
      <div class="flex gap-3">
        <TuneButton v-if="showCancel" class="w-full" @click="$emit('close')">
          {{ $t('cancel') }}
        </TuneButton>
        <TuneButton
          class="w-full"
          primary
          :disabled="disabled"
          @click="$emit('confirm'), $emit('close')"
        >
          {{ $t('confirm') }}
        </TuneButton>
      </div>
    </template>
  </BaseModal>
</template>
