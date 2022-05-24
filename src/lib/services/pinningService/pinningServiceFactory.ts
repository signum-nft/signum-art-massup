import { ProfileData } from "@lib/profileData";
import { PinningService } from "./pinningService";
import { NftStoragePinningService } from "./nftStoragePinningService";
import { PinataPinningService } from "./pinataPinningService";
import { MockPinningService } from "@lib/services/pinningService/mockPinningService";

export class PinningServiceFactory {
  static getPinningService(profile?: ProfileData): PinningService {
    if (!profile) {
      return new MockPinningService();
    }

    switch (profile.pinningService) {
      case "NFT.Storage":
        return new NftStoragePinningService(profile.pinningKey);
      case "Pinata":
        return new PinataPinningService(profile.pinningKey);
      default:
        throw new Error(`Unknown Pinning Service: ${profile.pinningService}`);
    }
  }
}
