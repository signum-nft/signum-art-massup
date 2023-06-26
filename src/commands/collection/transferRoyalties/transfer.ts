import { FileLoggingService } from "@lib/services/loggingService";
import { Presets, SingleBar } from "cli-progress";
import { TransferRoyaltiesProgressStatus, persistProgress } from "./progress";
import { LedgerService } from "@lib/services/ledgerService";
import pRetry from "p-retry";
import { sleep } from "@lib/sleep";
interface TransferArgs {
  isTrialRun: boolean;
  progress: TransferRoyaltiesProgressStatus;
  logger: FileLoggingService;
  progressPath: string;
  ledgerService: LedgerService;
}
export async function transfer(args: TransferArgs) {
  const { isTrialRun, progressPath, logger, progress, ledgerService } = args;
  logger.log(`Starting Transfer Royalties process...`);
  const progressBar = new SingleBar({}, Presets.shades_grey);
  progressBar.start(
    progress.totalCount,
    progress.totalCount - progress.nftIdsToProgress.length
  );
  try {
    const initialLength = progress.nftIdsToProgress.length;
    let nextNftId = progress.nftIdsToProgress.pop();
    while (nextNftId) {
      logger.log(`Transferring Royalties Ownership for NFT ${nextNftId}...`);
      if (isTrialRun) {
        await sleep(100);
      } else {
        await pRetry(() =>
          ledgerService.nft.transferRoyalties(nextNftId!, progress.newOwnerId)
        );
      }
      nextNftId = progress.nftIdsToProgress.pop();
      await persistProgress(progressPath, progress);
      progressBar.update(
        progress.totalCount - progress.nftIdsToProgress.length
      );
    }
    logger.log(`Transferred ${initialLength} Royalties Ownerships.`);
  } catch (e: any) {
    logger.error("Transfer failed", e);
  } finally {
    await persistProgress(progressPath, progress);
    progressBar.stop();
  }
}
