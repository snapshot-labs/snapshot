<script setup>
import { ref, computed, toRefs, watchEffect } from 'vue';
import { useCategories } from '@/composables/useCategories';

const props = defineProps({
  open: Boolean,
  categories: Array
});

const { categories } = useCategories();

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const checkedCategories = computed(() => props.categories);

const selectedCategories = ref([]);

watchEffect(() => {
  selectedCategories.value = checkedCategories.value;
});

function hasCategory(category) {
  return selectedCategories.value.find(el => el.includes(category));
}

function selectCategoriesHandler(category) {
  if (hasCategory(category)) {
    selectedCategories.value = selectedCategories.value.filter(
      el => !el.includes(category)
    );
  } else if (selectedCategories.value.length < 2) {
    selectedCategories.value = [...selectedCategories.value, category];
  }
}

function handleSubmit() {
  emit('add', selectedCategories.value);
  emit('close');
}

function handleClose() {
  selectedCategories.value = checkedCategories.value;
  emit('close');
}
</script>

<template>
  <BaseModal :open="open" @close="handleClose">
    <template v-slot:header>
      <h3>
        {{ $t('settings.selectCategories') }}
      </h3>
    </template>

    <div class="my-4 mx-0 flex flex-col justify-between md:mx-4">
      <div class="ml-4 mb-4 md:ml-0">
        {{ $t('create.categorie(s)') }}
      </div>
      <div class="space-y-3">
        <BaseBlock
          @click="selectCategoriesHandler(category)"
          v-for="(category, i) in categories"
          :key="i"
          :class="[
            {
              'cursor-pointer hover:border-skin-text':
                hasCategory(category) || selectedCategories.length < 2,
              'opacity-50':
                !hasCategory(category) && selectedCategories.length === 2,
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
        </BaseBlock>
      </div>
    </div>
    <template v-slot:footer>
      <div class="float-left w-2/4 pr-2">
        <BaseButton @click="handleClose" type="button" class="w-full">
          {{ $t('cancel') }}
        </BaseButton>
      </div>
      <div class="float-left w-2/4 pl-2">
        <BaseButton
          @click="handleSubmit"
          :disabled="!selectedCategories.length"
          type="submit"
          class="w-full"
          primary
        >
          {{ $t('confirm') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
