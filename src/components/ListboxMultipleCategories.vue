<script setup lang="ts">
import { computed } from 'vue';
import { useCategories } from '@/composables';

const props = defineProps<{
  categories: string[];
}>();

const emit = defineEmits(['updateCategories']);

const { categories } = useCategories();

const selectedCategories = computed({
  get() {
    return categories.filter(category => props.categories.includes(category));
  },
  set(value) {
    emit(
      'updateCategories',
      value.map(item => item)
    );
  }
});
</script>

<template>
  <BaseListboxMultiple
    v-model="selectedCategories"
    :placeholder="$t('settings.categories.select')"
    :label="$t(`settings.categories.label`)"
    :items="categories"
    :limit="2"
  >
    <template #item="{ item }">
      <span>{{ $t(`explore.categories.${item}`) }}</span>
    </template>
    <template #selected="{ selectedItems }">
      <span>
        {{
          selectedItems.map(item => $t(`explore.categories.${item}`)).join(', ')
        }}
      </span>
    </template>
  </BaseListboxMultiple>
</template>
