import inquirer from "inquirer";

export interface CollectionTransferRoyaltiesAnswers {
  collectionId: string;
  newOwner: string;
}

export const prompt = async () => {
  return inquirer.prompt<CollectionTransferRoyaltiesAnswers>([
    {
      type: "input",
      message: "Enter the Collection Id:",
      name: "collectionId",
    },
    {
      type: "input",
      message: "Enter the new Royalty Owner Id or Address:",
      name: "newOwner",
    },
  ]);
};
