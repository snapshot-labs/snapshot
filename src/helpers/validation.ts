import snapshot from '@snapshot-labs/snapshot.js';

const { env } = useApp();

function getErrorMessage(errorObject): string {
  if (!errorObject.message) return 'Invalid field.';

  if (errorObject.keyword === 'format') {
    switch (errorObject.params.format) {
      case 'address':
        return 'Must be a valid address.';
      case 'ethValue':
        return 'Must be a number.';
      case 'customUrl':
        return 'Must be a valid URL.';
      case 'uri':
        return 'Must be a valid URL.';
      default:
        return 'Invalid format.';
    }
  }

  return `${errorObject.message
    .charAt(0)
    .toLocaleUpperCase()}${errorObject.message.slice(1)}.`;
}
export function validateForm(
  schema: Record<string, any>,
  form: Record<string, any>,
  options = {
    spaceType: 'default'
  }
): Record<string, any> {
  const valid = snapshot.utils.validateSchema(schema, form, {
    spaceType: options.spaceType || 'default',
    snapshotEnv: env === 'production' ? 'mainnet' : 'default'
  });
  if (!Array.isArray(valid)) return {};
  return transformAjvErrors(valid);
}

interface ValidationErrorOutput {
  [key: string]: ValidationErrorOutput | string;
}
function transformAjvErrors(errors): ValidationErrorOutput {
  errors = errors.map(error => {
    if (error.instancePath) return error;
    const propertyName = error.params.missingProperty;
    if (!propertyName) return error;
    const path = `/${propertyName}`;
    return {
      ...error,
      instancePath: path
    };
  });

  return errors.reduce((output: ValidationErrorOutput, error) => {
    const path: string[] = extractPathFromError(error);

    // Skip the current error if the path is empty
    if (path.length === 0) {
      return output;
    }

    const targetObject: ValidationErrorOutput = findOrCreateNestedObject(
      output,
      path
    );

    targetObject[path[path.length - 1]] = getErrorMessage(error);
    return output;
  }, {});
}

function extractPathFromError(error): string[] {
  if (!error.instancePath) {
    return [];
  }
  return error.instancePath.split('/').slice(1);
}

function findOrCreateNestedObject(
  output: ValidationErrorOutput,
  path: string[]
): ValidationErrorOutput {
  const parentPath: string[] = path.slice(0, path.length - 1);
  const parentObject: ValidationErrorOutput = parentPath.reduce(
    (current: ValidationErrorOutput, subpath: string) => {
      if (!current[subpath]) {
        current[subpath] = {} as ValidationErrorOutput;
      }
      return current[subpath] as ValidationErrorOutput;
    },
    output
  );

  return parentObject;
}
