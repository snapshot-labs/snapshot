<script setup>
import { ref, computed, toRefs, watchEffect } from 'vue';
import { useString } from '@/composables/useString';

const props = defineProps({
  modelValue: Array,
  open: Boolean,
  categories: Array
});

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const { toFirstUpperCase, toFirstLowerCase } = useString();

const categories = computed(() => {
  return toFirstUpperCase([
    'protocol',
    'social',
    'investment',
    'grant',
    'service',
    'media',
    'creator',
    'collector'
  ]);
});

const checkedCategories = computed(() => props.categories);

const selectedCategories = ref([]);
watchEffect(() => {
  checkedCategories.value
    ? (selectedCategories.value = checkedCategories.value)
    : selectedCategories.value;
});

function hasCategory(category) {
  return selectedCategories.value.find(el =>
    el.includes(category.toLowerCase())
  );
}

const categoriesCounter = computed(() => {
  return selectedCategories.value ? selectedCategories.value.length : 0;
});

function selectCategoriesHandler(category) {
  if (hasCategory(category)) {
    selectedCategories.value = selectedCategories.value.filter(
      el => el !== category.toLowerCase()
    );
  } else if (categoriesCounter.value < 2) {
    selectedCategories.value.push(category.toLowerCase());
  }
}

function handleSubmit() {
  emit('add', toFirstLowerCase(selectedCategories.value));
  emit('close');
}

function handleClose() {
  checkedCategories.value
    ? (selectedCategories.value = checkedCategories.value)
    : (selectedCategories.value = []);
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="handleClose">
    <template v-slot:header>
      <h3>
        {{ $t('settings.selectCategories') }}
      </h3>
    </template>

    <div v-if="categories.length" class="m-4 flex flex-col justify-between">
      <div class="mb-4">
        {{ $t('create.categorie(s)') }}
      </div>
      <Block
        @click="selectCategoriesHandler(category)"
        v-for="(category, i) in categories"
        :key="i"
        :class="[
          {
            'hover:border-skin-link cursor-pointer':
              hasCategory(category) || categoriesCounter < 2,
            '!border-skin-link': hasCategory(category)
          },
          'relative font-bold link-color'
        ]"
      >
        {{ category }}
        <Icon
          v-if="hasCategory(category)"
          size="20"
          name="check1"
          class="absolute top-2 right-2"
        />
      </Block>
    </div>
    <template v-slot:footer>
      <div class="flex justify-around w-full">
        <UiButton @click="handleClose">
          <p class="px-6">{{ $t('cancel') }}</p>
        </UiButton>
        <UiButton @click="handleSubmit" :primary="!(categoriesCounter < 2)">
          <p class="px-6">{{ $t('confirm') }}</p>
        </UiButton>
      </div>
    </template>
    <NoResults class="mt-3" v-if="!categories.length" />
  </UiModal>
</template>
