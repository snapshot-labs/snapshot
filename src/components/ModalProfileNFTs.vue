<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

defineEmits(['close']);

const nfts = ref([]);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('nfts') }}</h3>
      </div>
    </template>
    <div class="space-y-3 py-4 md:px-4">
      <div v-for="n in nfts" :key="n">
        <!-- <ModalSpacesListItem :space="space" /> -->
      </div>
    </div>
  </BaseModal>
</template>
