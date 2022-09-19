import {
  FunctionFragment,
  Interface,
  Fragment,
  JsonFragment
} from '@ethersproject/abi';
import { isArrayParameter } from './abi';

export class InterfaceDecoder extends Interface {
  public decodeFunction(
    data: string,
    fragmentOrName?: string | Fragment | JsonFragment
  ) {
    const fragment = this.getMethodFragment(data, fragmentOrName);
    if (!FunctionFragment.isFunctionFragment(fragment)) {
      throw new Error(
        `could not resolved to a function fragment fragmentOrName: ${fragmentOrName}`
      );
    }
    const functionFragment = FunctionFragment.fromObject(fragment);
    const decodedValues = this.decodeFunctionData(functionFragment.name, data);

    return functionFragment.inputs.reduce((acc, parameter, index) => {
      const value = decodedValues[index];
      const formattedValue = this.formatParameter(parameter, value);
      acc.push(formattedValue);
      if (parameter.name) {
        acc[parameter.name] = formattedValue;
      }
      return acc;
    }, [] as string[]);
  }

  public getMethodFragment(
    data: string,
    fragmentOrName?: string | Fragment | JsonFragment
  ): Fragment | JsonFragment {
    if (typeof fragmentOrName === 'string') {
      return this.getFunction(fragmentOrName);
    } else if (!fragmentOrName) {
      const signature = data.slice(0, 10);
      return this.getFunction(signature);
    }
    return fragmentOrName;
  }

  private formatParameter(parameter, value, deep = 0): string {
    if (isArrayParameter(parameter.baseType)) {
      return this.formatArrayValue(parameter.arrayChildren, value, deep);
    }
    return value.toString();
  }

  private formatArrayValue(paramType, value, deep = 0) {
    const formattedValues = value.map(paramValue =>
      this.formatParameter(paramType, paramValue, deep + 1)
    );
    if (deep) return formattedValues;
    return JSON.stringify(formattedValues);
  }
}
