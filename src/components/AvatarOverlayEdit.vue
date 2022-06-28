<script setup lang="ts">
defineProps<{
  loading: boolean;
  avatar?: string;
}>();
</script>

<template>
  <transition name="fade">
    <div
      class="group absolute right-0 left-0 top-0 bottom-0 flex cursor-pointer items-center justify-center rounded-full transition-colors ease-out hover:bg-skin-border hover:opacity-80"
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
