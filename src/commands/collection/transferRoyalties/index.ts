import { ProfileData } from "@lib/profileData";
import ora from "ora";
import { createNetworkClient } from "@lib/networks";
import { LedgerService } from "@lib/services/ledgerService";
import { join } from "path";
import { printableTableObject } from "@lib/printableTableObject";
import { promptConfirm } from "@lib/promptConfirm";
import { Filenames } from "@lib/constants";
import { FileLoggingService } from "@lib/services/loggingService";
import { prompt } from "./prompt";
import { fetchNftDataFromCollection } from "@commands/collection/transferRoyalties/fetchNftDataFromCollection";
import { transfer } from "@commands/collection/transferRoyalties/transfer";
import {
  loadProgress,
  persistProgress,
} from "@commands/collection/transferRoyalties/progress";
import { Address } from "@signumjs/core";
import { removeSync } from "fs-extra";
import { Amount } from "@signumjs/util";

export const transferRoyalties = async (opts: any, profile: ProfileData) => {
  const logger = new FileLoggingService(
    join(process.cwd(), Filenames.TransferRoyaltiesLog)
  );
  const { collectionId, newOwner } = await prompt();
  if (opts.try) {
    logger.log("Mode: Trial Run");
    console.info("=================== TRIAL RUN ====================");
    console.info("Nothing will be persisted on Signum Chain");
    console.info("================================================\n");
  }
  const spinner = ora("Connecting to Signum Network...").start();
  try {
    const ledger = await createNetworkClient(profile.network);
    const ledgerService = new LedgerService(ledger, profile);
    spinner.succeed(`Using Signum Node: ${ledger.service.settings.nodeHost}`);
    const transferProgressPath = join(
      process.cwd(),
      Filenames.TransferRoyaltiesProgress
    );

    const progress = await loadProgress(transferProgressPath);
    if (!progress.collectionId) {
      spinner.start("Checking beneficiary account...");
      const newOwnerId = Address.create(newOwner).getNumericId();
      const account = await ledger.account.getAccount({
        accountId: newOwnerId,
        includeCommittedAmount: false,
        includeEstimatedCommitment: false,
      });
      spinner.succeed(`Beneficiary account: ${account.accountRS}`);

      spinner.start("Pulling Collection Data from chain...");
      const collectionInfo = await ledgerService.collection.fetchCollection(
        collectionId
      );
      spinner.succeed();
      console.info("Found this collection");
      console.table(printableTableObject(collectionInfo));

      logger.log(`Fetching NFT information for collection ${collectionId}...`);
      spinner.start("Fetching NFT information for collection...");
      const nftData = await fetchNftDataFromCollection({
        ledgerService,
        profile,
        collectionId,
      });
      logger.log("Fetched NFT information successfully");
      spinner.succeed(`Found ${nftData.nftIds.length} NFTs`);

      const pricePerNft = Amount.fromSigna("0.31");
      const totalCosts = pricePerNft.multiply(nftData.nftIds.length);
      console.info("Expected costs:", totalCosts.getSigna(), "SIGNA");
      const balance = await ledgerService.getAvailableBalance();
      if (balance.less(totalCosts)) {
        throw new Error("Insufficient funds");
      }

      const confirmed = await promptConfirm("Is this correct?");
      if (!confirmed) {
        console.info("Cancelled by user");
        return;
      }

      progress.nftIdsToProgress = nftData.nftIds;
      progress.collectionId = collectionId;
      progress.totalCount = nftData.nftIds.length;
      progress.newOwnerId = newOwnerId;
      await persistProgress(transferProgressPath, progress);
    } else {
      logger.log(
        `Continuing previous transfer session for Collection ${collectionId}...`
      );
      console.info("Found incomplete progress. Continuing...");
    }

    await transfer({
      isTrialRun: opts.try,
      progress,
      logger,
      ledgerService,
      progressPath: transferProgressPath,
    });

    console.info("---------------------------------------------");
    console.info("🎉 Royalties transfers successfully requested");
    console.info("---------------------------------------------");
    console.info("");
    if (opts.try) {
      console.log("\n*** TRIAL run finished. Nothing submitted to network.\n");
    }
    removeSync(transferProgressPath);
  } catch (e: any) {
    spinner.fail(e.message);
    throw e;
  }
};
