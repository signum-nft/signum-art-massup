import ora from "ora";
import { CsvService } from "@lib/services/csvService";
import { basename } from "path";
import { FileLoggingService } from "@lib/services/loggingService";

export async function createCSVTemplate(
  filePath: string,
  logger: FileLoggingService
) {
  logger.log("Creating NFT CSV Template...");
  const spinner = ora("Creating NFT CSV Template...").start();
  try {
    const service = new CsvService(filePath);
    await service.init();
    spinner.succeed(`Created Template [${basename(filePath)}] `);
    logger.log(`Successfully Created CSV Template [${basename(filePath)}] `);
  } catch (e: any) {
    spinner.fail(e.message);
    throw e;
  }
}
