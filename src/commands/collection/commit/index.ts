import { ProfileData } from "@lib/profileData";
import { existsSync } from "fs";
import { join } from "path";
import { readJSONSync } from "fs-extra";
import { promptConfirm } from "@lib/promptConfirm";
import { printableTableObject } from "@lib/printableTableObject";
import { validateCsvData } from "./validateCsvData";
import { processCsvData } from "./processCsvData";
import { Filenames } from "@lib/constants";
import { FileLoggingService } from "@lib/services/loggingService";

async function promptContinue() {
  const confirmed = await promptConfirm(
    "Do you want to continue preparing the NFTs data for upload?"
  );
  if (!confirmed) {
    console.info("Commit Process cancelled");
    process.exit(1);
  }
}

export const commit = async (opts: any, profile: ProfileData) => {
  const cwd = process.cwd();
  const collectionJsonPath = join(cwd, Filenames.Collection);
  const logger = new FileLoggingService(join(cwd, Filenames.CommitLog));
  try {
    if (opts.try) {
      logger.log("Mode: Trial Run");
      console.info("=================== TRIAL RUN ====================");
      console.info("Nothing will be generated");
      console.info("================================================\n");
    }

    if (!existsSync(collectionJsonPath)) {
      console.warn(
        `Cannot find [${Filenames.Collection}] file in the current folder.`
      );
      console.info("Please, change to the desired collection folder,");
      console.info("or create a new collection with [collection create]");
      logger.warn(
        `Stopped, due to not found collection meta data file [${Filenames.Collection}]`
      );
      return;
    }
    logger.log(
      `Loading collection meta data file [${Filenames.Collection}]...`
    );
    const collection = readJSONSync(collectionJsonPath);
    console.info("Found Collection");
    console.table(printableTableObject(collection));
    await promptContinue();

    const csvDataPath = join(cwd, Filenames.NftsCsv);
    const stats = await validateCsvData(csvDataPath, logger, opts.try);
    console.table(printableTableObject(stats));

    if (stats.validationErrors) {
      const msg = `Found ${stats.validationErrors} validation errors in [${csvDataPath}] - You need to fix them before you can continue`;
      logger.warn(msg);
      console.error(msg);

      if (!opts.try) {
        console.info("HINT:");
        console.info(
          "Please run [collection commit --try] to detect all potential errors at once"
        );
      }
      return;
    }

    if (opts.try) {
      console.log("\n*** TRIAL run finished. No artifacts were created.\n");
      return;
    }

    await promptContinue();
    await processCsvData(csvDataPath, stats.count, logger);
    logger.log(
      `Successfully prepared collection artifacts in [${collectionJsonPath}]`
    );
    console.info(
      "Successfully created all necessary artifacts. Now, you can run [collection push]"
    );
  } catch (e: any) {
    logger.error("Commit failed", e);
    throw e;
  }
};
