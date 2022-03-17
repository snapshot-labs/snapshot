<script setup lang="ts">
defineProps({
  fillWhite: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <BaseLoading>
    <span class="loading">
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 50 50"
        >
          <path
            :class="{ '!fill-white': fillWhite }"
            d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </span>
    </span>
  </BaseLoading>
</template>

<style lang="scss">
.loading {
  span {
    width: 100%;
  }

  &.big {
    svg {
      width: 34px;
      height: 34px;
    }
  }

  svg {
    display: inline-block;
    vertical-align: middle;
    width: 20px;
    height: 20px;

    path {
      fill: var(--link-color);
    }
  }

  &.overlay {
    position: fixed;
    text-align: center;
    display: flex;
    align-items: center;
    align-content: center;
    top: 0;
    bottom: 80px;
    left: 0;
    right: 0;
    width: 100%;
  }
}
</style>
