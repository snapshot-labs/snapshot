<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';

defineProps<{
  proposal: Proposal;
  voted: boolean;
}>();
</script>

<template>
  <div class="relative mb-1 break-words pr-[80px] leading-7">
    <h3 class="inline pr-2">{{ proposal.title }}</h3>
    <LabelProposalVoted v-if="voted" />
  </div>
</template>
