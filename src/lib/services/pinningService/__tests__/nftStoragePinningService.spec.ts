import { join } from "path";
import { NftStoragePinningService } from "../nftStoragePinningService";

const PinningKey = process.env.NFTSTORAGE_JWT || "";
jest.setTimeout(15_000);

describe("NftStoragePinningService", () => {
  describe("pinFile", () => {
    it("should pin json file as expected", async () => {
      const service = new NftStoragePinningService(PinningKey);
      const ipfsHash = await service.pinFile(join(__dirname, "test.json"), {});
      expect(ipfsHash.startsWith("baf")).toBeTruthy();
    });
  });
  it("should pin image file as expected", async () => {
    const service = new NftStoragePinningService(PinningKey);
    const ipfsHash = await service.pinFile(join(__dirname, "banner.jpg"), {});
    expect(ipfsHash.startsWith("baf")).toBeTruthy();
  });
});
