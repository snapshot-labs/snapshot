<script setup lang="ts">
/**
 * When proposalState is invalid or live calculation of
 * scores failed. Show error message, and trigger refresh in the background
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
</script>

<template>
  <BaseMessage v-if="isPending" level="info">
    {{ $t('resultsCalculating') }}
  </BaseMessage>
  <BaseMessage v-else-if="isInvalid" level="warning">
    <div>{{ t('resultsError') }}</div>
  </BaseMessage>
  <BaseLink
    v-if="isAdmin"
    link="https://discord.snapshot.org/"
    class="mt-3 block"
    hide-external-icon
  >
    <TuneButton tabindex="-1" class="w-full">
      {{ t('getHelp') }}
    </TuneButton>
  </BaseLink>
</template>
