import { Address, Transaction } from "@signumjs/core";
import { Amount } from "@signumjs/util";
import { ContractData } from "@signumjs/contracts";
import { InputValidationService } from "./inputValidationService";
import { Constants } from "./constants";
import { ServiceContext } from "@lib/services/ledgerService/serviceContext";
import { convertToContractBlockheight } from "@lib/services/ledgerService/convertToContractBlockheight";
import { ListingType } from "@lib/listingType";
import pRetry from "p-retry";

const NftConstants = {
  Methods: {
    TransferRoyalties: "7174296962751784077",
  },
  Fees: {
    Interaction: Amount.fromSigna(0.01),
    Activation: Amount.fromSigna(0.3),
  },
};

interface CreateNftArgs {
  descriptorCid: string;
  auctionTimeout?: number; // minutes
  royaltiesFee: number; // promille
  price?: string; // signa
  auxPrice?: string; // signa - reserve for dutch, or offer for auction
  dutchPriceDrop?: string; // signa
  status: ListingType;
}

export class NftService {
  private readonly accountPublicKey: string;
  private readonly accountSignKey: string;

  constructor(private context: ServiceContext) {
    const { publicKey, signPrivateKey } = context.profile.getKeys();
    this.accountPublicKey = publicKey;
    this.accountSignKey = signPrivateKey;
  }

  private async createInitialDataStack(args: CreateNftArgs) {
    const { blocks } = await pRetry(() =>
      this.context.ledger.block.getBlocks(0, 1)
    );
    const currentBlockHeight = blocks[0].height;

    const safeAmount = (amount = "0") =>
      amount ? Amount.fromSigna(amount).getPlanck() : "0";

    /*
     * This creates the initial data stack based on this contract:
     * https://github.com/signum-network/signum-smartj/blob/master/src/main/java/bt/dapps/SignumArt2.java
     *
     * 0 - {Address} owner
     * 1 - {long} status
     * 2 - {long} currentPrice
     * 3 - {Address} platformAddress
     * 4 - {long} platformFee
     * 5 - {long} royaltiesFee
     * 6 - {Address} royaltiesOwner
     * 7 	 {Address} trackSetNotForSale;
     * 8 	 {Address} trackSetForSale;
     * 9 	 {Address} trackAuctionOpened;
     * 10 - {Address} trackNewAuctionBid;
     * 11 - {Address} trackNewOwner;
     * 12 	 {Address} trackOwnershipTransferred;
     * 13 	 {Address} trackDutchAuctionOpened;
     * 14 	 {Address} trackOfferReceived;
     * 15 	 {Address} trackOfferRemoved;
     * 16 	 {Address} trackLikeReceived;
     * 17 	 {Address} trackRoyaltiesTransfer;
     * 18 - {Address} auctionTimeout
     * 19 - {Address} highestBidder
     * 20 - {long} auctionMaxPrice
     * 21 - {Address} offerAddress
     * 22 - {long} offerPrice
     * 23 - {long} duchStartHeight
     * 24 - {long} startPrice
     * 25 - {long} priceDropPerBlock
     * 26 - {long} reservePrice
     */
    const {
      status,
      royaltiesFee,
      auctionTimeout = 0,
      price,
      auxPrice,
      dutchPriceDrop,
    } = args;
    const ownerId = Address.fromPublicKey(this.accountPublicKey).getNumericId();
    const statusCode = NftService.asStatusCode(status);
    const currentPrice = safeAmount(price);
    const platformAddress = Constants.Accounts.PlatformFee;
    const platformFee = Constants.ServiceFee;
    const royaltiesOwner = ownerId;
    const royaltiesFeePromille = royaltiesFee * 10;

    const trackerAccountSetNotForSale =
      Constants.Accounts.NftTrackSetNotForSale;
    const trackerAccountSetForSale = Constants.Accounts.NftTrackSetForSale;
    const trackerAccountAuctionOpened =
      Constants.Accounts.NftTrackAuctionOpened;
    const trackerAccountNewAuctionBid = Constants.Accounts.NftTrackAuctionBid;
    const trackerAccountNewOwner = Constants.Accounts.NftTrackNewOwner;
    const trackerAccountOwnershipTransferred =
      Constants.Accounts.NftTrackOwnershipTransferred;
    const trackerAccountDutchAuctionOpened =
      Constants.Accounts.NftTrackDutchAuctionOpened;
    const trackerAccountOfferReceived =
      Constants.Accounts.NftTrackOfferReceived;
    const trackerAccountOfferRemoved = Constants.Accounts.NftTrackOfferRemoved;
    const trackerAccountLikeReceived = Constants.Accounts.NftTrackLikeReceived;
    const trackerAccountRoyaltiesTransfer =
      Constants.Accounts.NftTrackRoyaltiesTransferred;

    // auction
    const auctionStopHeight = NftService.calculateTimeoutValue(
      auctionTimeout,
      currentBlockHeight
    );
    const auctionMaxPrice = safeAmount(dutchPriceDrop ? "0" : auxPrice);

    // dutch auction
    const dutchStartHeight = dutchPriceDrop ? currentBlockHeight : "0";
    const dutchStartPrice = dutchPriceDrop ? currentPrice : "0";
    const dutchMinPrice = safeAmount(dutchPriceDrop ? auxPrice : "0");
    const dutchPriceDropPerBlock = safeAmount(dutchPriceDrop);

    const SkipValue = 0;

    // order is important - DO NOT CHANGE
    return [
      ownerId,
      statusCode,
      currentPrice,
      platformAddress,
      platformFee,
      royaltiesFeePromille,
      royaltiesOwner,
      trackerAccountSetNotForSale,
      trackerAccountSetForSale,
      trackerAccountAuctionOpened,
      trackerAccountNewAuctionBid,
      trackerAccountNewOwner,
      trackerAccountOwnershipTransferred,
      trackerAccountDutchAuctionOpened,
      trackerAccountOfferReceived,
      trackerAccountOfferRemoved,
      trackerAccountLikeReceived,
      trackerAccountRoyaltiesTransfer,
      auctionStopHeight,
      SkipValue, // highest bidder,
      auctionMaxPrice,
      SkipValue, // offer address
      SkipValue, // offer price
      dutchStartHeight,
      dutchStartPrice,
      dutchPriceDropPerBlock,
      dutchMinPrice,
    ] as ContractData[];
  }

