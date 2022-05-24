import { readJSON, writeJson } from "fs-extra";
import { NftRecord } from "@lib/services/csvService";

interface ProgressStatus {
  lastSuccessfullyProcessed: number;
  lastUpdated: Date;
  record?: NftRecord;
}

export async function loadProgress(path: string): Promise<ProgressStatus> {
  try {
    return await readJSON(path);
  } catch (e: any) {
    return {
      lastSuccessfullyProcessed: 0,
      lastUpdated: new Date(),
    };
  }
}

export async function persistProgress(path: string, progress: ProgressStatus) {
  return writeJson(path, progress, { spaces: 2 });
}
