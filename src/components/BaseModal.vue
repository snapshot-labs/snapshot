<script setup lang="ts">
import { watch, toRefs } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    hideClose?: boolean;
    maxHeight?: string;
  }>(),
  {
    hideClose: false,
    maxHeight: '420px'
  }
);

const emit = defineEmits(['close']);

const { open } = toRefs(props);

watch(open, isOpen => {
  document.body.classList[isOpen ? 'add' : 'remove']('overflow-hidden');
});
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="modal z-50 mx-auto w-screen font-sans text-base text-skin-text antialiased"
    >
      <div class="backdrop" @click="emit('close')" />
      <div class="shell relative overflow-hidden rounded-none md:rounded-3xl">
        <div v-if="$slots.header" class="pt-3 text-center">
          <slot name="header" />
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="border-t p-4 text-center">
          <slot name="footer" />
        </div>
        <BaseButtonIcon
          v-if="!hideClose"
          class="absolute right-3 top-[20px]"
          @click="emit('close')"
        >
          <i-ho-x />
        </BaseButtonIcon>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.modal {
  position: fixed;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  z-index: 40;

  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.4);
  }

  .shell {
    background-color: var(--bg-color);
    padding-left: 0 !important;
    padding-right: 0 !important;
    max-width: 440px;
    overflow-y: auto !important;
    max-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    z-index: 999;
    margin: 0 auto;
    width: 100%;

    @media (max-width: 767px) {
      border: 0;
      width: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      min-height: 100% !important;
      margin-bottom: 0 !important;

      .modal-body {
        max-height: 100% !important;
      }
    }

    .modal-body {
      max-height: v-bind(maxHeight);
      flex: auto;
      text-align: initial;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
}
</style>
