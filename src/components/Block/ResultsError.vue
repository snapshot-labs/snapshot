<script setup lang="ts">
/**
 * Shown on proposal page when proposal.state is invalid or live calculation of
 * scores failed. It shows a descriptive error message and a retry button,
 * which triggers recalculation. It also shows a "Get help" button for space
 * admins, pointing to discord.
 */

import { ref } from 'vue';
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();

const props = defineProps<{
  isAdmin: boolean;
  proposalId: string;
}>();

const emit = defineEmits<{
  (e: 'retry'): void
}>();

const retrying = ref(false);
const retry = async () => {
  retrying.value = true;
  await fetch(`${import.meta.env.VITE_HUB_URL}/api/scores/${props.proposalId}`);
  retrying.value = false;
  emit('retry');
}
</script>

<template>
  <Block :title="$t('results')" icon="warning" iconClass="text-red">
    <div>{{ t('resultsError') }}</div>
    <UiButton class="mt-3 w-full" @click="retry" :loading="retrying">
      <Icon name="refresh" />
      {{ t('retry') }}
    </UiButton>
    <a
      v-if="isAdmin"
      href="https://discord.gg/snapshot"
      target="_blank"
      class="mt-3 block"
    >
      <UiButton class="w-full">
        {{ t('getHelp') }}
      </UiButton>
    </a>
  </Block>
</template>
