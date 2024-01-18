<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue';

defineEmits(['close']);

const props = defineProps<{
  open: boolean;
  hideClose?: boolean;
  size?: 'big';
}>();

const sizeClass = computed(() => {
  if (!props.size) return '';
  if (props.size === 'big') return 'w-[860px] md:h-[628px] h-full';
});

watch(
  () => props.open,
  value => {
    document.body.classList[value ? 'add' : 'remove']('overflow-hidden');
  }
);

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden');
});

let mutationObserver;

onMounted(() => {
  const targetElement = document.documentElement;
  const targetBody = document.body;

  mutationObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'style'
      ) {
        targetElement.removeAttribute('style');
        targetBody.removeAttribute('style');
      }
    }
  });

  mutationObserver.observe(targetElement, { attributes: true });
  mutationObserver.observe(targetBody, { attributes: true });
});

onUnmounted(() => {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
});
</script>

<template>
  <TransitionRoot :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="bg-black/40 fixed inset-0" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex h-full items-center justify-center md:p-4">
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
              class="rounded-[20px] bg-skin-bg transform overflow-hidden align-middle transition-all h-full md:h-auto"
              :class="sizeClass"
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
</template>
