import { Media } from "./nftDescriptor";
import { FilePinResult } from "./filePinResult";
import { getMimeTypeFromFilePath } from "@lib/mimeTypes";

export function imagePinResultToMediaArray(
  imagePinResult: FilePinResult[]
): Media[] {
  const media: Media[] = [];
  for (let pinMap of imagePinResult) {
    const matches = /^\d{5}\.(.+)\..+$/gi.exec(pinMap.file.toLowerCase());
    if (!matches) {
      throw new Error(`Unexpected Format: ${pinMap.file}`);
    }
    const group = matches[1];
    const [index, type] = group.split("-");
    const i = +index - 1;
    if (!media[i]) {
      // @ts-ignore
      media.push({});
    }

    if (type !== "social" && type !== "thumb") {
      media[i][pinMap.hash] = getMimeTypeFromFilePath(pinMap.file);
    } else {
      media[i][type] = pinMap.hash;
    }
  }

  return media;
}
