import { ProfileData } from "@lib/profileData";
import ora from "ora";
import { PinningServiceFactory } from "@lib/services/pinningService";
import { basename } from "path";
import { FileLoggingService } from "@lib/services/loggingService";

export async function pinBanner(
  profile: ProfileData,
  logger: FileLoggingService,
  ...files: string[]
) {
  logger.log("Pinning files...", files);
  const spinner = ora("Pinning Collection Banner").start();
  try {
    const service = PinningServiceFactory.getPinningService(profile);

    const pinningRequests = files.map((file) =>
      service.pinFile(file, { name: basename(file) })
    );
    const responses = await Promise.all(pinningRequests);

    logger.log("Successfully pinned", responses);
    spinner.succeed();
    return responses;
  } catch (e: any) {
    spinner.fail();
    throw e;
  }
}
