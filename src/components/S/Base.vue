<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useValidationErrors } from '@/composables/useValidationErrors';

const props = defineProps<{
  definition: any;
  input?: boolean | number | string | string[];
}>();

const showError = ref(false);

watch(
  () => props.input,
  () => {
    showError.value = true;
  }
);

const { getValidationErrors } = useValidationErrors();

const error = computed(() => {
  if (showError.value) {
    return getValidationErrors(props.definition, props.input);
  }
  return '';
});
</script>

<template>
  <div>
    <label v-if="definition.title" v-text="definition.title" class="s-label" />
    <div>
      <slot />
      <div
        :class="[
          's-error',
          !!error ? '-mt-[21px] opacity-100' : '-mt-[52px] opacity-0'
        ]"
      >
        <Icon
          name="warning"
          class="text-red dark:text-white dark:text-opacity-90 mr-2"
        />
        {{ error || 'Not valid' }}
      </div>
    </div>
    <span v-if="definition.description" v-text="definition.description" />
  </div>
</template>
