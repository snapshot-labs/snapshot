<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';

defineProps<{
  discussionLink: string;
}>();
</script>

<template>
  <BaseLink :link="getIpfsUrl(discussionLink)" hide-external-icon>
    <BaseBlock class="cursor-pointer hover:md:border-skin-text">
      <div class="text-skin-link flex items-center justify-between">
        <div class="flex items-center">
          <BaseIcon name="receipt-outlined" size="22" />
          <span class="ml-3 text-md">
            {{ $t('discussion') }}
          </span>
        </div>
        <BaseIcon name="external-link" size="20" />
      </div>
    </BaseBlock>
  </BaseLink>
</template>
