import { addressEqual } from '@/helpers/utils';
import { GnosisSafe } from '../types';
import { isSafeFile } from './validators';

export async function parseGnosisSafeFile(
  file: File,
  safe: GnosisSafe | null
): Promise<GnosisSafe.BatchFile> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      try {
        if (typeof reader.result !== 'string') {
          return rej(new Error('Buffer can not be parsed'));
        }
        const json = JSON.parse(reader.result);
        if (!isSafeFile(json)) {
          return rej(new Error('Not a valid Safe transaction file.'));
        }
        if (!isCreatedFromSafe(json, safe)) {
          return rej(
            new Error(
              "Safe file does not match the selected treasury's address or chain ID"
            )
          );
        }
        return res(json);
      } catch (err) {
        return rej(new Error('Safe file corrupted. Please select another.'));
      }
    };
  });
}

function isCreatedFromSafe(
  batchFile: GnosisSafe.BatchFile,
  safe: GnosisSafe | null
): boolean {
  if (safe && batchFile.meta.createdFromSafeAddress) {
    return (
      safe.network === batchFile.chainId &&
      addressEqual(safe.safeAddress, batchFile.meta.createdFromSafeAddress)
    );
  }
  return false;
}
