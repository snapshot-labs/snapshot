import { GnosisSafe } from '../types';
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

export function isJsonFile(file: File) {
  return file.type === 'application/json';
}

export function getFileFromEvent(event: DragEvent | Event) {
  let _file: File | undefined;

  if (event instanceof DragEvent) {
    _file = event.dataTransfer?.files?.[0];
  }

  if (event.target && event.target instanceof HTMLInputElement) {
    _file = (event?.currentTarget as HTMLInputElement)?.files?.[0];
  }
  if (!_file) return;
  return _file;
}
