import { Ledger } from "@signumjs/core";
import { ProfileData } from "@lib/profileData";

export interface ServiceContext {
  readonly ledger: Ledger;
  readonly profile: ProfileData;
}
