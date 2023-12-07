<script setup lang="ts">
defineProps<{
  open: boolean;
  title?: string;
  disabled?: boolean;
}>();

defineEmits(['close', 'save', 'leave']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ title ? title : 'Unsaved changes' }}</h3>
      </div>
    </template>

    <BaseMessageBlock level="warning" class="m-4">
      You have unsaved changes. Would you like to save them before leaving?
    </BaseMessageBlock>

    <template #footer>
      <div class="flex gap-3">
        <TuneButton class="w-full" @click="$emit('leave'), $emit('close')">
          Leave
        </TuneButton>
        <TuneButton
          class="w-full"
          primary
          :disabled="disabled"
          @click="$emit('save'), $emit('close')"
        >
          Save
        </TuneButton>
      </div>
    </template>
  </BaseModal>
</template>
