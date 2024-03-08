<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';

const props = defineProps<{
  open: boolean;
  title: string;
  subtitle: string;
  network?: string;
  variant: 'success' | 'loading' | 'error';
}>();

const emit = defineEmits(['close', 'tryAgain']);

const closeButtonText = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'Done!';
    default:
      return 'Close';
  }
});

const closeButtonVariant = computed(() => {
  switch (props.variant) {
    case 'loading':
      return 'danger';
    default:
      return undefined;
  }
});
</script>

<template>
  <TuneModal :open="open" hide-close @close="emit('close')">
    <div class="pt-[40px] h-full flex flex-col justify-between">
      <div>
        <TuneModalIndicator :variant="variant" />
        <div class="my-[20px] text-center">
          <TuneModalTitle class="m-0 leading-6">
            {{ title }}
          </TuneModalTitle>
          <TuneModalDescription class="text-md leading-5 mt-1">
            <span v-if="subtitle.startsWith('0x') && network">
              <BaseLink :link="explorerUrl(network, subtitle, 'tx')">
                View on Etherscan</BaseLink
              >
            </span>
            <span v-else>
              {{ subtitle }}
            </span>
          </TuneModalDescription>
        </div>
      </div>
      <div class="m-3 flex gap-[12px]">
        <TuneButton
          class="w-full"
          :variant="closeButtonVariant"
          @click="emit('close')"
          >{{ closeButtonText }}</TuneButton
        >
        <TuneButton
          v-if="variant === 'error'"
          primary
          class="w-full"
          @click="emit('tryAgain')"
        >
          Try again
        </TuneButton>
      </div>
    </div>
  </TuneModal>
</template>
