import { extname } from "path";

const MimeTypes = {
  png: "image/png",
  jpg: "image/jpg",
  jpeg: "image/jpg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};
export function getMimeTypeFromFilePath(filePath: string): string {
  const suffix = extname(filePath).replace(".", "");
  // @ts-ignore
  const mimeType = MimeTypes[suffix];
  if (!mimeType) {
    throw Error(`Unsupported Media Type: ${filePath}`);
  }
  return mimeType;
}
