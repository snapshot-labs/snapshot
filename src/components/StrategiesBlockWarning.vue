<script setup lang="ts">
defineProps<{
  error?: string;
}>();
</script>

<template>
  <BaseBlock class="!border-red mb-4" v-if="error">
    <BaseIcon name="warning" class="mr-2 !text-red" />
    <span class="!text-red"> {{ error }}&nbsp;</span>
    <BaseLink link="https://docs.snapshot.org/spaces/create#strategies">
      {{ $t('learnMore') }}
    </BaseLink>
  </BaseBlock>
</template>
