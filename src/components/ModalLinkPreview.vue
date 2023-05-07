<script setup lang="ts">
defineProps<{
  open: boolean;
  clickedUrl: string;
}>();

defineEmits<{
  (event: 'close'): void;
  (event: 'confirm'): void;
}>();
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <ModalConfirmAction
    :open="open"
    title="Link preview"
    show-cancel
    @close="$emit('close')"
    @confirm="$emit('confirm')"
  >
    <div
      class="p-4 text-center"
      v-html="
        $t('linkPreview', {
          url: `<span class='text-skin-link font-semibold break-words'>${clickedUrl}</span>`
        })
      "
    />
  </ModalConfirmAction>
</template>
