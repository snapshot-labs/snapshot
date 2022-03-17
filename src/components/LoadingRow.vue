<script setup lang="ts">
defineProps<{ block?: boolean }>();
</script>

<template>
  <BaseLoading :block="block">
    <div class="px-4 py-4 block">
      <div
        class="rounded-md lazy-loading mb-2"
        style="width: 60%; height: 28px"
      />
      <div class="rounded-md lazy-loading" style="width: 50%; height: 28px" />
    </div>
  </BaseLoading>
</template>
