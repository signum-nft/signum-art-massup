import ora from "ora";
import { createNetworkClient } from "@lib/networks";
import { LedgerService } from "@lib/services/ledgerService";
import { ProfileData } from "@lib/profileData";
import { MediaType } from "@lib/mediaType";
import { CollectionCreateAnswers } from "./prompt";
import { FileLoggingService } from "@lib/services/loggingService";

interface PushCollectionToChainArgs {
  profile: ProfileData;
  logger: FileLoggingService;
  collectionInfo: CollectionCreateAnswers;
  mediaFiles: {
    banner: MediaType;
    bannerSocial: MediaType;
  };
}

export async function pushCollectionToChain({
  collectionInfo,
  profile,
  logger,
  mediaFiles,
}: PushCollectionToChainArgs): Promise<string> {
  logger.log("Pushing collection to chain...");
  const spinner = ora("Searching optimal Signum Node...").start();
  try {
    const ledger = await createNetworkClient(profile.network);
    logger.log(
      `Connected to Signum Node [${ledger.service.settings.nodeHost}]`
    );
    spinner.succeed(`Using Signum Node: ${ledger.service.settings.nodeHost}`);
    const service = new LedgerService(ledger, profile);
    logger.log(`Creating Collection Transaction...`);
    spinner.start("Create Collection on chain...");
    const { transaction } = await service.collection.createCollection({
      name: collectionInfo.name,
      description: collectionInfo.description,
      socials: collectionInfo.socials,
      homePage: collectionInfo.homepage,
      background: mediaFiles.banner,
      socialMediaImage: mediaFiles.bannerSocial,
    });
    spinner.succeed(`Collection successfully transmitted`);
    console.log(
      "You can track the transaction here",
      service.getChainExplorerLinkForTx(transaction!)
    );
    logger.log(`Successfully created collection with Tx ID [${transaction}]`);
    return transaction!;
  } catch (e: any) {
    spinner.fail(e.message);
    throw e;
  }
}
