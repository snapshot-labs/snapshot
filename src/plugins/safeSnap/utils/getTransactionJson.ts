import { ContractTransactionData } from './connextModule';

interface TransactionJson extends ContractTransactionData {
  from: string;
}

export const getTransactionJson = (data: TransactionJson) => {
  return {
    to: data.to,
    from: data.from,
    value: data.value,
    data: data.data
  };
};
