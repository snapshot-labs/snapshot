<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
}>();
</script>
<template>
  <div class="mb-3 text-center">
    <BaseBlock class="py-2 text-skin-link">
      <div class="mb-3">
        <i-ho-emoji-sad class="mx-auto" />
        <div class="mt-2 text-base">
          {{ $t('noResultsFound') }}
        </div>
      </div>
      <router-link :to="{ name: 'spaceCreate' }">
        <BaseButton tabindex="-1"> New proposal </BaseButton>
      </router-link>
    </BaseBlock>
  </div>
</template>
