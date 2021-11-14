<script setup>
import { ref, computed, toRefs, watchEffect } from 'vue';

const props = defineProps({
  open: Boolean,
  categories: Array
});

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const categories = computed(() => {
  return [
    'protocol',
    'social',
    'investment',
    'grant',
    'service',
    'media',
    'creator',
    'collector'
  ];
});

const checkedCategories = computed(() => props.categories);

const selectedCategories = ref([]);
watchEffect(() => {
  checkedCategories.value
    ? (selectedCategories.value = checkedCategories.value)
    : selectedCategories.value;
});

function hasCategory(category) {
  return selectedCategories.value.find(el => el.includes(category));
}

const categoriesCounter = computed(() => {
  return selectedCategories.value ? selectedCategories.value.length : 0;
});

function selectCategoriesHandler(category) {
  if (hasCategory(category)) {
    selectedCategories.value = selectedCategories.value.filter(
      el => el !== category
    );
  } else if (categoriesCounter.value < 2) {
    selectedCategories.value.push(category);
  }
}

function handleSubmit() {
  emit('add', selectedCategories.value);
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

    <div class="mt-4 mx-0 md:mx-4 flex flex-col justify-between">
      <div class="ml-4 md:ml-0 mb-4">
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
          'relative capitalize'
        ]"
      >
        <h3 v-text="category" />
        <i
          v-if="hasCategory(category)"
          class="iconfont iconcheck1 absolute top-2 right-2 text-lg"
        />
      </Block>
    </div>
    <template v-slot:footer>
      <div class="w-2/4 float-left pr-2">
        <UiButton @click="handleClose" type="button" class="w-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="w-2/4 float-left pl-2">
        <UiButton
          @click="handleSubmit"
          :disabled="!selectedCategories.length"
          type="submit"
          class="w-full"
          primary
        >
          {{ $t('confirm') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
