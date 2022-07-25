/**
 * A composable hook that returns the validation errors of the form as
 * a string or returns an empty string if there are no errors.
 * TODO: Extent and use this hook to validate the settings form and all future forms.
 */

import { ref, computed } from 'vue';
import defaults from '@/locales/default.json';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import { watchDebounced } from '@vueuse/core';
import { useI18n } from '@/composables';

export function useFormValidation(schema, form) {
  const { t } = useI18n();

  const validationResult = ref<ReturnType<typeof validateSchema>>(null);
  const validate = () => {
    validationResult.value = validateSchema(schema, form.value);
  };

  watchDebounced(form, validate, {
    debounce: 200,
    maxWait: 1000,
    deep: true,
    immediate: true
  });

  const isValid = computed(() => validationResult.value === true);

  function getValidationMessage(key: string): string {
    const defaultErrors = Object.keys(defaults.errors);

    if (validationResult.value === true || !validationResult.value) return '';

    const errorFound = validationResult.value.find(
      error =>
        (defaultErrors.includes(error.keyword) &&
          error.params.missingProperty === key) ||
        (defaultErrors.includes(error.keyword) &&
          error.instancePath.includes(key))
    );

    // Custom error messages for address fields (needed because minLength validation
    // on the strategies schema would always show field required)
    if (
      errorFound &&
      errorFound?.instancePath.includes('address') &&
      errorFound?.keyword.includes('minLength')
    )
      return t('errors.invalidAddress');

    if (errorFound?.instancePath.includes('strategies'))
      return t('errors.minStrategy');

    if (
      errorFound?.instancePath.includes('website') ||
      errorFound?.instancePath.includes('terms') ||
      errorFound?.instancePath.includes('discussion')
    )
      return t('errors.website');

    return errorFound
      ? t(`errors.${errorFound.keyword}`, [errorFound?.params.limit])
      : '';
  }

  return { getValidationMessage, validationResult, isValid };
}
