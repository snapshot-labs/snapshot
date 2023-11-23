<script setup lang="ts">
const { theme } = useSkin();

defineProps<{
  isOsnapEnabled: boolean;
}>();

// handling some theming here locally so as not to interfere with the global style.scss file
const activeStyles = computed(() => {
  return theme.value === 'light'
    ? {
        div: 'bg-[hsla(122,100%,45%,0.13)] text-[hsla(122,100%,21%,1)]',
        span: 'bg-[hsla(122,100%,45%,1)]'
      }
    : {
        div: 'bg-[hsla(122,100%,45%,0.13)] text-[hsla(122,100%,45%,1)]',
        span: 'bg-[hsla(122,100%,45%,1)]'
      };
});

const inactiveStyles = computed(() => {
  return theme.value === 'light'
    ? {
        div: 'bg-[hsla(0,0%,0%,1)] text-skin-bg',
        span: 'bg-skin-bg opacity-30'
      }
    : {
        div: 'bg-[hsla(0,0%,100%,1)] text-skin-bg',
        span: 'bg-skin-bg opacity-30'
      };
});
</script>

<template>
  <button
    v-if="isOsnapEnabled"
    :class="[
      'flex items-center gap-2 rounded-full px-3 py-2',
      activeStyles.div
    ]"
  >
    <span
      :class="['block h-[6px] w-[6px] rounded-full', activeStyles.span]"
    />oSnap activated
  </button>
  <button
    v-else
    :class="[
      'flex items-center gap-2 rounded-full px-3 py-2',
      inactiveStyles.div
    ]"
  >
    <span
      :class="['block h-[6px] w-[6px] rounded-full', inactiveStyles.span]"
    />
    Activate oSnap
  </button>
</template>
