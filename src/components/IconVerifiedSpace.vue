<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: string;
    turbo: boolean;
  }>(),
  {
    size: '20',
    turbo: false
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
      :class="[{ 'text-[#ffb503]': turbo }]"
    />
  </div>
</template>
