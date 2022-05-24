import { LedgerService } from "@lib/services/ledgerService";
import { Amount } from "@signumjs/util";

export async function assertSufficientBalance(
  ledgerService: LedgerService,
  estimatedCosts: Amount
): Promise<Amount> {
  const balance = await ledgerService.getAvailableBalance();
  if (balance.less(estimatedCosts)) {
    throw new Error(
      `You have only ${balance.toString()} but need ${estimatedCosts.toString()} to upload the entire collection`
    );
  }
  return balance.subtract(estimatedCosts);
}
