import { CsvService } from "@lib/services/csvService";
import ora from "ora";
import { Amount } from "@signumjs/util";
import { FileLoggingService } from "@lib/services/loggingService";

interface NftRecordStats {
  count: number;
  auctionCount: number;
  forSaleCount: number;
  notForSaleCount: number;
  minimumTotalAmount: Amount;
  itemsWithAttributesCount: number;
  attributeKeysCount: number;
  distinctAttributesCount: number;
  validationErrors: number;
}

const InitialStats = {
  count: 0,
  auctionCount: 0,
  forSaleCount: 0,
  notForSaleCount: 0,
  minimumTotalAmount: Amount.Zero(),
  attributeKeysCount: 0,
  distinctAttributesCount: 0,
  itemsWithAttributesCount: 0,
  validationErrors: 0,
};

export async function validateCsvData(
  csvDataPath: string,
  logger: FileLoggingService,
  noBailout = false
): Promise<NftRecordStats> {
  const service = new CsvService(csvDataPath);
  let stats: NftRecordStats = { ...InitialStats };
  let attributes = new Map<string, Set<string>>();
  logger.log(`Loading NFT CSV file [${csvDataPath}]...`);
  const spinner = ora("Validating NFT records").start();
  const validationErrors: String[] = [];
  try {
    await service.load(
      (record) => {
        stats.count++;

        switch (record.listingMode) {
          case "FixedPrice":
            stats.forSaleCount++;
            break;
          case "OnAuction":
            stats.auctionCount++;
            break;
          case "NotForSale":
            stats.notForSaleCount++;
            break;
        }

        if (record.price) {
          stats.minimumTotalAmount.add(Amount.fromSigna(record.price));
        }

        let itemHasAttribute = false;
        for (let i = 1; i <= 8; ++i) {
          // @ts-ignore
          const att = record[`attribute${i}`];
          if (att) {
            itemHasAttribute = true;
            const [key, value] = att.split(":");
            let k = attributes.get(key);
            if (!k) {
              attributes.set(key, new Set());
              k = attributes.get(key);
            }
            k!.add(value);
          }
        }

        if (itemHasAttribute) {
          stats.itemsWithAttributesCount++;
        }
      }, // end of onRecord
      {
        onError: (error) => {
          logger.error("CSV Validation Error", error);
          validationErrors.push(error.message);
          stats.validationErrors++;
        },
        stopOnError: !noBailout,
      }
    );

    spinner.succeed("Congratulations. All data is valid");
    stats.attributeKeysCount = attributes.size;
    for (let traits of attributes.values()) {
      stats.distinctAttributesCount += traits.size;
    }
    logger.log(`NFT CSV file loaded and validated successfully`, stats);
  } catch (e: any) {
    spinner.fail(e.message);
  }

  if (stats.validationErrors) {
    logger.warn(`Found ${stats.validationErrors} errors in [${csvDataPath}]`);
    console.log("\n\n*** FOUND ERRORS ****");
    console.table(validationErrors);
  }

  return stats;
}
