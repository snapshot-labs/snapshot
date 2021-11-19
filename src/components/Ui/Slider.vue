<script setup>
import SwiperCore, { FreeMode, Pagination, Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "swiper/css/navigation"

// install Swiper modules
SwiperCore.use([ FreeMode, Pagination, Navigation ]);

const props = defineProps({
  items: Array,
  pagination: {
    type: [Object, Boolean],
    default: false
  },
  navigation: {
    type: [Object, Boolean],
    default: true
  },
  slidesPerView: {
    type: [Number, String],
    default: 'auto'
  },
  spaceBetween: {
    type: Number,
    default: 8
  },
  freeMode: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <swiper
    :slidesPerView="slidesPerView"
    :spaceBetween="spaceBetween"
    :freeMode="freeMode"
    :pagination="pagination"
    :navigation="navigation"
    class="mySwiper overflow-hidden"
  >
    <swiper-slide v-for="item in items">
      <slot :item="item"></slot>
    </swiper-slide>
  </swiper>
</template>

<style lang="scss">
.swiper {
  --swiper-navigation-size: 16px;
  --swiper-navigation-color: #666;
  
  .swiper-button-prev,
  .swiper-button-next {
    top: 0;
    height: 100%;
    width: 15%;
    margin-top: 0;
    transition: opacity 0.5s ease;
    background: rgba(255, 255, 255, 0);
    align-items: center;
    &.swiper-button-disabled {
      opacity: 0;
      cursor: default;
      pointer-events: none;
    }
    &:after {
      margin: 10px;
      top: 50%;
      width: calc(var(--swiper-navigation-size) / 44 * 27);
      height: var(--swiper-navigation-size);
      z-index: 10;
      cursor: pointer;
      color: var(--swiper-navigation-color, var(--swiper-theme-color));
      // some heave dropshadow to make the arrows stand out
      filter: drop-shadow(0 0 5px #fff)
              drop-shadow(0 0 5px #fff)
              drop-shadow(0 0 5px #fff)
              drop-shadow(0 0 10px #fff)
              drop-shadow(0 0 10px #fff)
              drop-shadow(0 0 10px #fff);
    }
  }
  .swiper-button-prev,
  .swiper-rtl .swiper-button-next {
    left: 0;
    background: linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
    justify-content: start;
  }
  .swiper-button-next,
  .swiper-rtl .swiper-button-prev {
    right: 0;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
    justify-content: end;
  }

  .swiper-slide {
    width: auto;
  }
}
</style>