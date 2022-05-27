import { PinningService } from "./pinningService";
import { randomUUID } from "crypto";
import { sleep } from "@lib/sleep";

export class MockPinningService implements PinningService {
  async pinFile(filePath: string, metadata: unknown): Promise<string> {
    await sleep(250);
    return randomUUID();
  }

  testAuthentication(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
