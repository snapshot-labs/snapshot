export function isFileOfType(file: File, type: File['type']) {
  return file.type === type;
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
