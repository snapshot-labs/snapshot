export interface TxData {
  to: string;
  value: string;
  data: string;
  name?: string;
  calldatas?: Calldata[];
  from?: string;
}

export interface Calldata {
  type: string;
  value: string;
}

export const getReadableData = (data: TxData) => {
  let callDataString = '';

  if (data?.calldatas) {
    callDataString = data?.calldatas
      .map(({ type, value }: Calldata) => `${type}: ${value}`)
      .join('\n');
  }

  return `Signature: 
${data?.name}

Calldatas: 
${callDataString || data?.data.slice(10)}`;
};
