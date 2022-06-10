/**
 * A composable hook that returns the validation errors of the form as
 * a string or returns an empty string if there are no errors.
 * TODO: Extent and use this hook to validate the settings form and all future forms.
 */

import defaults from '@/locales/default.json';
import { useI18n } from '@/composables/useI18n';

export function useValidationErrors() {
  const { t } = useI18n();

  function validationErrorMessage(key, errors) {
    const defaultErrors = Object.keys(defaults.errors);

    if (errors === true) return '';

    const errorFound = errors.find(
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

    if (errorFound?.instancePath.includes('website'))
      return t('errors.website');

    return errorFound
      ? t(`errors.${errorFound.keyword}`, [errorFound?.params.limit])
      : '';
  }

  return { validationErrorMessage };
}
