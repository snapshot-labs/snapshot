<script setup lang="ts">
import { shorten } from '@/helpers/utils';

defineProps<{
  moduleAddress: string;
  multiSendAddress: string;
  moduleType: string;
}>();

const { copyToClipboard } = useCopy();
</script>

<template>
  <BasePopoverHover placement="left">
    <template #button>
      <i-ho-information-circle />
    </template>
    <template #content>
      <div class="border bg-skin-bg p-3 text-md shadow-lg md:rounded-lg">
        <div>Multisend address</div>
        <BaseButton
          class="flex w-full items-center justify-between"
          @click="copyToClipboard(multiSendAddress)"
        >
          {{ shorten(multiSendAddress) }}
          <i-ho-duplicate class="ml-1" />
        </BaseButton>
        <div class="mt-3">
          {{ moduleType === 'reality' ? 'Reality' : 'UMA' }} Module address
        </div>
        <BaseButton
          class="flex w-full items-center justify-between"
          @click="copyToClipboard(moduleAddress)"
        >
          {{ shorten(moduleAddress) }}
          <i-ho-duplicate class="ml-1" />
        </BaseButton>
      </div>
    </template>
  </BasePopoverHover>
</template>
