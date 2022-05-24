import { CsvService } from "../csvService";
import { join } from "path";
import { existsSync } from "fs";
import { removeSync } from "fs-extra";

const TestFileDir = join(__dirname, "./csv");
const TestFilePath = join(TestFileDir, "valid.nfts.csv");
const InvalidTestFilePath = join(TestFileDir, "invalid.nfts.csv");

describe("csvReader", () => {
  describe("init", () => {
    beforeEach(() => {
      removeSync(TestFilePath);
    });
    it("should initialize the csv file with a header", async () => {
      const service = new CsvService(TestFilePath);
      await service.init();
      expect(existsSync(TestFilePath)).toBeTruthy();
    });
  });
  describe("load", () => {
    beforeEach(() => {
      removeSync(TestFilePath);
    });
    it("should load the records of the csv file without any problem", async () => {
      const service = new CsvService(TestFilePath);
      let recordCount = 0;
      await service.init();
      await service.load((row) => {
        recordCount++;
      });
      expect(recordCount).toBe(3);
    });
    it("should throw detailed error on invalid file and bailout if no other option is given", async () => {
      const service = new CsvService(InvalidTestFilePath);
      let recordCount = 0;
      try {
        await service.load((row) => {});
        expect("Expected an error").toBeFalsy();
      } catch (e: any) {
        expect(e.message).toContain("price: type must be number");
      }
    });
    it("should not throw invalid file when no bailout", async () => {
      const service = new CsvService(InvalidTestFilePath);
      const errors: Error[] = [];
      try {
        await service.load((row) => {}, {
          onError: (e) => {
            errors.push(e);
          },
          stopOnError: false,
        });
      } catch (e: any) {
        expect(errors).toHaveLength(2);
        expect(e.message).toBe("Found 2 errors");
      }
    });
    it("should throw exception in record handler as expected", async () => {
      const service = new CsvService(TestFilePath);
      let recordCount = 0;
      await service.init();
      try {
        await service.load((row) => {
          if (recordCount++ === 2) {
            throw new Error("Test Error");
          }
        });
        expect("Expected an error").toBeFalsy();
      } catch (e: any) {
        expect(e.message).toContain("Test Error");
      }
    });
  });
});
