import { extname, join } from "path";
import { copyFile } from "fs-extra";
import { ProcessingContext } from "./processingContext";

export async function copyImageFiles(context: ProcessingContext) {
  const { tmpDir, record, lineCount, logger } = context;

  const filenameBase = join(tmpDir, `${lineCount}`.padStart(5, "0"));

  const copy = async (file: string, count: 1 | 2 | 3) => {
    const imageExtension = extname(file);
    const destFile = `${filenameBase}.${count}${imageExtension}`;
    // logger.log(`Copying image file ${file} to ${destFile}`);
    await copyFile(file, destFile);
    return {
      imageKey: `image${count}`,
      path: destFile,
    };
  };

  const promises = [];
  if (record.image1) {
    promises.push(copy(record.image1, 1));
  }
  if (record.image2) {
    promises.push(copy(record.image2, 2));
  }
  if (record.image3) {
    promises.push(copy(record.image3, 3));
  }
  return Promise.all(promises);
}
