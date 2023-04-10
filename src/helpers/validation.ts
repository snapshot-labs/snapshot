import Ajv from 'ajv';
import type { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { isAddress } from '@ethersproject/address';
import { parseUnits } from '@ethersproject/units';

export function validateForm(
  schema: Record<string, any>,
  form: Record<string, any>
): Record<string, any> {
  const ajv = new Ajv({ allErrors: true });

  addFormats(ajv);

  ajv.addFormat('address', {
    validate: (value: string) => {
      try {
        return isAddress(value);
      } catch (err) {
        return false;
      }
    }
  });

  ajv.addFormat('long', {
    validate: () => true
  });

  ajv.addFormat('ethValue', {
    validate: (value: string) => {
      if (!value.match(/^([0-9]|[1-9][0-9]+)(\.[0-9]+)?$/)) return false;

      try {
        parseUnits(value, 18);
        return true;
      } catch {
        return false;
      }
    }
  });

  ajv.addFormat('customUrl', {
    type: 'string',
    validate: (str: any) => {
      if (!str.length) return true;
      return (
        str.startsWith('http://') ||
        str.startsWith('https://') ||
        str.startsWith('ipfs://') ||
        str.startsWith('ipns://') ||
        str.startsWith('snapshot://')
      );
    }
  });

  ajv.validate(schema, form);

  return transformAjvErrors(ajv);
}

interface ValidationErrorOutput {
  [key: string]: ValidationErrorOutput | string;
}
function transformAjvErrors(ajv: Ajv): ValidationErrorOutput {
  if (!ajv.errors) {
    return {};
  }

  ajv.errors = ajv.errors.map(error => {
    if (error.instancePath) return error;
    const propertyName = error.params.missingProperty;
    if (!propertyName) return error;
    const path = `/${propertyName}`;
    return {
      ...error,
      instancePath: path
    };
  });

  return ajv.errors.reduce(
    (output: ValidationErrorOutput, error: ErrorObject) => {
      const path: string[] = extractPathFromError(error);

      // Skip the current error if the path is empty
      if (path.length === 0) {
        return output;
      }

      const targetObject: ValidationErrorOutput = findOrCreateNestedObject(
        output,
        path
      );
      targetObject[path[path.length - 1]] = 'Invalid field';
      return output;
    },
    {}
  );
}

function extractPathFromError(error: ErrorObject): string[] {
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
