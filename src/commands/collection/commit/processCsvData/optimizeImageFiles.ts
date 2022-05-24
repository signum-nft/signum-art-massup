import walkDirSync from "klaw-sync";
import { extname } from "path";
import {
  imageCompressionService,
  UsageType,
} from "@lib/services/imageCompressionService";
import { ProcessingContext } from "./processingContext";

export async function optimizeImageFiles(context: ProcessingContext) {
  const { tmpDir, logger } = context;
  const files = walkDirSync(tmpDir, { nodir: true });
  const promises = files.flatMap((file) => {
    logger.log(`Optimizing Image [${file.path}]`);
    const extension = extname(file.path);
    return [
      imageCompressionService.compressNft({
        inputFilePath: file.path,
        outputFilePath: file.path.replace(extension, `-thumb`),
        usageType: UsageType.THUMB,
      }),
      imageCompressionService.compressNft({
        inputFilePath: file.path,
        outputFilePath: file.path.replace(extension, `-social`),
        usageType: UsageType.SOCIAL,
      }),
    ];
  });

  return Promise.all(promises);
}
