import {
  mustBeEthereumAddress,
  isArrayParameter
} from '../index';

export const isAddress = (type: string): boolean =>
  type.indexOf('address') === 0;
export const isBoolean = (type: string): boolean => type.indexOf('bool') === 0;
export const isString = (type: string): boolean => type.indexOf('string') === 0;
export const isUint = (type: string): boolean => type.indexOf('uint') === 0;
export const isInt = (type: string): boolean => type.indexOf('int') === 0;
export const isByte = (type: string): boolean => type.indexOf('byte') === 0;

export const isStringArray = (text: string): boolean => {
  try {
    const values = JSON.parse(text);
    return Array.isArray(values);
  } catch (e) {
    return false;
  }
};

export const isParameterValue = (type: string, value: string) => {
  if (type === 'address') {
    return mustBeEthereumAddress(value);
  } else if (isArrayParameter(type)) {
    return isStringArray(value);
  }
  return !!value;
};
