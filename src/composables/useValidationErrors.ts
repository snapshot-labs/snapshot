import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import defaults from '@/locales/default';
import { useI18n } from '@/composables/useI18n';

export function useValidationErrors() {
  const { t } = useI18n();

  function getValidationErrors(definition, inputValue) {
    const validate: any = validateSchema(definition, inputValue);
    const errors = Object.keys(defaults.errors);

    if (validate === true) return '';
    else {
      const errorFound = validate.find(error => errors.includes(error.keyword));

      return t(`errors.${errorFound.keyword}`, [errorFound?.params.limit]);
    }
  }
  return { getValidationErrors };
}
