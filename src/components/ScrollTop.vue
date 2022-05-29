<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const show = ref(false);

const scrollHandler = function () {
  let scrollTop =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop;

  show.value = scrollTop >= 2000;
};

onMounted(() => {
  window.addEventListener('scroll', scrollHandler, true);
});

onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler, true);
});

const scrollTop = function () {
  window.scrollTo(0, 0);
};
</script>

<template>
  <div
    v-if="show"
    class="btn-scroll-top fixed z-50 border w-[44px] h-[44px] rounded-full flex justify-center items-center cursor-pointer hover:border-skin-text select-none"
    @click="scrollTop"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1"
      stroke="var(--link-color)"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.btn-scroll-top {
  right: 30px !important;
  bottom: 30px !important;
}

@media screen and (max-width: 544px) {
  .btn-scroll-top {
    right: 15px !important;
    bottom: 24px !important;
  }
}
</style>
