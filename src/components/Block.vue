<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  title: String,
  counter: Number,
  slim: Boolean,
  icon: String,
  loading: Boolean
});

defineEmits(['submit']);
</script>

<template>
  <div
    class="
      border-top border-bottom border-md
      rounded-0 rounded-md-2
      mb-4
      block-bg
    "
  >
    <h4
      v-if="title"
      class="
        px-4
        pt-3
        border-bottom
        d-block
        header-bg
        rounded-top-0 rounded-md-top-2
      "
      style="padding-bottom: 12px"
    >
      {{ title }}
      <UiCounter v-if="counter" :counter="counter" class="ml-1" />
      <a
        v-if="icon"
        @click="$emit('submit')"
        class="float-right text-color"
        style="padding-top: 2px"
      >
        <Icon :name="icon" size="22" />
      </a>
    </h4>
    <div v-if="loading" class="d-block px-4 py-4">
      <div
        class="bg-gray-9 rounded-1 anim-pulse mb-2"
        style="width: 80%; height: 20px"
      />
      <div
        class="bg-gray-9 rounded-1 anim-pulse"
        style="width: 50%; height: 20px"
      />
    </div>
    <div v-else :class="!slim && 'p-4'">
      <slot />
    </div>
  </div>
</template>
