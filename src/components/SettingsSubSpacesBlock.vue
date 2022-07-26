<script setup lang="ts">
defineProps<{
  parent?: string;
  children?: string[];
  getErrorMessage: (field: string) => { message: string; push: boolean };
}>();

defineEmits(['update:parent', 'update:children']);
</script>

<template>
  <BaseBlock :title="$t('settings.subspaces')">
    <div class="space-y-2">
      <!-- WIP -->
    </div>
  </BaseBlock>
</template>
