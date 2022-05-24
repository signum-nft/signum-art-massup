import { PinataPinningService } from "../pinataPinningService";
import { join } from "path";

const PinataKey = process.env.PINATA_JWT || "";

describe("PinataPinningService", () => {
  describe("pinFile", () => {
    it("should pin file with meta data as expected", async () => {
      const service = new PinataPinningService(PinataKey);
      const ipfsHash = await service.pinFile(join(__dirname, "test.json"), {
        name: "test.json",
        keyvalues: {
          context: "test",
        },
      });
      expect(ipfsHash.startsWith("Qm")).toBeTruthy();
    });
  });
});
