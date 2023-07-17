<script setup lang="ts">
defineProps<{ open: boolean; title: string }>();
defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ title }}</h3>
    </template>
    <div class="my-2 flex h-full flex-col p-4 text-center">
      <slot />
    </div>
    <template #footer>
      <div>
        <BaseButton class="w-full" primary @click="$emit('close')">
          {{ $t('continue') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
