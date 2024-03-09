<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue';
import { useBreakpoints } from '@vueuse/core';
import { SNAPSHOT_BREAKPOINTS } from '@/helpers/constants';

defineEmits(['close']);

const props = defineProps<{
  open: boolean;
  hideClose?: boolean;
  size?: 'big' | 'medium';
}>();

const sizeClass = computed(() => {
  if (!props.size) return 'md:w-[440px] w-full';
  if (props.size === 'big') return 'md:w-[860px] w-full';
  if (props.size === 'medium') return 'md:w-[578px] w-full';
});

const closePositionClass = computed(() => {
  if (!props.size) return 'top-[12px] right-[10px]';
  if (props.size === 'big')
    return 'md:right-[28px] md:top-[16px] right-[10px] top-[10px]';
  if (props.size === 'medium') return 'top-[12px] right-[10px]';
});

const isDesktop = useBreakpoints(SNAPSHOT_BREAKPOINTS).greater('md');

const panelTransitionClasses = computed(() => {
  return isDesktop.value
    ? {
        enter: 'duration-300 ease-out',
        enterFrom: 'opacity-0 scale-95',
        enterTo: 'opacity-100 scale-100',
        leave: 'duration-200 ease-in',
        leaveFrom: 'opacity-100 scale-100',
        leaveTo: 'opacity-0 scale-95'
      }
    : {
        enter: 'duration-300 ease-out',
        enterFrom: 'opacity-0 translate-y-full',
        enterTo: 'opacity-100 translate-y-0',
        leave: 'duration-200 ease-in',
        leaveFrom: 'opacity-100 translate-y-0',
        leaveTo: 'opacity-0 translate-y-full'
      };
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
        <div
          class="flex h-full items-end md:items-center justify-center md:p-4"
        >
          <TransitionChild
            as="template"
            :enter="panelTransitionClasses.enter"
            :enter-from="panelTransitionClasses.enterFrom"
            :enter-to="panelTransitionClasses.enterTo"
            :leave="panelTransitionClasses.leave"
            :leave-from="panelTransitionClasses.leaveFrom"
            :leave-to="panelTransitionClasses.leaveTo"
          >
            <DialogPanel
              class="rounded-t-[20px] md:rounded-[20px] bg-skin-bg transform overflow-hidden align-middle transition-all"
              :class="sizeClass"
            >
              <div
                v-if="!hideClose"
                class="absolute"
                :class="closePositionClass"
              >
                <BaseButtonIcon @click="$emit('close')">
                  <span class="sr-only">Close</span>
                  <i-ho-x class="text-base" aria-hidden="true" />
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
