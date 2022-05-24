import path from "path";
import { pathExists, remove, writeFile, readFile } from "fs-extra";
import { deriveKey } from "@lib/deriveKey";
import {
  decryptAES,
  encryptAES,
  generateMasterKeys,
  Keys,
} from "@signumjs/crypto";
import { Address } from "@signumjs/core";

const userDataPath = path.join(__dirname, "../../", "profile.dat");

export class ProfileData {
  public seed = "";
  public pinningService = "";
  public pinningKey = "";
  public network = "";
  public address = "";
  public name = "";
  public description = "";

  static async reset() {
    await remove(userDataPath);
  }

  async save(pin: string) {
    const { salt, derivedKey } = deriveKey(pin);

    const data = JSON.stringify({
      seed: this.seed,
      pinningService: this.pinningService,
      pinningKey: this.pinningKey,
      network: this.network,
      address: this.address,
      name: this.name,
      description: this.description,
    });

    await writeFile(userDataPath, salt + "." + encryptAES(data, derivedKey), {
      encoding: "utf-8",
    });
  }

  static async exists(): Promise<boolean> {
    return pathExists(userDataPath);
  }

  async load(pin: string) {
    const fileData = await readFile(userDataPath, { encoding: "utf-8" });
    const [salt, cipher] = fileData.split(".");
    const { derivedKey } = deriveKey(pin, salt);
    const stringifiedJson = decryptAES(cipher, derivedKey);
    const json = JSON.parse(stringifiedJson);
    this.seed = json.seed;
    this.pinningService = json.pinningService;
    this.pinningKey = json.pinningKey;
    this.network = json.network;
    this.address = json.address;
    this.name = json.name;
    this.description = json.description;
  }

  static async load(pin: string): Promise<ProfileData> {
    const userData = new ProfileData();
    await userData.load(pin);
    return userData;
  }

  getKeys(): Keys {
    return generateMasterKeys(this.seed);
  }

  getAccountId(): string {
    const { publicKey } = this.getKeys();
    return Address.fromPublicKey(publicKey).getNumericId();
  }

  getAddress(): string {
    const { publicKey } = this.getKeys();
    return Address.fromPublicKey(publicKey).getReedSolomonAddress(false);
  }

  print(): void {
    console.table({
      Network: this.network,
      Account: this.address,
      Name: this.name,
      Description: this.description,
    });
  }
}
