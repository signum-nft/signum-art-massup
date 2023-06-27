import { ProfileData } from "@lib/profileData";
import ora from "ora";
import { createNetworkClient } from "@lib/networks";
import { LedgerService } from "@lib/services/ledgerService";
import { ensureDirSync, writeJSONSync } from "fs-extra";
import { join } from "path";
import { printableTableObject } from "@lib/printableTableObject";
import { promptConfirm } from "@lib/promptConfirm";
import { Filenames } from "@lib/constants";
import { createCSVTemplate } from "@commands/collection/createCSVTemplate";
import { FileLoggingService } from "@lib/services/loggingService";
import { prompt } from "./prompt";
import { toValidPathname } from "@lib/toValidPathname";

export const pull = async (opts: any, profile: ProfileData) => {
  const logger = new FileLoggingService(join(process.cwd(), Filenames.PullLog));
  const { collectionId } = await prompt();
  const spinner = ora("Connecting to Signum Network...").start();
  try {
    const ledger = await createNetworkClient(profile.network);
    spinner.succeed(`Using Signum Node: ${ledger.service.settings.nodeHost}`);
    const service = new LedgerService(ledger, profile);
    spinner.start("Pulling Collection Data from chain...");
    const collectionInfo = await service.collection.fetchCollection(
      collectionId
    );
    spinner.succeed();
    console.info("Found this collection");
    console.table(printableTableObject(collectionInfo));
    const confirmed = await promptConfirm("Is this correct?");
    if (!confirmed) {
      console.info("Cancelled by user");
      return;
    }
    spinner.start("Creating Meta Data Files");
    const cwd = process.cwd();
    const collectionFolder = join(cwd, toValidPathname(collectionInfo.name));
    ensureDirSync(collectionFolder);
    writeJSONSync(
      join(collectionFolder, Filenames.Collection),
      {
        id: collectionId,
        ...collectionInfo,
      },
      { spaces: 2 }
    );
    await createCSVTemplate(join(collectionFolder, Filenames.NftsCsv), logger);

    spinner.succeed();
    console.info("----------------------------------");
    console.info("🎉 Collection successfully pulled");
    console.info("----------------------------------");
    console.info("");
    console.info(
      `Now, use the file [${Filenames.NftsCsv}] to add more NFTs to your collection`
    );
    console.info(
      "Once you set up your NFTs listing parameters use [collection commit] to prepare your NFTs for the upload."
    );
  } catch (e: any) {
    spinner.fail(e.message);
    throw e;
  }
};
