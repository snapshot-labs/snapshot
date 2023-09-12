<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue';

defineEmits(['close']);

defineProps<{
  open: boolean;
  title?: string;
}>();

onBeforeMount(() => {
  document.documentElement.style.setProperty('scrollbar-gutter', 'auto');
});

onBeforeUnmount(() => {
  document.documentElement.style.setProperty('scrollbar-gutter', 'stable');
});
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center">
          <!-- enter from below -->
          <TransitionChild as="template">
            <DialogPanel
              class="h-screen w-full transform overflow-y-auto bg-skin-bg p-0 align-middle transition-all"
              style="scrollbar-gutter: stable"
            >
              <div
                class="sticky top-0 z-10 h-[70px] w-full border-b border-skin-border bg-skin-bg"
              >
                <div class="absolute right-[18px] top-[18px]">
                  <span tabindex="0"></span>
                  <BaseButtonIcon @click="$emit('close')">
                    <span class="sr-only">Close</span>
                    <i-ho-x class="text-base" aria-hidden="true" />
                  </BaseButtonIcon>
                </div>
              </div>
              <div
                class="mt-4 pb-[40px] text-base"
                :class="{ 'scrolling-enabled': open }"
              >
                <slot />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
