<script setup lang="ts">
import { shorten } from '@/helpers/utils';

defineProps<{
  moduleAddress: string;
  multiSendAddress: string;
  moduleType: string;
  connextModAddress: string | undefined;
  description?: string;
}>();

const { copyToClipboard } = useCopy();
</script>

<template>
  <BasePopoverHover placement="left">
    <template #button>
      <i-ho-information-circle />
    </template>
    <template #content>
      <div v-if="description" class="p-3 text-sm">{{ description }}</div>
      <div v-else class="border bg-skin-bg p-3 text-md shadow-lg md:rounded-lg">
        <div>Multisend address</div>
        <BaseButton
          class="flex w-full items-center justify-between"
          @click="copyToClipboard(multiSendAddress)"
        >
          {{ shorten(multiSendAddress) }}
          <i-ho-duplicate class="ml-1" />
        </BaseButton>
        <div v-if="moduleAddress">
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

        <div v-if="connextModAddress">
          <div class="mt-3">Connext Module address</div>
          <BaseButton
            class="flex w-full items-center justify-between"
            @click="copyToClipboard(connextModAddress)"
          >
            {{ shorten(connextModAddress) }}
            <i-ho-duplicate class="ml-1" />
          </BaseButton>
        </div>
      </div>
    </template>
  </BasePopoverHover>
</template>
