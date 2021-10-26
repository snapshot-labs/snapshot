<script setup>
import { ref, computed, toRefs, watchEffect } from 'vue';

const props = defineProps({
  modelValue: Array,
  open: Boolean,
  category: Array
});

const emit = defineEmits(['update:modelValue', 'close']);

const { open } = toRefs(props);
const searchInput = ref('');

const categories = ref(['Service', 'Social', 'Development']);

const checkedCategories = computed(() => props.modelValue);

const selectedCategories = ref([]);
watchEffect(() => {
  checkedCategories.value
    ? (selectedCategories.value = checkedCategories.value)
    : selectedCategories.value;
});

const filteredCategories = computed(() =>
  categories.value.filter(el =>
    el.toLowerCase().includes(searchInput.value.toLowerCase())
  )
);

function hasCategory(category) {
  return checkedCategories.value
    ? selectedCategories.value.find(el => el.includes(category))
    : false;
}

const categoriesCounter = computed(() => {
  return selectedCategories.value ? selectedCategories.value.length : 0;
});

function selectCategoriesHandler(category) {
  if (hasCategory(category)) {
    selectedCategories.value = selectedCategories.value.filter(
      el => el !== category
    );
  } else {
    if (categoriesCounter.value < 2) {
      const sel = ref([]);
      selectedCategories.value.push(category);
    }
  }
  emit('update:modelValue', selectedCategories.value);
}

function handleSubmit() {
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="handleSubmit">
    <template v-slot:header>
      <h3>
        {{ $t('settings.selectCategories') }}
      </h3>
    </template>
    <Search
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div
      v-if="filteredCategories.length"
      class="m-4 flex flex-col justify-between"
    >
      <Block
        @click="selectCategoriesHandler(category)"
        v-for="(category, i) in filteredCategories"
        :key="i"
        :class="[
          { 'bg-gray-100': hasCategory(category) },
          'cursor-pointer text-center'
        ]"
      >
        {{ category }}
        <Icon v-if="hasCategory(category)" size="24" name="check" />
      </Block>
    </div>
    <NoResults class="mt-3" v-if="!filteredCategories.length" />
  </UiModal>
</template>
