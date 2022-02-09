<script setup>
defineProps({
  title: String,
  counter: Number,
  slim: Boolean,
  icon: String,
  iconClass: String,
  loading: Boolean
});
</script>

<template>
  <div
    class="border-t border-b md:border rounded-none md:rounded-lg mb-4 bg-skin-block-bg"
  >
    <h4
      v-if="title"
      class="px-4 pt-3 border-b block bg-skin-header-bg rounded-t-none md:rounded-t-lg"
      style="padding-bottom: 12px"
    >
      {{ title }}
      <UiCounter v-if="counter" :counter="counter" class="ml-1 inline-block" />
      <Icon
        v-if="icon"
        :name="icon"
        size="22"
        :class="['float-right pt-1', iconClass]"
      />
    </h4>
    <div v-if="loading" class="block px-4 py-4">
      <div
        class="bg-skin-text rounded-md animate-pulse-fast mb-2"
        style="width: 80%; height: 20px"
      />
      <div
        class="bg-skin-text rounded-md animate-pulse-fast"
        style="width: 50%; height: 20px"
      />
    </div>
    <div v-else :class="!slim && 'p-4'" class="leading-6">
      <slot />
    </div>
  </div>
</template>
