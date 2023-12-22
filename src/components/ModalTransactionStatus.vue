<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  title: string;
  subtitle: string;
  variant: 'success' | 'loading' | 'error';
}>();

const emit = defineEmits(['close', 'tryAgain']);

const cancelButtonVariant = computed(() => {
  switch (props.variant) {
    default:
      return undefined;
  }
});

const cancelButtonText = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'Done!';
    default:
      return 'Close';
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
            {{ subtitle }}
          </TuneModalDescription>
        </div>
      </div>
      <div class="m-3 flex gap-[12px]">
        <TuneButton
          class="w-full"
          :variant="cancelButtonVariant"
          @click="emit('close')"
          >{{ cancelButtonText }}</TuneButton
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
