import walkDirSync from "klaw-sync";
import { move, moveSync } from "fs-extra";
import { basename, join } from "path";
import { ProcessingContext } from "./processingContext";

export function cleanupTempDir(context: ProcessingContext) {
  const { rootPath, tmpDir } = context;
  const files = walkDirSync(tmpDir, { nodir: true });
  for (const file of files) {
    moveSync(file.path, join(rootPath, basename(file.path)));
  }
}
