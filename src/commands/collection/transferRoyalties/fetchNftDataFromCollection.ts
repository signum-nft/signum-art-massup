import { HttpClientFactory } from "@signumjs/http";
import { ProfileData } from "@lib/profileData";
import pRetry from "p-retry";
import { LedgerService } from "@lib/services/ledgerService";

interface FetchNftIdsFromCollectionArgs {
  collectionId: string;
  profile: ProfileData;
  ledgerService?: LedgerService;
}

export interface FetchNftDataFromCollectionResult {
  collectionId: string;
  creatorId: string;
  nftIds: string[];
}

const NftServiceConstants = {
  "Signum Main Net": "https://signum-art-discovery-service.vercel.app",
  "Signum Test Net": "https://signum-art-discovery-service-test.vercel.app",
};

interface NftDataProxy {
  nftId: string;
}
interface QuerySearchResponse {
  _meta: {
    more: string;
  };
  data: NftDataProxy[];
}
export async function fetchNftDataFromCollection(
  args: FetchNftIdsFromCollectionArgs
) {
  const { collectionId, profile } = args;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const queryApiUrl = NftServiceConstants[profile.network];
  if (!queryApiUrl) {
    throw new Error(`Invalid Network found: ${profile.network}`);
  }
  const httpClient = HttpClientFactory.createHttpClient(queryApiUrl);

  const result: FetchNftDataFromCollectionResult = {
    collectionId,
    creatorId: profile.getAccountId(),
    nftIds: [] as string[],
  };
  let searchUrl = `/api/items?collectionId=${collectionId}&creatorId=${profile.getAccountId()}&p=100`;
  while (searchUrl) {
    const httpResponse = await pRetry(() => httpClient.get(searchUrl));
    if (httpResponse.status !== 200) {
      throw new Error("Fetching Collection Data Failed.");
    }
    const searchResponse = httpResponse.response as QuerySearchResponse;
    const nftIds = searchResponse.data.map((d) => d.nftId);
    result.nftIds.push(...nftIds);
    searchUrl = searchResponse._meta.more;
  }

  return result;
}
