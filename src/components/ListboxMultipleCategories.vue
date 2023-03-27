<script setup lang="ts">
import { useCategories } from '@/composables';

const props = defineProps<{
  categories: string[];
  isDisabled?: boolean;
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
    :items="
      categories.map(category => ({
        value: category,
        title: $t(`explore.categories.${category}`)
      }))
    "
    :limit="2"
    :is-disabled="isDisabled"
  />
</template>
