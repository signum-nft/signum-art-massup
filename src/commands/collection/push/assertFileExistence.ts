import { existsSync } from "fs";
import { join } from "path";

export function assertFileExistence(basename: string) {
  const path = join(process.cwd(), basename);
  if (!existsSync(join(process.cwd(), basename))) {
    console.warn(`Cannot find [${basename}] file in the current folder.`);
    console.info("Please, change to the desired collection folder,");
    console.info("or create a new collection with [collection create],");
    console.info("or continue a new collection with [collection pull]");
    throw new Error(`File not found: ${path}`);
  }
}
