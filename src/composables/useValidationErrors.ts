import defaults from '@/locales/default.json';
import { useI18n } from '@/composables/useI18n';

export function useValidationErrors() {
  const { t } = useI18n();

  function validationErrorMessage(key, errors) {
    const defaultErrors = Object.keys(defaults.errors);

    if (errors === true) return '';
    else {
      const errorFound = errors.find(
        error =>
          defaultErrors.includes(error.keyword) &&
          error.instancePath.includes(key)
      );

      return errorFound
        ? t(`errors.${errorFound.keyword}`, [errorFound?.params.limit])
        : '';
    }
  }
  return { validationErrorMessage };
}
