import { dirname, join } from "path";
import ora from "ora";
import {
  imageCompressionService,
  UsageType,
} from "@lib/services/imageCompressionService";
import { FileLoggingService } from "@lib/services/loggingService";

export async function compressBanner(
  bannerPath: string,
  logger: FileLoggingService
) {
  logger.log(`Optimizing banner [${bannerPath}]`);
  const collectionDir = dirname(bannerPath);
  const inputFilePath = bannerPath;
  const outputFilePathOriginal = join(collectionDir, "00000.banner");
  const outputFilePathSocial = join(collectionDir, "00000.banner-social");
  const spinner = ora("Optimizing Collection Banner").start();
  try {
    const [original, social] = await Promise.all([
      imageCompressionService.compressBanner({
        inputFilePath,
        outputFilePath: outputFilePathOriginal,
        usageType: UsageType.ORIGINAL,
      }),
      imageCompressionService.compressBanner({
        inputFilePath,
        outputFilePath: outputFilePathSocial,
        usageType: UsageType.SOCIAL,
      }),
    ]);
    spinner.succeed();
    logger.log("Successfully optimized", { original, social });
    return {
      original,
      social,
    };
  } catch (e: any) {
    spinner.fail();
    throw e;
  }
}
