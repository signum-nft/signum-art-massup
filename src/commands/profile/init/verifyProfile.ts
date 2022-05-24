import { generateMasterKeys } from "@signumjs/crypto";
import { Account, Address } from "@signumjs/core";
import ora, { Ora } from "ora";
import { createNetworkClient } from "@lib/networks";
import { jsonValidator } from "@lib/ajv/jsonValidator";

export interface ProfileDescriptor {
  nm: string;
  ds: string;
  sc: string; // comma separated
  av: string; // cid:mime
  bg: string; // cid:mime
  hp: string;
  tw: string;
}

function validateProfileData(account: Account): ProfileDescriptor {
  const descriptor = JSON.parse(account.description);
  jsonValidator.validateProfile(descriptor);
  return descriptor as unknown as ProfileDescriptor;
}

export const verifyProfile = async (networkName: string, seed: any) => {
  let spinner: Ora | null = null;
  try {
    spinner = ora("Selecting best host").start();
    const ledger = await createNetworkClient(networkName);
    const networkInfo = await ledger.network.getNetworkInfo();
    spinner.succeed();
    console.info("Selected Host", ledger.service.settings.nodeHost);
    const { publicKey } = generateMasterKeys(seed);
    const address = Address.fromPublicKey(publicKey, networkInfo.addressPrefix);

    spinner = ora(
      `Verifying account [${address.getReedSolomonAddress()}]`
    ).start();
    const account = await ledger.account.getAccount({
      accountId: address.getNumericId(),
      includeCommittedAmount: false,
      includeEstimatedCommitment: false,
    });
    // @ts-ignore
    if (account.publicKey && !account.publicKey.startsWith("00000000000000")) {
      spinner.succeed();
    } else {
      throw new Error("Account not found");
    }
    const profileData = validateProfileData(account);

    return {
      address,
      name: profileData.nm,
      description: profileData.ds,
    };
  } catch (e: any) {
    spinner && spinner.fail(e.message);
    console.error("Profile could not be verified!");
    throw e;
  }
};
