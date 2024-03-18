import {
  ContractInteractionTransaction,
  GnosisSafe,
  TransferFundsTransaction
} from '../types';
import {
  createContractInteractionTransaction,
  createTransferFundsTransaction
} from './transactions';
import { isSafeFile } from './validators';

export async function parseGnosisSafeFile(
  file: File
): Promise<GnosisSafe.BatchFile> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      try {
        if (typeof reader.result !== 'string') {
          throw new Error('Buffer can not be parsed');
        }
        const json = JSON.parse(reader.result);
        if (!isSafeFile(json)) {
          throw new Error('Not a Gnosis Safe transaction file!');
        }
        return res(json);
      } catch (err) {
        rej(err);
      }
    };
  });
}
