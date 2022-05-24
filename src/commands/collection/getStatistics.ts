import walkDirSync from "klaw-sync";
import { Amount } from "@signumjs/util";
import { BigNumber } from "bignumber.js";
import { basename } from "path";
import { isImage } from "@commands/collection/isImage";

export function getStatistics(rootPath: string) {
  let totalBytes = new BigNumber(0);
  let imageCount = 0;
  let nftCount = 0;
  const files = walkDirSync(rootPath, { nodir: true });
  const nftDescriptor = new RegExp(/^\d{5}-record\.json$/gi);
  for (let file of files) {
    const fileName = basename(file.path);
    if (nftDescriptor.test(fileName)) {
      nftCount++;
    } else if (isImage(file.path)) {
      ++imageCount;
      totalBytes = totalBytes.plus(file.stats.size);
    }
  }

  const mintingCosts = Amount.fromSigna(0.4).multiply(nftCount);
  return {
    nftCount,
    imageFileCount: imageCount,
    totalUploadSize: totalBytes.dividedBy(1024 ** 2).toFixed(2) + " MiB",
    mintingCosts,
  };
}
