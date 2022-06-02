import { basename, join } from "path";
import intervalToDuration from "date-fns/intervalToDuration";
import { formatDuration } from "date-fns";
import { Amount } from "@signumjs/util";
import walkDirSync, { Filter } from "klaw-sync";
import { LedgerService } from "@lib/services/ledgerService";
import { PinningService } from "@lib/services/pinningService/pinningService";
import { CsvService } from "@lib/services/csvService";
import { Filenames } from "@lib/constants";
import { FileLoggingService } from "@lib/services/loggingService";
import { pinImageFiles } from "./pinImageFiles";
import { mintNft } from "./mintNft";
import { Presets, MultiBar } from "cli-progress";
import { pinMetaData } from "./pinMetaData";
import { loadProgress, persistProgress } from "../../progress";
import { isImage } from "@commands/collection/isImage";
import { Address } from "@signumjs/core";
import { sleep } from "@lib/sleep";

interface UploadStats {
  uploadedFiles: number;
  createdNfts: number;
  paidSigna: Amount;
  started: Date;
  ended: Date;
  duration: string;
}

interface UploadArgs {
  ledgerService: LedgerService;
  pinningService: PinningService;
  logger: FileLoggingService;
  collectionId: string;
  isTrial?: boolean;
}

export async function upload(args: UploadArgs): Promise<UploadStats> {
  const {
    isTrial = false,
    pinningService,
    collectionId,
    ledgerService,
    logger,
  } = args;
  const stats: UploadStats = {
    createdNfts: 0,
    uploadedFiles: 0,
    paidSigna: Amount.Zero(),
    started: new Date(),
    ended: new Date(),
    duration: "",
  };

  const fileSelector: (prefix: string) => Filter =
    (prefix) =>
    ({ path }) =>
      basename(path).startsWith(prefix);

  logger.log("Start uploading NFTs....");
  let index = 0;
  let hasFiles = true;
  let totalNftCount = 0;
  const rootPath = process.cwd();
  const csvFile = join(rootPath, Filenames.NftsCsv);
  const csvService = new CsvService(csvFile);
  await csvService.load(() => {
    ++totalNftCount;
  });
  const progressStatusFile = join(rootPath, Filenames.PushProgress);
  const progressStatus = await loadProgress(progressStatusFile);
  if (progressStatus.lastSuccessfullyProcessed) {
    logger.log(
      `Continue previous progress at line ${progressStatus.lastSuccessfullyProcessed}`
    );
    console.info(
      `Continue previous progress at line ${progressStatus.lastSuccessfullyProcessed}`
    );
  }
  const multiBar = new MultiBar(
    {
      hideCursor: true,
    },
    Presets.shades_grey
  );

  const taskProgress = multiBar.create(
    3,
    0,
    {},
    {
      format: "Sub-tasks:   {bar} - {value}/{total}",
    }
  );
  const nftProgress = multiBar.create(
    totalNftCount,
    progressStatus.lastSuccessfullyProcessed,
    {},
    {
      format:
        "Minted NFTs: {bar} - {value}/{total} | {percentage}% | ETA: {eta_formatted} | Elapsed: {duration_formatted}",
    }
  );
  console.info("\n\n🚀 ️Processing NFTs now...");
  console.info(
    "------------------------------------------------------------------"
  );
  try {
    while (hasFiles) {
      index++;
      if (index <= progressStatus.lastSuccessfullyProcessed) {
        continue;
      }

      const files = walkDirSync(rootPath, {
        nodir: true,
        filter: fileSelector(String(index).padStart(5, "0")),
      });

      hasFiles = files.length > 0;
      if (!hasFiles) {
        break;
      }
      taskProgress.update(1);
      const imagePinMap = await pinImageFiles(
        collectionId,
        files.filter((item) => isImage(item.path)),
        pinningService,
        logger
      );
      const metaDataFilePath = files.find((item) =>
        item.path.endsWith("-record.json")
      )?.path;
      taskProgress.update(2);
      const metaData = await pinMetaData(
        collectionId,
        imagePinMap,
        metaDataFilePath!,
        pinningService,
        logger
      );

      taskProgress.update(3);
      if (isTrial) {
        logger.log("TRIAL - Skipped Minting");
      } else {
        const { transaction } = await mintNft({
          ledgerService,
          metaData,
        });
        const address = Address.fromNumericId(transaction!);
        logger.log(
          `Minted NFT [${address.getNumericId()}] - ${address.getReedSolomonAddress()}`
        );
      }

      stats.uploadedFiles += files.length;
      stats.createdNfts++;
      progressStatus.lastSuccessfullyProcessed = index;
      progressStatus.lastUpdated = new Date();
      nftProgress.update(index);
      if (!isTrial) {
        await persistProgress(progressStatusFile, progressStatus);
      }
    }

    stats.paidSigna = Amount.fromSigna(0.4).multiply(stats.createdNfts);
    stats.ended = new Date();
    stats.duration = formatDuration(
      intervalToDuration({
        start: stats.started,
        end: stats.ended,
      })
    );
    logger.log("Successfully uploaded NFTS", stats);
    return stats;
  } finally {
    await sleep(100);
    console.info(
      "\n------------------------------------------------------------------\n\n"
    );
    multiBar.stop();
  }
}
