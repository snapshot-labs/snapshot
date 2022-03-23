<script setup lang="ts">
/**
 * Shown on proposal page when proposalState is invalid or live calculation of
 * scores failed. It shows a descriptive error message and a retry button,
 * which triggers recalculation. When proposalState is invalid (meaning the
 * proposal is closed) the endpoint to update the db is triggered. Otherwise
 * live (re)calculation in SpaceProposal.vue kicks in.
 * It also shows a "Get help" button for space admins, pointing to discord.
 */

import { ref } from 'vue';
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();

const props = defineProps<{
  isAdmin: boolean;
  proposalId: string;
  proposalState: string;
}>();

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

const retrying = ref(false);
const retry = async () => {
  if (props.proposalState === 'invalid') {
    retrying.value = true;
    await fetch(
      `${import.meta.env.VITE_HUB_URL}/api/scores/${props.proposalId}`
    );
    retrying.value = false;
  }
  emit('retry');
};
</script>

<template>
  <BaseBlock icon="warning" iconClass="text-red">
    <div>{{ t('resultsError') }}</div>
    <BaseButton class="mt-3 w-full" @click="retry" :loading="retrying" primary>
      <BaseIcon name="refresh" />
      {{ t('retry') }}
    </BaseButton>
    <BaseLink
      v-if="isAdmin"
      link="https://discord.gg/snapshot"
      class="mt-3 block"
      hide-external-icon
    >
      <BaseButton class="w-full">
        {{ t('getHelp') }}
      </BaseButton>
    </BaseLink>
  </BaseBlock>
</template>
