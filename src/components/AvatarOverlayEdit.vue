<script setup lang="ts">
defineProps<{
  loading: boolean;
  avatar?: string;
  isViewOnly?: boolean;
}>();
</script>

<template>
  <transition name="fade">
    <div
      v-if="isViewOnly"
      class="absolute bottom-0 left-0 right-0 top-0 cursor-not-allowed"
    />
    <div
      v-else
      class="group absolute bottom-0 left-0 right-0 top-0 flex cursor-pointer items-center justify-center rounded-full transition-colors ease-out hover:bg-skin-border hover:opacity-80"
      :class="{
        'bg-skin-border opacity-80': loading
      }"
    >
      <div
        v-if="!loading"
        class="hidden transition-all ease-out group-hover:block"
      >
        {{ avatar ? $t('edit') : $t('upload') }}
      </div>
      <LoadingSpinner v-if="loading" />
    </div>
  </transition>
</template>
