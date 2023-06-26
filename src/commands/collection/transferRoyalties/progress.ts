import { readJSON, writeJson } from "fs-extra";

export interface TransferRoyaltiesProgressStatus {
  lastUpdated: Date;
  collectionId: string;
  newOwnerId: string;
  totalCount: number;
  nftIdsToProgress: string[];
}

export async function loadProgress(
  path: string
): Promise<TransferRoyaltiesProgressStatus> {
  try {
    return await readJSON(path);
  } catch (_) {
    return {
      collectionId: "",
      newOwnerId: "",
      lastUpdated: new Date(),
      totalCount: 0,
      nftIdsToProgress: [],
    };
  }
}

export async function persistProgress(
  path: string,
  progress: TransferRoyaltiesProgressStatus
) {
  return writeJson(path, progress, { spaces: 2 });
}
