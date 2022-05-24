import { calculateTimeoutFromDate } from "@lib/calculateTimeoutFromDate";
import { NftRecord } from "@lib/services/csvService";
import { LedgerService } from "@lib/services/ledgerService";

interface CreateNftArgs {
  metaData: {
    ipfsHash: string;
    nftRecord: NftRecord;
  };
  ledgerService: LedgerService;
}

export async function mintNft(args: CreateNftArgs) {
  const { metaData, ledgerService } = args;
  const nftData = metaData.nftRecord;
  return ledgerService.nft.createNft({
    auctionTimeout: nftData.auctionEnd
      ? calculateTimeoutFromDate(nftData.auctionEnd)
      : undefined,
    auxPrice: String(nftData.offerPrice || ""),
    price: String(nftData.price || ""),
    royaltiesFee: nftData.royalties,
    status: nftData.listingMode,
    descriptorCid: metaData.ipfsHash,
  });
}
