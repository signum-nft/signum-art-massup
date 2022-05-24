import { ensureDirSync, moveSync, writeJSONSync } from "fs-extra";
import { basename, join } from "path";
import { cwd } from "process";
import { promptConfirm } from "@lib/promptConfirm";
import { Filenames } from "@lib/constants";
import { CollectionCreateAnswers } from "./prompt";
import walkDirSync from "klaw-sync";
import { FileLoggingService } from "@lib/services/loggingService";

const verifyBannerExistence = (folderPath: string) => {
  const files = walkDirSync(folderPath, {
    filter: ({ path }) =>
      /^banner\.jpg|jpeg|png|gif|webp|svg$/gi.test(basename(path)),
  });
  return files.length ? files[0].path : null;
};

export const createStructure = async (
  answers: CollectionCreateAnswers,
  logger: FileLoggingService
) => {
  logger.log("Creating Collection structure...");
  const folderPath = join(
    cwd(),
    answers.name.trim().replace(/\s/g, "_").toLowerCase()
  );
  ensureDirSync(folderPath);
  logger.log(`Collection folder [${folderPath}] created`);
  console.info(`Collection folder [${folderPath}] created`);
  console.info(
    "Now, copy your banner image (JPG, PNG, WEBP, SVG, GIF) to this folder."
  );
  console.info("");
  console.info("- Name it [banner.jpg] (or .png, .webp etc)");
  console.info("- Recommended size is 1600px width and 350px height");
  console.info("");
  console.info("Once you copied it, confirm the operation");
  let hasProvided = false;
  let bannerPath = null;
  while (!hasProvided) {
    hasProvided = await promptConfirm("Did you provide the banner image?");
    if (hasProvided) {
      bannerPath = await verifyBannerExistence(folderPath);
      hasProvided = bannerPath !== null;
      if (!hasProvided) {
        console.error(
          "Could not find any file named [banner.jpg] (or .png, .webp etc) - Try again"
        );
      }
    }
  }

  const bannerFilename = basename(bannerPath!);
  const dest = join(folderPath, "00000." + bannerFilename);
  moveSync(bannerPath!, dest);
  logger.log(`Banner [${bannerPath}] created in [${folderPath}]`);

  const collectionJson = {
    ...answers,
  };
  const collectionJSONPath = join(folderPath, Filenames.Collection);
  writeJSONSync(collectionJSONPath, collectionJson, {
    spaces: 2,
  });

  logger.log(
    `Collection Meta Data [${Filenames.Collection}] created in [${folderPath}]`
  );
  console.info("Collection structure successfully created");
  return {
    folderPath,
    bannerPath: dest,
    collectionJson,
  };
};
