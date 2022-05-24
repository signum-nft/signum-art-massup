import { ProfileData } from "@lib/profileData";
import { prompt } from "./prompt";
import { promptConfirm } from "@lib/promptConfirm";
import { MediaType } from "@lib/mediaType";
import { getMimeTypeFromFilePath } from "@lib/mimeTypes";
import { printableTableObject } from "@lib/printableTableObject";
import { writeJSON } from "fs-extra";
import { join } from "path";
import { Filenames } from "@lib/constants";
import { createCSVTemplate } from "@commands/collection/createCSVTemplate";
import { pushCollectionToChain } from "./pushCollectionToChain";
import { pinBanner } from "./pinBanner";
import { createStructure } from "./createStructure";
import { compressBanner } from "./compressBanner";
import { FileLoggingService } from "@lib/services/loggingService";

export const create = async (opts: any, profile: ProfileData) => {
  const logger = new FileLoggingService(
    join(process.cwd(), Filenames.CreateLog)
  );
  try {
    logger.log(
      `Creating collection for account ${profile.getAddress()} in network ${
        profile.network
      }`
    );
    let answers = await prompt();
    if (opts.try) {
      logger.log("Mode: Trial Run");
      console.info("=================== TRIAL RUN ====================");
      console.info("Nothing will be uploaded to Signum Chain or IPFS");
      console.info("================================================\n");
    }

    console.info("Initial parameters for your collection");
    console.table(printableTableObject(answers));
    logger.log("Collection Parameters", answers);
    const confirmed = await promptConfirm("Do you accept these settings?");
    if (!confirmed) {
      logger.log("Cancelled");
      console.info("Creation Process cancelled");
      return;
    }
    const { folderPath, bannerPath, collectionJson } = await createStructure(
      answers,
      logger
    );
    const { original, social } = await compressBanner(bannerPath, logger);

    let socialMediaFile: MediaType = {
      ipfsHash: "<try-run-banner-social>",
      mimeType: "image/webp",
    };
    let bannerFile: MediaType = {
      ipfsHash: "<try-run-banner>",
      mimeType: "image/webp",
    };

    if (opts.try) {
      logger.log("TRIAL - Skipped Pinning");
      console.info("TRIAL - Skipped Pinning");
    } else {
      const [originalHash, socialHash] = await pinBanner(
        profile,
        logger,
        original,
        social
      );
      socialMediaFile = {
        ipfsHash: socialHash,
        mimeType: getMimeTypeFromFilePath(social),
      };
      bannerFile = {
        ipfsHash: originalHash,
        mimeType: getMimeTypeFromFilePath(original),
      };
    }

    let transactionId = "6666666";
    if (opts.try) {
      logger.log("TRIAL - Skipped On-Chain creation");
      console.info("TRIAL - Skipped On-Chain creation");
    } else {
      transactionId = await pushCollectionToChain({
        collectionInfo: answers,
        profile,
        logger,
        mediaFiles: {
          banner: bannerFile,
          bannerSocial: socialMediaFile,
        },
      });
    }

    await writeJSON(
      join(folderPath, Filenames.Collection),
      { id: transactionId, ...collectionJson },
      { spaces: 2 }
    );
    await createCSVTemplate(join(folderPath, Filenames.NftsCsv), logger);

    console.info("----------------------------------");
    console.info("🎉 Collection successfully created");
    console.info("----------------------------------");
    console.info(
      "It will be visible (only for you) on the NFT platform in approx. 10 minutes"
    );
    console.info("");
    console.info(
      `Now, use the file [${Filenames.NftsCsv}] to set up your NFTs for the collection`
    );
    console.info(
      "Once you set up your NFTs listing parameters use [collection commit] to prepare your NFTs for the upload."
    );
    logger.log("Collection Successfully created");
  } catch (e: any) {
    logger.error("Collection Creation failed", e);
  }
};
