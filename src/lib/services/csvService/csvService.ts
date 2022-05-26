import { ListingType } from "@lib/listingType";
import { stringify } from "csv-stringify";
import { parse } from "csv-parse";
import { createWriteStream, createReadStream } from "fs";
import { jsonValidator } from "@lib/ajv/jsonValidator";
import {
  InputValidationService,
  InvalidInputError,
} from "@lib/services/ledgerService/inputValidationService";
import { Constants } from "@lib/services/ledgerService/constants";
import { Amount } from "@signumjs/util";
import { calculateTimeoutFromDate } from "@lib/calculateTimeoutFromDate";

function validateSemanticLimits(record: NftRecord) {
  const { royalties, listingMode, price, auctionEnd } = record;

  InputValidationService.assertNumberLessOrEqualThan(
    Constants.Contract.MaximumRoyaltyFee,
    royalties * 10
  );

  if (listingMode !== "NotForSale") {
    InputValidationService.assertAmountGreaterOrEqualThan(
      Amount.fromSigna(Constants.Contract.MinimumSellAmount),
      Amount.fromSigna(price)
    );
  }

  if (listingMode === "OnAuction") {
    const auctionTimeout = calculateTimeoutFromDate(auctionEnd!);
    InputValidationService.assertNumberBetween(
      Constants.Contract.AuctionTimeoutMinimum,
      Constants.Contract.AuctionTimeoutMaximum,
      auctionTimeout
    );
  }
}

export interface NftRecord {
  name: string;
  description: string;
  edition?: string;
  identifier?: number;
  symbol?: string;
  image1: string;
  image2?: string;
  image3?: string;
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  attribute4?: string;
  attribute5?: string;
  attribute6?: string;
  attribute7?: string;
  attribute8?: string;
  listingMode: ListingType;
  royalties: number; // Percent
  price: number; // Signa
  offerPrice?: number; // Signa
  auctionEnd?: string; // ISO String

  // later add dutch auction
}

const DefaultLoadOptions = {
  onError: () => {},
  stopOnError: true,
};

export class CsvService {
  constructor(private filePath: string) {}

  public init() {
    const fileStream = createWriteStream(this.filePath, { encoding: "utf-8" });
    const Day = 1000 * 60 * 60 * 24;
    const initialObject1: NftRecord = {
      name: "Awesome NFT #1",
      description: "This is the most valuable NFT ever",
      symbol: "AWESOME",
      edition: "Summer",
      royalties: 10,
      identifier: 1,
      image1: "c:\\awesomeCollection\\00001-1.jpg",
      image2: "c:\\awesomeCollection\\00001-2.jpg",
      image3: "",
      attribute1: "key1:value1",
      attribute2: "key2:value2",
      attribute3: "key3:value3",
      attribute4: "",
      attribute5: "",
      attribute6: "",
      attribute7: "",
      attribute8: "",
      listingMode: "OnAuction",
      price: 1000,
      offerPrice: 2000,
      auctionEnd: new Date(Date.now() + 3 * Day).toISOString(),
    };

    const initialObject2: NftRecord = {
      name: "Awesome NFT #2",
      description: "This is the most valuable NFT ever",
      symbol: "AWESOME",
      edition: "Summer",
      royalties: 10,
      identifier: 2,
      image1: "c:\\awesomeCollection\\00002-1.jpg",
      image2: "c:\\awesomeCollection\\00002-2.jpg",
      image3: "",
      attribute1: "key1:value1",
      attribute2: "key2:value2",
      attribute3: "key3:value3",
      attribute4: "",
      attribute5: "",
      attribute6: "",
      attribute7: "",
      attribute8: "",
      listingMode: "NotForSale",
      price: 0,
      offerPrice: 0,
      auctionEnd: "",
    };

    const initialObject3: NftRecord = {
      name: "Awesome NFT #3",
      description: "This is the most valuable NFT ever",
      symbol: "AWESOME",
      edition: "Summer",
      royalties: 10,
      identifier: 3,
      image1: "c:\\awesomeCollection\\00003-1.jpg",
      image2: "c:\\awesomeCollection\\00003-2.jpg",
      image3: "",
      attribute1: "key1:value1",
      attribute2: "key2:value2",
      attribute3: "key3:value3",
      attribute4: "",
      attribute5: "",
      attribute6: "",
      attribute7: "",
      attribute8: "",
      listingMode: "FixedPrice",
      price: 2000,
      offerPrice: 0,
      auctionEnd: "",
    };

    return new Promise((resolve, reject) => {
      stringify([initialObject1, initialObject2, initialObject3], {
        header: true,
        delimiter: ",",
      })
        .on("error", reject)
        .on("end", resolve)
        .pipe(fileStream);
    });
  }

  public async load(
    onRecord: (record: NftRecord, lineCount: number) => void | Promise<void>,
    options: {
      onError: (error: Error, lineCount: number) => void | Promise<void>;
      stopOnError?: boolean;
    } = DefaultLoadOptions
  ): Promise<number> {
    const parser = createReadStream(this.filePath, {
      encoding: "utf-8",
    }).pipe(
      parse({
        delimiter: [",", ";"],
        trim: true,
        columns: true,
      })
    );
    let lineCount = 0;
    const { onError, stopOnError } = options;
    let isFatalError = false;
    let errorCount = 0;
    for await (const record of parser) {
      try {
        if (++lineCount > 99999) {
          isFatalError = true;
          throw new Error("Maximum allowed records exceeded");
        }
        jsonValidator.validateNftRecord(record);
        validateSemanticLimits(record);

        if (onRecord.constructor.name === "AsyncFunction") {
          await onRecord(record, lineCount);
        } else {
          onRecord(record, lineCount);
        }
      } catch (e: any) {
        const error = new Error(
          `Parse Error in line ${lineCount + 1}: ${e.message}`
        );
        errorCount++;
        onError(error, lineCount);
        if (stopOnError || isFatalError) {
          throw error;
        }
      }
    }

    if (errorCount) {
      throw new Error(`Found ${errorCount} errors`);
    }

    return lineCount;
  }
}
