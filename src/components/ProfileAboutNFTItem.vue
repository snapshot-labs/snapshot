<script setup lang="ts">
import { shorten } from '@/helpers/utils';

defineProps<{
  mint: any;
}>();
</script>

<template>
  <router-link
    :to="{
      name: 'spaceProposal',
      params: {
        key: mint.proposal.spaceCollection.spaceId,
        id: mint.proposal.hexId
      }
    }"
  >
    <NFTClaimerLogo class="mx-auto" />
    <div class="mt-2 truncate text-xs">
      {{ shorten(mint.proposal.id) }}
    </div>
  </router-link>
</template>
