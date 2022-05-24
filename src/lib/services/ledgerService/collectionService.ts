import {
  Address,
  AttachmentMessage,
  Transaction,
  TransactionArbitrarySubtype,
  TransactionType,
} from "@signumjs/core";
import { Amount } from "@signumjs/util";
import { InputValidationService } from "./inputValidationService";
import { Constants } from "./constants";
import { ServiceContext } from "./serviceContext";
import { MediaType } from "@lib/mediaType";
import { jsonValidator } from "@lib/ajv/jsonValidator";

export interface CreateCollectionArgs {
  name: string;
  description: string;
  background: MediaType;
  socialMediaImage: MediaType;
  homePage: string;
  socials: string;
}

export interface FetchCollectionResponse {
  name: string;
  description: string;
  background: MediaType;
  socialMediaImage: MediaType;
  homePage: string;
  socials: string;
}

export class CollectionService {
  constructor(private context: ServiceContext) {}

  async createCollection(args: CreateCollectionArgs): Promise<Transaction> {
    const descriptor = {
      nc: args.name,
      ds: args.description,
      si: {
        [args.socialMediaImage.ipfsHash]: args.socialMediaImage.mimeType,
      },
      bg: { [args.background.ipfsHash]: args.background.mimeType },
      hp: args.homePage,
      sc: args.socials,
    };

    jsonValidator.validateCollection(descriptor);
    args.homePage && InputValidationService.assertURL(args.homePage);
    args.socials && InputValidationService.assertURL(args.socials);

    const { profile, ledger } = this.context;

    const { publicKey, signPrivateKey } = profile.getKeys();

    return ledger.message.sendMessage({
      feePlanck: Amount.fromSigna(0.06).getPlanck(),
      senderPublicKey: publicKey,
      senderPrivateKey: signPrivateKey,
      message: JSON.stringify(descriptor),
      messageIsText: true,
      recipientId: Constants.Accounts.Collection,
      deadline: 60,
    });
  }

  private assertCorrectOwner(tx: Transaction) {
    const { publicKey } = this.context.profile.getKeys();
    if (publicKey !== tx.senderPublicKey) {
      throw new Error(
        "Permission denied! You are not the owner/creator of given collection"
      );
    }
  }

  async fetchCollection(
    collectionId: string
  ): Promise<FetchCollectionResponse> {
    const { ledger } = this.context;
    const transaction = await ledger.transaction.getTransaction(collectionId);
    this.assertCorrectOwner(transaction);

    const { attachment } = transaction;
    const data = new AttachmentMessage(attachment);
    const descriptor = JSON.parse(data.message);
    jsonValidator.validateCollection(descriptor);

    const toMediaType = (ds: any) => {
      if (!ds) {
        return {
          ipfsHash: "",
          mimeType: "",
        };
      }
      const [ipfsHash, mimeType] = Object.entries(ds)[0];
      return {
        ipfsHash,
        mimeType,
      } as MediaType;
    };

    return {
      name: descriptor.nc,
      description: descriptor.ds,
      socials: descriptor.sc,
      homePage: descriptor.hp,
      background: toMediaType(descriptor.bg),
      socialMediaImage: toMediaType(descriptor.si),
    };
  }
}
