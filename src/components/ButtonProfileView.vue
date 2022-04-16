<script setup lang="ts">
defineProps<{ address: string }>();
</script>

<template>
  <BaseButton
    @click.prevent="$router.push({ name: 'profileAbout', params: { address } })"
    class="w-full"
  >
    {{ $t('viewProfile') }}
  </BaseButton>
</template>
