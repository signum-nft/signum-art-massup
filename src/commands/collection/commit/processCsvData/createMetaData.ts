import { basename, join } from "path";
import { writeJson } from "fs-extra";
import { ProcessingContext } from "./processingContext";

export async function createMetaData(context: ProcessingContext) {
  const { record, tmpDir, lineCount, imageFileMap, logger } = context;

  const filename = join(
    tmpDir,
    `${lineCount}`.padStart(5, "0") + "-record.json"
  );
  logger.log(`Creating Meta Data [${filename}]...`);

  const updatedImagePaths = imageFileMap.reduce((acc, { imageKey, path }) => {
    acc[imageKey] = basename(path);
    return acc;
  }, {} as any);

  const metadata = {
    ...record,
    ...updatedImagePaths,
  };
  await writeJson(filename, metadata, { spaces: 2 });
  return metadata;
}
