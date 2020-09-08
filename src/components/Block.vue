<template>
  <div class="border-top border-bottom border-md rounded-0 rounded-md-2 mb-4">
    <h4 v-if="title" class="px-4 py-3 border-bottom d-block bg-gray-dark">
      {{ title }}
      <UiCounter v-if="counter" :counter="counter" class="ml-1" />
    </h4>
    <div :class="!slim && 'p-4'">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'counter', 'slim']
};
</script>
