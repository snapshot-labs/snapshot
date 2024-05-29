import { InputTypes } from '@/plugins/oSnap/types';
import { MaybeNestedArrays } from '@/plugins/oSnap/utils';
import { ParamType } from '@ethersproject/abi';

export function getTypes(param: ParamType): MaybeNestedArrays<InputTypes> {
  if (param.baseType === 'array') {
    if (param.components) {
      return param.components.map(getTypes);
    }
    if (param.arrayChildren) {
      return getTypes(param.arrayChildren);
    }
  }

  if (param.baseType === 'tuple') {
    return param.components.map(getTypes);
  }

  return param.baseType as InputTypes;
}

export function extractTypes(param: ParamType) {
  if (param.baseType === 'tuple') {
    return {
      input: 'tuple',
      type: getTypes(param)
    } as const;
  }
  if (param.baseType === 'array') {
    return {
      input: 'array',
      type: getTypes(param)
    } as const;
  }
  return {
    input: 'single',
    type: getTypes(param) as InputTypes
  } as const;
}

const placeholders = {
  string: 'a string of text',
  address: '0x123...abc',
  int: '123',
  bytes: '0x123abc',
  bytes32: '0x123abc',
  bool: 'true'
} as const;

function reduceInt(value: string) {
  return value.includes('int') ? 'int' : value;
}

export function getParamPlaceholder(param: ParamType) {
  if (param.baseType === 'array') {
    if (param.arrayChildren) {
      return `[${placeholders[reduceInt(param.arrayChildren.baseType)]}]`;
    }
    return '[...]';
  }

  if (param.baseType === 'tuple') {
    return '[...]';
  }

  return placeholders[reduceInt(param.baseType)];
}

export function getParamLabel(param: ParamType) {
  const name = param.name?.length ? param.name + ' ' : '';
  if (param.baseType === 'array') {
    if (param.arrayChildren) {
      return `${name} (${param.arrayChildren.baseType}[])`;
    }
    return `${name} (tuple[])`;
  }

  if (param.baseType === 'tuple') {
    return `${name} (tuple)`;
  }

  return `${name} (${param.baseType})`;
}

function convertToStrings(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(item => convertToStrings(item)); // Recursive processing for nested arrays
  } else {
    return String(value); // Convert other types (number, boolean, hex strings) to string
  }
}

export function parseInputArray(
  input: string
): MaybeNestedArrays<string> | undefined {
  try {
    // Step 1: Preprocess the input to ensure it's in a valid JSON format
    const validJsonString = preprocessInputToJson(input);
    // Step 2: Safely parse the string into an array
    const result = JSON.parse(validJsonString);
    const toStrings = convertToStrings(result);
    return toStrings;
  } catch (error) {
    return `Error parsing input: ${error}`;
  }
}

// This function aims to quote unquoted strings and hex values to make the input JSON-compliant
function preprocessInputToJson(input: string): string {
  // Regex to find hex values and unquoted strings
  const hexRegex = /(\b0x[0-9A-Fa-f]+\b)/g;
  return input
    .replace(hexRegex, '"$1"')
    .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ')
    .replace(/'/g, '"');
}
