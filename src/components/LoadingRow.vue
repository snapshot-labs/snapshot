<script setup lang="ts">
defineProps<{ block?: boolean }>();
</script>

<template>
  <BaseLoading :block="block">
    <div class="block px-4 py-4">
      <div
        class="lazy-loading mb-2 rounded-md"
        style="width: 60%; height: 28px"
      />
      <div class="lazy-loading rounded-md" style="width: 50%; height: 28px" />
    </div>
  </BaseLoading>
</template>
