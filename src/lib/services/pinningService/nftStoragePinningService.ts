import { PinningService } from "./pinningService";
import { HttpError } from "@signumjs/http";
import { readFileSync } from "fs";
import pRetry, { AbortError } from "p-retry";
import { basename } from "path";
import fetch from "node-fetch";
import pThrottle from "p-throttle";

export class NftStoragePinningService implements PinningService {
  private readonly endpoint: string;
  constructor(private jwtToken: string) {
    this.endpoint = "https://api.nft.storage";
  }

  async testAuthentication(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/?limit=1`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.jwtToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async pinFile(filePath: string): Promise<string> {
    const pin = async () => {
      try {
        const file = readFileSync(filePath);
        const filename = basename(filePath);
        const contentType = filename.endsWith(".json")
          ? "application/json"
          : "image/*";

        const url = `${this.endpoint}/upload`;
        const response = await fetch(url, {
          method: "POST",
          body: file,
          headers: {
            Accept: "application/json",
            "Content-Type": contentType,
            Authorization: `Bearer ${this.jwtToken}`,
          },
        });

        if (!response.ok) {
          throw new HttpError(url, response.status, response.statusText, {
            filename,
          });
        }

        const data = await response.json();
        return data.value.cid;
      } catch (e: any) {
        if (e instanceof HttpError) {
          console.error(
            "NFT.Storage API Error",
            "Status:",
            e.status,
            "Reason:",
            e.data
          );
          if (e.status === 401 || e.status === 403) {
            throw new AbortError(e.data);
          } else {
            throw new Error(e.data);
          }
        } else {
          console.error("NFT.Storage Pinning Service Error", e.message);
          throw e;
        }
      }
    };

    // see: https://docs.pinata.cloud/rate-limits#api-rate-limits
    const throttle = pThrottle({ limit: 30, interval: 10_000 });
    const throttlePin = throttle(pin);
    return pRetry(() => throttlePin(), {
      retries: 5,
      onFailedAttempt: (error) => {
        if (error.retriesLeft) {
          console.log(
            `Attempt pinning [${basename(filePath)}] failed. Retrying...`
          );
        }
      },
    });
  }
}
