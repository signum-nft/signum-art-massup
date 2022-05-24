import { PinningService } from "./pinningService";
import { Http, HttpClientFactory, HttpError } from "@signumjs/http";
import { createReadStream } from "fs";
import FormData from "form-data";
import pRetry, { AbortError } from "p-retry";
import { basename } from "path";
import pThrottle from "p-throttle";

export class PinataPinningService implements PinningService {
  private http: Http;

  constructor(private jwtToken: string) {
    this.http = HttpClientFactory.createHttpClient("https://api.pinata.cloud", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  async pinFile(filePath: string, metadata: unknown): Promise<string> {
    const formData = new FormData();
    formData.append("file", createReadStream(filePath));
    formData.append("pinataMetadata", JSON.stringify(metadata));
    const pin = async () => {
      try {
        const { response } = await this.http.post(
          "/pinning/pinFileToIPFS",
          formData,
          {
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            headers: {
              Authorization: `Bearer ${this.jwtToken}`,
              // @ts-ignore
              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            },
          }
        );

        return response.IpfsHash;
      } catch (e: any) {
        if (e instanceof HttpError) {
          console.error(
            "Pinata API Error",
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
          console.error("Pinata Pinning Service Error", e.message);
          throw e;
        }
      }
    };

    // see: https://docs.pinata.cloud/rate-limits#api-rate-limits
    const throttle = pThrottle({ limit: 180, interval: 60_000 });
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
