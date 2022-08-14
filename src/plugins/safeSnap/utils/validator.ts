import { mustBeEthereumAddress } from './index';
import { isArrayParameter } from './abi';

export const isAddressType = (type: string): boolean =>
  type.indexOf('address') === 0;
export const isBooleanType = (type: string): boolean =>
  type.indexOf('bool') === 0;
export const isStringType = (type: string): boolean =>
  type.indexOf('string') === 0;
export const isUintType = (type: string): boolean => type.indexOf('uint') === 0;
export const isIntType = (type: string): boolean => type.indexOf('int') === 0;
export const isBytesType = (type: string): boolean =>
  type.indexOf('bytes') === 0;

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
