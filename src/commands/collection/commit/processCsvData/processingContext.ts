import { NftRecord } from "@lib/services/csvService";
import { FileLoggingService } from "@lib/services/loggingService";

export interface ProcessingContext {
  imageFileMap: { imageKey: string; path: string }[];
  rootPath: string;
  tmpDir: string;
  lineCount: number;
  record: NftRecord;
  logger: FileLoggingService;
}
