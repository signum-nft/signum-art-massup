import { ProfileData } from "@lib/profileData";
import { Filenames } from "@lib/constants";
import { printableTableObject } from "@lib/printableTableObject";
import { createNetworkClient } from "@lib/networks";
import { LedgerService } from "@lib/services/ledgerService";
import ora from "ora";
import { promptConfirm } from "@lib/promptConfirm";
import { getStatistics } from "@commands/collection/getStatistics";
import { verifyCollection } from "./verifyCollection";
import { assertSufficientBalance } from "./assertSufficientBalance";
import { assertFileExistence } from "./assertFileExistence";
import { upload } from "./upload";
import { PinningServiceFactory } from "@lib/services/pinningService";
import { readJSONSync } from "fs-extra";
import { join } from "path";
import { FileLoggingService } from "@lib/services/loggingService";

export const push = async (opts: any, profile: ProfileData) => {
  assertFileExistence(Filenames.Collection);
  assertFileExistence(Filenames.NftsCsv);
  const logger = new FileLoggingService(join(process.cwd(), Filenames.PushLog));
  logger.log("Uploading/Pushing NFTs to Signum and IPFS...");
  if (opts.try) {
    logger.log("Mode: Trial Run");
    console.info("=================== TRIAL RUN ====================");
    console.info("Nothing will be uploaded to Signum Chain or IPFS");
    console.info("================================================\n");
  }

  const spinner = ora("Connecting to Signum Network...").start();
  try {
    const ledger = await createNetworkClient(profile.network);
    const ledgerService = new LedgerService(ledger, profile);
    const pinningService = PinningServiceFactory.getPinningService(
      opts.try ? undefined : profile
    );
    spinner.succeed(`Using Signum Node: ${ledger.service.settings.nodeHost}`);
    logger.log(`Using Signum Node: ${ledger.service.settings.nodeHost}`);

    const { id: collectionId } = readJSONSync(
      join(process.cwd(), Filenames.Collection)
    );

    if (opts.try) {
      logger.log("TRIAL - Skipped Collection Verification");
      console.info("TRIAL - Skipped Collection Verification");
    } else {
      logger.log(`Verifying Collection: ${collectionId}`);
      spinner.start(`Verifying Collection...`);
      await verifyCollection(ledgerService, collectionId);
      spinner.succeed(`Successfully verified [${collectionId}]`);
      logger.log(`Successfully verified [${collectionId}]`);
    }

    spinner.start(`Checking available balance...`);
    logger.log(`Checking available balance...`);
    const stats = getStatistics(process.cwd());
    const restBalance = await assertSufficientBalance(
      ledgerService,
      stats.mintingCosts
    );
    spinner.succeed(
      `After successful upload you'll still have ${restBalance.getSigna()} SIGNA`
    );
    console.table(printableTableObject(stats));
    logger.log("Collection Stats", stats);
    const confirmed = await promptConfirm("🥁 Are you ready for upload?");
    if (!confirmed) {
      console.log("Cancelled by user");
      logger.log("Cancelled by user");
      return;
    }
    const uploadStats = await upload({
      logger,
      ledgerService,
      pinningService,
      collectionId,
      isTrial: opts.try,
    });
    console.table(printableTableObject(uploadStats));
    console.info("\n============ 🎉🎊🥳 ============");
    if (!opts.try) {
      console.info(
        "Congratulations - Your NFTs were uploaded successfully to your collection"
      );
      console.info("Your NFTs are being processed by the network now,");
      console.info(
        "and will start to appear in about 10 minutes on the NFT platform."
      );
      console.info(
        "You can track the transactions on the explorer:",
        ledgerService.getChainExplorerLinkForAddress(profile.getAccountId())
      );
      console.info("");
      console.info("We wish you success with your collection. Happy selling!");
      logger.log("Successfully finished");
    } else {
      logger.log("TRIAL run successfully executed...");
      console.info(
        "TRIAL run successfully executed...you may now run for real"
      );
    }
    console.info("================================");
  } catch (e: any) {
    spinner.fail(e.message);
    logger.error("Upload failed", e);
    throw e;
  }
};
