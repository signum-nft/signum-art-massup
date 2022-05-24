export function isImage(filePath: string): boolean {
  return !(
    !filePath.endsWith(".jpg") &&
    !filePath.endsWith(".jpeg") &&
    !filePath.endsWith(".webp") &&
    !filePath.endsWith(".png") &&
    !filePath.endsWith(".gif") &&
    !filePath.endsWith(".svg") &&
    !filePath.endsWith(".bmp")
  );
}
