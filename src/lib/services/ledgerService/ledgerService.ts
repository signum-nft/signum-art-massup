import { Ledger } from "@signumjs/core";
import { NftService } from "./nftService";
import { CollectionService } from "./collectionService";
import { ProfileData } from "@lib/profileData";
import { Amount } from "@signumjs/util";
import { ContractList } from "@signumjs/core/out/typings/contractList";

const MachineCodeHashSRC40 = "15155055045342098571";

export class LedgerService {
  private readonly nftService: NftService;
  private readonly collectionService: CollectionService;

  constructor(private ledger: Ledger, private profile: ProfileData) {
    const context = {
      ledger,
      profile,
    };

    this.nftService = new NftService(context);
    this.collectionService = new CollectionService(context);
  }

  get nft(): NftService {
    return this.nftService;
  }

  get collection(): CollectionService {
    return this.collectionService;
  }

  private getChainExplorerHost(): string {
    return this.profile.network !== "Signum Main Net"
      ? "https://t-chain.signum.network"
      : "https://chain.signum.network";
  }

  getChainExplorerLinkForAddress(accountId: string): string {
    return this.getChainExplorerHost() + `/address/${accountId}`;
  }

  getChainExplorerLinkForTx(transactionId: string): string {
    return this.getChainExplorerHost() + `/tx/${transactionId}`;
  }

  async getAvailableBalance(): Promise<Amount> {
    const { unconfirmedBalanceNQT } =
      await this.ledger.account.getAccountBalance(this.profile.getAccountId());
    return Amount.fromPlanck(unconfirmedBalanceNQT);
  }
}
