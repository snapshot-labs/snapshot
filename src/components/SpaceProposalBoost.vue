<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';

defineProps<{
  proposal: Proposal;
}>();
</script>

<template>
  <div class="border rounded-xl py-[32px]">
    <div
      class="h-[56px] w-[56px] flex items-center justify-center rounded-[14px] shadow-xl mx-auto"
    >
      <i-ho-lightning-bolt class="text-base" />
    </div>
    <div class="mx-auto w-[280px] text-center mt-3">
      <h4>Boost proposal</h4>
      <p class="leading-5 mt-[2px]">
        Incentivize people to vote by rewarding voters with a custom logic.
      </p>
      <router-link
        :to="{ name: 'spaceBoost', params: { proposalId: proposal.id } }"
      >
        <TuneButton class="mt-3 text-skin-text"> Boost proposal </TuneButton>
      </router-link>
    </div>
  </div>
</template>
