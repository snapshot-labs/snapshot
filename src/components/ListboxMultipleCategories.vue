<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useCategories } from '@/composables/useCategories';

const props = defineProps<{
  categories: string[];
}>();

const emit = defineEmits(['updateCategories']);

const { categories } = useCategories();

const categoriesItems = computed(() => {
  return categories.map((category, i) => ({ id: i + 1, name: category }));
});

const selectedCategories = ref<{ id: number; name: string }[]>([]);

onMounted(() => {
  // add props.categories to selectedCategories with correct id from categoriesItems
  props.categories.forEach(category => {
    const categoryItem = categoriesItems.value.find(
      item => item.name === category
    );
    if (categoryItem) {
      selectedCategories.value.push(categoryItem);
    }
  });
});

watch(selectedCategories, () => {
  emit(
    'updateCategories',
    selectedCategories.value.map(item => item.name)
  );
});
</script>

<template>
  <BaseListboxMultiple
    v-model="selectedCategories"
    :placeholder="$t('spaceProfile.categories.select')"
    :label="$t(`spaceProfile.categories.label`)"
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
