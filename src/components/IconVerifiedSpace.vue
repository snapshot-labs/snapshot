<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: string;
  }>(),
  {
    size: '20'
  }
);
</script>

<template>
  <div class="cursor-help">
    <BaseIcon
      v-tippy="{
        content: $t('verifiedSpace'),
        placement: 'right'
      }"
      name="check"
      :size="size"
    />
  </div>
</template>
