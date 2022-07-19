<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const { getErrorMessage } = useSpaceSettingsForm();

defineProps<{
  parent?: string;
  children?: string[];
}>();

const emit = defineEmits(['update:parent', 'update:children']);
</script>

<template>
  <BaseBlock :title="$t('settings.subspaces')">
    <div class="space-y-2">
      <!-- WIP -->
    </div>
  </BaseBlock>
</template>
