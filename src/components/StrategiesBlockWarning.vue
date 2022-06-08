<script setup lang="ts">
defineProps<{
  error?: string;
}>();
</script>

<template>
  <BaseBlock v-if="error" class="mb-4 !border-red">
    <BaseIcon name="warning" class="mr-2 !text-red" />
    <span class="!text-red"> {{ error }}&nbsp;</span>
    <BaseLink link="https://docs.snapshot.org/spaces/create#strategies">
      {{ $t('learnMore') }}
    </BaseLink>
  </BaseBlock>
</template>