  private static assertValidData(args: CreateNftArgs) {
    const {
      price = "0",
      auctionTimeout,
      royaltiesFee,
      status,
      dutchPriceDrop,
    } = args;

    InputValidationService.assertNumberLessOrEqualThan(
      Constants.Contract.MaximumRoyaltyFee,
      royaltiesFee * 10
    );

    if (status !== "NotForSale") {
      InputValidationService.assertAmountGreaterOrEqualThan(
        Amount.fromSigna(Constants.Contract.MinimumSellAmount),
        Amount.fromSigna(price)
      );
    }

    if (dutchPriceDrop) {
      InputValidationService.assertAmountGreaterOrEqualThan(
        Amount.fromSigna(Constants.Contract.MinimumPriceDrop),
        Amount.fromSigna(dutchPriceDrop)
      );
    }

    if (status === "OnAuction") {
      InputValidationService.assertNumberBetween(
        Constants.Contract.AuctionTimeoutMinimum,
        Constants.Contract.AuctionTimeoutMaximum,
        auctionTimeout!
      );
    }
  }

  async createNft(args: CreateNftArgs): Promise<Transaction> {
    NftService.assertValidData(args);

    const { ledger, profile } = this.context;
    const { Contract } = Constants;

    const referencedTransactionHash =
      profile.network === "Signum Main Net"
        ? Contract.Reference.MainNet
        : Contract.Reference.Testnet;
    const activationAmountPlanck = Amount.fromSigna(
      Contract.ActivationCosts
    ).getPlanck();
    const data = await this.createInitialDataStack(args);

    const description = JSON.stringify({
      version: 1,
      descriptor: args.descriptorCid,
    });

    return pRetry(() =>
      ledger.contract.publishContractByReference({
        senderPublicKey: this.accountPublicKey,
        senderPrivateKey: this.accountSignKey,
        description,
        feePlanck: "40000000",
        referencedTransactionHash,
        activationAmountPlanck,
        name: Contract.BaseName,
        data,
      })
    );
  }

  async transferRoyalties(nftId: string, newOwnerAccountId: string) {
    const { ledger } = this.context;
    return pRetry(() =>
      ledger.contract.callContractMethod({
        senderPublicKey: this.accountPublicKey,
        senderPrivateKey: this.accountSignKey,
        feePlanck: NftConstants.Fees.Interaction.getPlanck(),
        amountPlanck: NftConstants.Fees.Activation.getPlanck(),
        contractId: nftId,
        methodHash: NftConstants.Methods.TransferRoyalties,
        methodArgs: [newOwnerAccountId],
      })
    );
  }

  private static calculateTimeoutValue(
    timeout: number | undefined,
    currentBlockHeight: number
  ) {
    if (!timeout) return "0";
    const targetBlockHeight = currentBlockHeight + Math.floor(timeout / 4);
    return convertToContractBlockheight(targetBlockHeight);
  }

  private static asStatusCode(status: ListingType): number {
    switch (status) {
      case "NotForSale":
        return 0;
      case "FixedPrice":
        return 1;
      case "OnAuction":
        return 2;
    }
  }
}
