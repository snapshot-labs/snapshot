<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';

defineProps({
  open: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'update:modelValue']);

const searchInput = ref('');
const { filteredSkins } = useSearchFilters();
const skins = computed(() => filteredSkins(searchInput.value));

function select(key) {
  emit('update:modelValue', key);
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('skins') }}</h3>
    </template>
    <Search
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div class="mt-4 mx-0 mx-md-4">
      <a v-for="skin in skins" :key="skin.key" @click="select(skin.key)">
        <BlockSkin :skin="skin" />
      </a>
      <NoResults v-if="Object.keys(skins).length < 1" />
    </div>
  </UiModal>
</template>
