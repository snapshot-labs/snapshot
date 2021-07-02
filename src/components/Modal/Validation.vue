<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>
        {{
          validation.name
            ? $t('settings.editValidation')
            : $t('settings.selectValidation')
        }}
      </h3>
    </template>
    <Search
      v-if="!validation.name && !input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div class="mt-4 mx-0 mx-md-4">
      <div v-if="input.name" class="p-4 mb-4 border rounded-2 text-white">
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

<script>
import { ref, computed } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { clone } from '@/helpers/utils';

const defaultParams = {};

export default {
  setup() {
    const searchInput = ref('');
    const { filteredValidations } = useSearchFilters();
    const validations = computed(() => filteredValidations(searchInput.value));

    return { searchInput, filteredValidations, validations };
  },
  props: ['open', 'validation'],
  emits: ['add', 'close'],
  data() {
    return {
      input: {
        name: '',
        params: JSON.stringify(defaultParams, null, 2)
      }
    };
  },
  watch: {
    open() {
      if (this.validation?.name) {
        const validation = this.validation;
        validation.params = JSON.stringify(validation.params, null, 2);
        this.input = this.validation;
      } else {
        this.input = {
          name: '',
          params: JSON.stringify(defaultParams, null, 2)
        };
      }
    }
  },
  computed: {
    isValid() {
      try {
        const params = JSON.parse(this.input.params);
        return !!params;
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    select(n) {
      this.input.name = n;
    },
    handleSubmit() {
      const validation = clone(this.input);
      validation.params = JSON.parse(validation.params);
      this.$emit('add', validation);
      this.$emit('close');
    }
  }
};
</script>
