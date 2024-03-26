export function isFileOfType(file: File, type: File['type']) {
  return file.type === type;
}

export function getFilesFromEvent(event: DragEvent | Event) {
  let _files: FileList | undefined | null;

  if (event instanceof DragEvent) {
    _files = event.dataTransfer?.files;
  }

  if (event.target && event.target instanceof HTMLInputElement) {
    _files = (event?.currentTarget as HTMLInputElement)?.files;
  }
  if (!_files) return;
  return _files;
}
