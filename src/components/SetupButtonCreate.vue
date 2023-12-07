<script setup lang="ts">
const emit = defineEmits(['create']);

defineProps<{
  creatingSpace: boolean;
}>();
</script>

<template>
  <TuneButton
    class="float-right"
    primary
    :loading="creatingSpace"
    @click="emit('create')"
  >
    {{ $t('createButton') }}
  </TuneButton>
</template>
