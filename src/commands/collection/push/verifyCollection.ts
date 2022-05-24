import { LedgerService } from "@lib/services/ledgerService";
import { printableTableObject } from "@lib/printableTableObject";

export async function verifyCollection(
  ledgerService: LedgerService,
  collectionId: string
): Promise<string> {
  const collectionInfo = await ledgerService.collection.fetchCollection(
    collectionId
  );
  console.info("Found this collection");
  console.table(printableTableObject(collectionInfo));
  return collectionId;
}
