<script setup lang="ts">
import { computed } from 'vue';
import verified from '@/../snapshot-spaces/spaces/verified.json';

const props = withDefaults(
  defineProps<{
    spaceId: string;
    size?: string;
  }>(),
  {
    size: '20'
  }
);

const isVerified = computed(() => verified[props.spaceId] || 0);
</script>

<template>
  <div>
    <BaseIcon
      v-if="isVerified === 1"
      v-tippy="{
        content: $t('verifiedSpace'),
        placement: 'right'
      }"
      name="check"
      :size="size"
    />
    <BaseIcon v-if="isVerified === -1" name="warning" size="20" />
  </div>
</template>
