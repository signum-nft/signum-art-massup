import { FilePinResult } from "@commands/collection/push/upload/filePinResult";
import { PinningService } from "@lib/services/pinningService/pinningService";
import { FileLoggingService } from "@lib/services/loggingService";
import { readJSONSync, writeJSONSync } from "fs-extra";
import { NftRecord } from "@lib/services/csvService";
import { imagePinResultToMediaArray } from "@commands/collection/push/upload/imagePinResultToMediaArray";
import { getAttributesFromNftRecord } from "@commands/collection/push/upload/getAttributesFromNftRecord";
import { NftDescriptor } from "@commands/collection/push/upload/nftDescriptor";
import { jsonValidator } from "@lib/ajv/jsonValidator";
import { basename } from "path";

export async function pinMetaData(
  collectionId: string,
  filePinResults: FilePinResult[],
  metaDataFilePath: string,
  pinningService: PinningService,
  logger: FileLoggingService
) {
  logger.log("Mounting Meta Data...");
  const nftRecord = readJSONSync(metaDataFilePath) as NftRecord;

  const media = imagePinResultToMediaArray(filePinResults);
  const attributes = getAttributesFromNftRecord(nftRecord);

  const descriptor: NftDescriptor = {
    version: 1,
    collectionId,
    name: nftRecord.name,
    edition: nftRecord.edition,
    description: nftRecord.description,
    identifier: nftRecord.identifier,
    symbol: nftRecord.symbol,
    title: "",
    media,
    attributes,
  };

  jsonValidator.validateNft(descriptor);
  const descriptorPath = metaDataFilePath.replace(
    "-record.json",
    "-metadata.json"
  );
  writeJSONSync(descriptorPath, descriptor, { spaces: 2 });
  logger.log(`Written NFT Meta Data to ${descriptorPath}`, descriptor);
  const prefix = `signumart-collection-${collectionId}`;
  const ipfsHash = await pinningService.pinFile(descriptorPath, {
    name: prefix + basename(descriptorPath),
    keyvalues: {
      engine: "signumart-massup",
      collection: collectionId,
    },
  });

  logger.log("Successfully pinned meta data");
  return {
    nftRecord,
    ipfsHash,
  };
}
