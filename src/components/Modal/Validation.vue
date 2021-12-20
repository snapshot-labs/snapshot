<script setup>
import { ref, computed, toRefs, watch } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';

const defaultParams = {};

const props = defineProps({ open: Boolean, validation: Object });

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const searchInput = ref('');
const isValid = ref(true);
const input = ref({
  name: '',
  params: defaultParams
});

const { filteredValidations } = useSearchFilters();
const validations = computed(() => filteredValidations(searchInput.value));

function select(n) {
  input.value.name = n;
}

function handleSubmit() {
  emit('add', input.value);
  emit('close');
}

watch(open, () => {
  input.value.name = '';
  if (props.validation?.params) {
    input.value.params = props.validation.params;
  } else {
    input.value = {
      name: '',
      params: defaultParams
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
    <div class="mt-4 mx-0 md:mx-4">
      <div v-if="input.name" class="p-4 mb-4 border rounded-md link-color">
        <UiButton
          class="block w-full mb-3 overflow-x-auto"
          style="height: auto"
        >
          <TextareaJson
            v-model="input.params"
            v-model:is-valid="isValid"
            :placeholder="$t('settings.validationParameters')"
            class="input text-left"
            style="width: 560px"
          />
        </UiButton>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          class="w-full"
          primary
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
