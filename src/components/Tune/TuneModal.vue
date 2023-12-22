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
  hideClose?: boolean;
  size?: { width: string; height: string };
}>();
</script>

<template>
  <Teleport to="#modal">
    <TransitionRoot appear :show="open" as="template">
      <Dialog as="div" class="relative z-50" @close="$emit('close')">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-40"
          leave="duration-200 ease-in"
          leave-from="opacity-40"
          leave-to="opacity-0"
        >
          <div class="tune-modal-backdrop fixed inset-0" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
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
                :style="{
                  width: size?.width ? `${size.width}px` : '440px',
                  'min-height': size?.height ? `${size.height}px` : '270px'
                }"
              >
                <div v-if="!hideClose" class="absolute right-4 top-4">
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
  </Teleport>
</template>
