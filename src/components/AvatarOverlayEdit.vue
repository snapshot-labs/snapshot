<script setup lang="ts">
defineProps<{
  loading: boolean;
  avatar: string;
}>();
</script>

<template>
  <transition name="fade">
    <div
      class="absolute right-0 left-0 top-0 bottom-0 cursor-pointer rounded-full group hover:opacity-80 hover:bg-skin-border transition-colors ease-out flex items-center justify-center"
      :class="{
        'opacity-80 bg-skin-border': loading
      }"
    >
      <div
        v-if="!loading"
        class="group-hover:block hidden transition-all ease-out"
      >
        {{ avatar ? $t('edit') : $t('upload') }}
      </div>
      <LoadingSpinner v-if="loading" />
    </div>
  </transition>
</template>
