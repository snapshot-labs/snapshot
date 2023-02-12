<script setup lang="ts">
defineProps<{
  name?: string;
}>();
</script>

<template>
  <button>
    <div
      class="inline-flex items-center gap-1 text-skin-text hover:text-skin-link"
    >
      <i-ho-arrow-sm-left />
      {{ name ? name : $t('back') }}
    </div>
  </button>
</template>
