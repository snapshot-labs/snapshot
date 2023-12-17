<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue';

defineEmits(['close']);

defineProps<{ open: boolean; size?: { width: number; height: number } }>();
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-70"
        leave="duration-200 ease-in"
        leave-from="opacity-70"
        leave-to="opacity-0"
      >
        <div class="tune-modal-backdrop fixed inset-0" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="tune-modal-panel transform overflow-hidden align-middle transition-all"
              :class="`
                ${size?.width ? `max-w-[${size.width}px]` : 'max-w-[500px]'}
                ${size?.height ? `max-h-[${size.height}px]` : 'max-h-[500px]'}
              `"
            >
              <div class="absolute right-2 top-2">
                <BaseButtonIcon @click="$emit('close')">
                  <span class="sr-only">Close</span>
                  <i-ho-x class="text-md" aria-hidden="true" />
                </BaseButtonIcon>
              </div>

              <slot />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
