<script setup lang="ts">
/**
 * When proposalState is invalid or live calculation of
 * scores failed. Show error message and a retry button,
 * which triggers recalculation.
 * Also shows a "Get help" button for space admins, pointing to discord.
 */

import { Proposal } from '@/helpers/interfaces';

const { t } = useI18n();

const props = defineProps<{
  proposal: Proposal;
  isAdmin: boolean;
  isPending: boolean;
  isInvalid: boolean;
}>();

const emit = defineEmits(['reload']);

const retrying = ref(false);
const retry = async () => {
  if (props.isInvalid || props.isPending) {
    retrying.value = true;
    await fetch(
      `${import.meta.env.VITE_HUB_URL}/api/scores/${props.proposal.id}`
    );
    retrying.value = false;
  }
  emit('reload');
};
</script>

<template>
  <BaseMessage v-if="isPending" level="info">
    {{ $t('resultsCalculating') }}
  </BaseMessage>
  <BaseMessage v-else-if="isInvalid" level="warning">
    <div>{{ t('resultsError') }}</div>
  </BaseMessage>
  <BaseButton class="mt-3 w-full" :loading="retrying" primary @click="retry">
    <BaseIcon name="refresh" />
    {{ t('retry') }}
  </BaseButton>
  <BaseLink
    v-if="isAdmin"
    link="https://discord.snapshot.org/"
    class="mt-3 block"
    hide-external-icon
  >
    <BaseButton tabindex="-1" class="w-full">
      {{ t('getHelp') }}
    </BaseButton>
  </BaseLink>
</template>
