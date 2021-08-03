<script setup>
import { ref, computed, toRefs, watch, defineProps, defineEmits } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { clone } from '@/helpers/utils';

const defaultParams = {};

const props = defineProps({ open: Boolean, validation: Object });

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const searchInput = ref('');
const input = ref({
  name: '',
  params: JSON.stringify(defaultParams, null, 2)
});

const { filteredValidations } = useSearchFilters();
const validations = computed(() => filteredValidations(searchInput.value));

const isValid = computed(() => {
  try {
    const params = JSON.parse(input.value.params);
    return !!params;
  } catch (e) {
    return false;
  }
});

function select(n) {
  input.value.name = n;
}

function handleSubmit() {
  const validation = clone(input.value);
  validation.params = JSON.parse(validation.params);
  emit('add', validation);
  emit('close');
}

watch(open, () => {
  input.value.name = '';
  if (props.validation?.params) {
    input.value.params = JSON.stringify(props.validation.params, null, 2);
  } else {
    input.value = {
      name: '',
      params: JSON.stringify(defaultParams, null, 2)
    };
  }
});
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>
        {{
          input.name
            ? $t('settings.editValidation')
            : $t('settings.selectValidation')
        }}
      </h3>
    </template>
    <Search
      v-if="!input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div class="mt-4 mx-0 mx-md-4">
      <div v-if="input.name" class="p-4 mb-4 border rounded-2 link-color">
        <UiButton
          class="d-block width-full mb-3 overflow-x-auto"
          style="height: auto"
        >
          <TextareaAutosize
            v-model="input.params"
            :placeholder="$t('settings.validationParameters')"
            class="input text-left"
            style="width: 560px"
          />
        </UiButton>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          class="button--submit width-full"
        >
          {{ validation.name ? $t('save') : $t('add') }}
        </UiButton>
      </div>
      <div v-if="!input.name">
        <a
          v-for="validation in validations"
          :key="validation.name"
          @click="select(validation.name)"
        >
          <BlockValidation :validation="validation" />
        </a>
        <NoResults v-if="Object.keys(validations).length < 1" />
      </div>
    </div>
  </UiModal>
</template>
