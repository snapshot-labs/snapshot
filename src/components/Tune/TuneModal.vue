<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue';

defineEmits(['close']);

defineProps<{ open: boolean; title: string }>();
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
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
              class="tune-modal-panel w-full transform overflow-hidden align-middle transition-all"
            >
              <div class="absolute right-4 top-4">
                <button @click="$emit('close')">
                  <span class="sr-only">Close</span>
                  <i-ho-x class="text-md" aria-hidden="true" />
                </button>
              </div>
              <DialogTitle as="h3" class="tune-modal-title">
                {{ title }}
              </DialogTitle>
              <div class="mt-4"><slot /></div>

              <div v-if="$slots.footer" class="mt-4">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
