<script>
import { watch, toRefs } from 'vue';
import { useModal } from '@/composables/useModal';

export default {
  props: {
    open: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const { open } = toRefs(props);
    const { modalOpen } = useModal();
    watch(open, (val, prev) => {
      if (val !== prev) modalOpen.value = !modalOpen.value;
    });
  }
};
</script>

<template>
  <div v-if="open" class="modal mx-auto">
    <div class="backdrop" @click="$emit('close')" />
    <div
      class="
        shell
        overflow-hidden
        anim-scale-in
        position-relative
        rounded-0 rounded-md-2
      "
    >
      <div v-if="$slots.header" class="border-bottom pt-4 pb-3 text-center">
        <slot name="header" />
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="border-top p-4 text-center">
        <slot name="footer" />
      </div>
      <a
        @click="$emit('close')"
        class="position-absolute right-0 top-1 p-4 text-gray"
      >
        <Icon name="close" />
      </a>
    </div>
  </div>
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
    border: 1px solid var(--border-color);
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
      max-height: 420px;
      flex: auto;
      text-align: initial;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
}
</style>
