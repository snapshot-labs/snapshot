<script setup lang="ts">
import { computed } from 'vue';
import { useCategories } from '@/composables';

const props = defineProps<{
  categories: string[];
}>();

const emit = defineEmits(['updateCategories']);

const { categories } = useCategories();

const categoriesItems = computed(() => {
  return categories.map((category, i) => ({ id: i + 1, name: category }));
});

const selectedCategories = computed({
  get() {
    return categoriesItems.value.filter(category =>
      props.categories.includes(category.name)
    );
  },
  set(value) {
    emit(
      'updateCategories',
      value.map(item => item.name)
    );
  }
});
</script>

<template>
  <BaseListboxMultiple
    v-model="selectedCategories"
    :placeholder="$t('settings.categories.select')"
    :label="$t(`settings.categories.label`)"
    :items="categoriesItems"
    :limit="2"
  >
    <template #item="{ item }">
      <span>{{ $t(`explore.categories.${item.name}`) }}</span>
    </template>
    <template #selected="{ selectedItems }">
      <span>
        {{
          selectedItems
            .map(item => $t(`explore.categories.${item.name}`))
            .join(', ')
        }}
      </span>
    </template>
  </BaseListboxMultiple>
</template>
