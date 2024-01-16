<script setup lang="ts">
const emit = defineEmits(['close']);
</script>

<template>
  <div class="m-4 flex flex-col gap-4 text-center">
    {{ $t('emailResend.description') }}

    <TuneButton class="w-full" primary @click="emit('close')">
      {{ $t('close') }}
    </TuneButton>
  </div>
</template>
