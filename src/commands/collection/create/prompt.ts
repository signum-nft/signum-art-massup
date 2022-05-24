import inquirer from "inquirer";
import { ListingType } from "@lib/listingType";

export interface CollectionCreateAnswers {
  name: string;
  description: string;
  homepage: string;
  socials: string;
  listing: ListingType;
}
export const prompt = async () => {
  return inquirer.prompt<CollectionCreateAnswers>([
    {
      type: "input",
      message: "What's the name of your awesome collection?",
      name: "name",
    },
    {
      type: "input",
      message:
        "Write a description that makes people really excited about your collection:",
      name: "description",
    },
    {
      type: "input",
      message:
        "Do you have a dedicated landing page for your collection? Enter here (or leave blank to skip):",
      default: "",
      name: "homepage",
    },
    {
      type: "input",
      message:
        "Do you have a dedicated social media channel? Enter here (or leave blank to skip):",
      default: "",
      name: "socials",
    },
  ]);
};
