<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
}>();

const isModalSetupOpen = ref(false);
</script>

<template>
  <BaseBlock :title="$t('SnapIt!')" class="text-center">
    <div class="flex flex-col items-center gap-y-3">
      <NFTClaimerLogo size="lg" />
      <span class="text-skin-link">
        Setup SnapIt! now, and let your community mint NFT for each proposals.
        <BaseLink link="https://docs.snapshot.org">Learn more</BaseLink>
      </span>

      <BaseButton @click="isModalSetupOpen = true">Setup SnapIt!</BaseButton>

      <teleport to="#modal">
        <NFTClaimerSetupModal
          :open="isModalSetupOpen"
          :space="space"
          @close="isModalSetupOpen = false"
        />
      </teleport>
    </div>
  </BaseBlock>
</template>
