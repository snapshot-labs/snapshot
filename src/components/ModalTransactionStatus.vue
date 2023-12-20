<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  title: string;
  subtitle: string;
  variant: 'success' | 'loading' | 'error';
}>();

const emit = defineEmits(['close', 'tryAgain']);

const badgeClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green/10 border-green/40';
    case 'loading':
      return 'bg-[--border-color-subtle] border-[--border-color-soft]';
    case 'error':
      return 'bg-red/10 border-red/40';
  }
});

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
        <div
          class="w-[64px] h-[64px] mx-auto shadow-xl border rounded-[20px] flex justify-center items-center"
          :class="badgeClass"
        >
          <i-ho-check-circle
            v-if="variant === 'success'"
            class="text-green text-sm"
          />
          <i-ho-exclamation-circle
            v-else-if="variant === 'error'"
            class="text-red"
          />
          <TuneLoadingSpinner v-else />
        </div>
        <div class="my-[20px] text-center">
          <h3 class="m-0 leading-6">{{ title }}</h3>
          <div class="text-md leading-5 mt-1">
            {{ subtitle }}
          </div>
        </div>
      </div>
      <div class="mx-3 mb-3 flex gap-[12px]">
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
