import inquirer from "inquirer";
import { Networks } from "@lib/networks";
import { PinataPinningService } from "@lib/services/pinningService/pinataPinningService";
import { NftStoragePinningService } from "@lib/services/pinningService/nftStoragePinningService";
import { PinningService } from "@lib/services/pinningService/pinningService";
import { PinningServiceFactory } from "@lib/services/pinningService";

interface Answers {
  pinningService: "Pinata" | "NFT.Storage";
  pinningKey: string;
}

interface ProfileAnswers {
  seed: string;
  network: string;
  pin: string;
  confirmedPin: string;
}

export const promptProfile = async () => {
  return inquirer.prompt<ProfileAnswers>([
    {
      type: "list",
      message: "Please select a network:",
      choices: Networks.map(({ name }) => name),
      name: "network",
    },
    {
      type: "input",
      message: "Please enter your passphrase:",
      name: "seed",
    },
    {
      type: "password",
      message: "Please enter a personal PIN to secure your secrets:",
      name: "pin",
    },
    {
      type: "password",
      message: "Please confirm your PIN:",
      name: "confirmedPin",
      validate(input: any, answers: ProfileAnswers) {
        return input === answers.pin ? true : "PINs do not match";
      },
    },
  ]);
};

export const promptPinning = async () => {
  return inquirer.prompt<Answers>([
    {
      type: "list",
      message: "Which Pinning Service do you use?",
      choices: ["Pinata", "NFT.Storage"],
      name: "pinningService",
    },
    {
      type: "input",
      message: "Please enter your Pinning API Key (JWT):",
      name: "pinningKey",
      validate(pinningKey: string, answers: Answers) {
        return new Promise((resolve, reject) => {
          let service;
          if (answers.pinningService === "Pinata") {
            service = new PinataPinningService(pinningKey);
          } else if (answers.pinningService === "NFT.Storage") {
            service = new NftStoragePinningService(pinningKey);
          } else {
            return reject("WTF?");
          }
          service.testAuthentication().then((result) => {
            if (result) {
              resolve(true);
            } else {
              resolve("Invalid Key");
            }
          });
        });
      },
    },
  ]);
};
