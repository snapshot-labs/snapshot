<script setup lang="ts">
const emit = defineEmits(['create']);

defineProps<{
  creatingSpace: boolean;
}>();
</script>

<template>
  <BaseButton
    class="float-right"
    primary
    :loading="creatingSpace"
    @click="emit('create')"
  >
    {{ $t('createButton') }}
  </BaseButton>
</template>
