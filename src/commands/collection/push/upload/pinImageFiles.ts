import { Item } from "klaw-sync";
import { PinningService } from "@lib/services/pinningService/pinningService";
import { FilePinResult } from "@commands/collection/push/upload/filePinResult";
import { basename } from "path";
import { FileLoggingService } from "@lib/services/loggingService";

export async function pinImageFiles(
  collectionId: string,
  files: ReadonlyArray<Item>,
  pinningService: PinningService,
  logger: FileLoggingService
): Promise<FilePinResult[]> {
  const promises: Promise<any>[] = [];
  const filemapping: string[] = [];
  for (let file of files) {
    const fileName = basename(file.path);
    const prefix = `signumart-collection-${collectionId}-`;

    logger.log(`Pinning image ${prefix + fileName}...`);

    filemapping.push(fileName);
    promises.push(
      pinningService.pinFile(file.path, {
        name: prefix + fileName,
        keyvalues: {
          engine: "signumart-massup",
          collection: collectionId,
        },
      })
    );
  }
  const pinningResults = await Promise.all(promises);

  return pinningResults.map((hash, index) => ({
    file: filemapping[index],
    hash,
  }));
}
