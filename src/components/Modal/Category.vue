<script setup>
import { ref, computed, toRefs, watchEffect } from 'vue';

const props = defineProps({
  modelValue: Array,
  open: Boolean,
  category: Array
});

const emit = defineEmits(['update:modelValue', 'close']);

const { open } = toRefs(props);

const categories = ref([
  'protocol',
  'social',
  'investment',
  'grant',
  'service',
  'media',
  'creator',
  'collector'
]);

const checkedCategories = computed(() => props.modelValue);

const selectedCategories = ref([]);
watchEffect(() => {
  checkedCategories.value
    ? (selectedCategories.value = checkedCategories.value)
    : selectedCategories.value;
});

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
      <div class="relative">
        <h3>
          {{ $t('settings.selectCategories') }}
        </h3>
        <div
          v-if="!(categoriesCounter < 2)"
          class="link-color absolute inset-x-0 -bottom-4"
        >
          {{ $t('errors.maxCategories') }}
        </div>
      </div>
    </template>

    <div v-if="categories.length" class="m-4 flex flex-col justify-between">
      <Block
        @click="selectCategoriesHandler(category)"
        v-for="(category, i) in categories"
        :key="i"
        :class="[
          {
            'hover:border-skin-link cursor-pointer':
              !hasCategory(category) && categoriesCounter < 2,
            '!border-skin-link': hasCategory(category)
          },
          'text-center relative'
        ]"
      >
        {{ category }}
        <Icon
          v-if="hasCategory(category)"
          size="16"
          name="check"
          class="absolute top-2 right-2"
        />
      </Block>
    </div>
    <template v-slot:footer>
      <UiButton @click="handleSubmit">
        {{ $t('confirm') }}
      </UiButton>
    </template>
    <NoResults class="mt-3" v-if="!categories.length" />
  </UiModal>
</template>
