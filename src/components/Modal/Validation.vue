<script setup>
import { ref, computed, toRefs, watch } from 'vue';
import { useValidationsFilter } from '@/composables/useValidationsFilter';

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

const { filterValidations, getValidationsSpacesCount, loadingValidations } =
  useValidationsFilter();
const validations = computed(() => filterValidations(searchInput.value));

watch(
  () => props.open,
  () => {
    if (props.open) getValidationsSpacesCount();
  }
);

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
    <BaseSearch
      v-if="!input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      modal
    />
    <div class="my-4 mx-0 md:mx-4 min-h-[339px]">
      <div v-if="input.name" class="p-4 mb-4 border rounded-md text-skin-link">
        <h4 v-text="input.name" class="mb-3 text-center" />

        <UiButton class="block w-full overflow-x-auto" style="height: auto">
          <TextareaJson
            v-model="input.params"
            v-model:is-valid="isValid"
            :placeholder="$t('settings.validationParameters')"
            class="input text-left"
          />
        </UiButton>
      </div>
      <div v-if="!input.name">
        <RowLoadingBlock v-if="loadingValidations" />
        <div v-else class="space-y-3">
          <BlockValidation
            :validation="valId"
            v-for="valId in validations"
            :key="valId"
            @click="select(valId)"
          />

          <NoResults v-if="Object.keys(validations).length < 1" />
        </div>
      </div>
    </div>
    <template v-if="input.name" v-slot:footer>
      <UiButton
        @click="handleSubmit"
        :disabled="!isValid"
        class="w-full"
        primary
      >
        {{ validation.name ? $t('save') : $t('add') }}
      </UiButton>
    </template>
  </UiModal>
</template>
