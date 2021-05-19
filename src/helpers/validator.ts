export const isAddress = (type: string): boolean => type.indexOf('address') === 0
export const isBoolean = (type: string): boolean => type.indexOf('bool') === 0
export const isString = (type: string): boolean => type.indexOf('string') === 0
export const isUint = (type: string): boolean => type.indexOf('uint') === 0
export const isInt = (type: string): boolean => type.indexOf('int') === 0
export const isByte = (type: string): boolean => type.indexOf('byte') === 0