export function getFileName(filePath) {
  if (!filePath) {
    return '';
  }
  const segments = filePath.split('/');
  return segments[segments.length - 1] || filePath;
}
