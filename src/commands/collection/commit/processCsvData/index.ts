import { CsvService } from "@lib/services/csvService";
import { Presets, SingleBar } from "cli-progress";
import { ensureDirSync, removeSync } from "fs-extra";
import { dirname, join } from "path";
import { printableTableObject } from "@lib/printableTableObject";
import { Filenames } from "@lib/constants";
import { ProcessingContext } from "./processingContext";
import { copyImageFiles } from "./copyImageFiles";
import { optimizeImageFiles } from "./optimizeImageFiles";
import { createMetaData } from "./createMetaData";
import { cleanupTempDir } from "./cleanupTempDir";
import { getStatistics } from "../../getStatistics";
import { loadProgress, persistProgress } from "../../progress";
import { FileLoggingService } from "@lib/services/loggingService";
import { formatDuration, intervalToDuration } from "date-fns";

export async function processCsvData(
  csvDataPath: string,
  totalNftCount: number,
  logger: FileLoggingService
) {
  logger.log(`Processing ${csvDataPath}...`);
  const service = new CsvService(csvDataPath);
  const rootPath = dirname(csvDataPath);
  const progressStatusFile = join(rootPath, Filenames.CommitProgress);
  const tmpDir = join(rootPath, "/tmp");
  logger.log(`Creating temporary folder ${tmpDir}...`);
  ensureDirSync(tmpDir);
  const progressStatus = await loadProgress(progressStatusFile);
  if (progressStatus.record) {
    logger.log(
      `Continue previous progress at line ${progressStatus.lastSuccessfullyProcessed}`
    );
    console.info(
      `Continue previous progress at line ${progressStatus.lastSuccessfullyProcessed}`
    );
  }
  const started = new Date();
  const progressBar = new SingleBar({}, Presets.shades_grey);
  progressBar.start(totalNftCount, progressStatus.lastSuccessfullyProcessed);
  try {
    await service.load(async (record, lineCount) => {
      if (lineCount < progressStatus.lastSuccessfullyProcessed) {
        return Promise.resolve(); // skip already processed
      }
      progressBar.update(lineCount);
      const context: ProcessingContext = {
        logger,
        lineCount,
        tmpDir,
        rootPath,
        record,
        imageFileMap: [],
      };
      context.imageFileMap = await copyImageFiles(context);
      await optimizeImageFiles(context);
      const metadata = await createMetaData(context);
      logger.log("Created artifacts", metadata);
      cleanupTempDir(context);

      await persistProgress(progressStatusFile, {
        lastSuccessfullyProcessed: lineCount,
        record,
        lastUpdated: new Date(),
      });
    });

    const stats = getStatistics(rootPath);
    const duration = formatDuration(
      intervalToDuration({
        start: started,
        end: new Date(),
      })
    );
    progressBar.stop();
    console.table(printableTableObject({ ...stats, duration }));
    logger.log(`Successfully processed [${csvDataPath}]`, stats);
  } catch (e: any) {
    console.error("😵 Preparation failed", e.message);
    throw e;
  } finally {
    removeSync(tmpDir);
    logger.log(`Removed temporary folder ${tmpDir}...`);
    progressBar.stop();
  }
}
